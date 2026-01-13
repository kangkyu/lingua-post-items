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
      const { translationId } = req.query;

      if (!translationId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'translationId is required' }));
        return;
      }

      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: user.id,
          translationId: parseInt(translationId)
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        isBookmarked: !!bookmark,
        bookmark: bookmark || null
      }));
    } catch (error) {
      console.error('Error checking translation bookmark:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to check translation bookmark' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
