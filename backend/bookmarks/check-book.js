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

  if (req.method === 'GET') {
    try {
      const { bookId } = req.query;

      if (!bookId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'bookId is required' }));
        return;
      }

      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: user.id,
          bookId: parseInt(bookId)
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isBookmarked: !!bookmark,
        bookmark: bookmark || null
      }));
    } catch (error) {
      console.error('Error checking book bookmark:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to check book bookmark' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
