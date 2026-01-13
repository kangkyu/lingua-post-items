import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  const authResult = await authenticateUser(req, res);

  if (authResult.error) {
    res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: authResult.error }));
    return;
  }

  const user = authResult.user;
  const bookmarkId = parseInt(req.params.id);

  if (req.method === 'DELETE') {
    try {
      // Find bookmark and verify ownership
      const bookmark = await prisma.bookmark.findUnique({
        where: { id: bookmarkId }
      });

      if (!bookmark) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bookmark not found' }));
        return;
      }

      if (bookmark.userId !== user.id) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not authorized to delete this bookmark' }));
        return;
      }

      await prisma.bookmark.delete({
        where: { id: bookmarkId }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deletedId: bookmarkId }));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to delete bookmark' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'DELETE' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
