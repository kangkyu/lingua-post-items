import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const authResult = await authenticateUser(req);
    if (authResult.error) {
      res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: authResult.error }));
    }
    const user = authResult.user;

    try {
      const { translationId, text } = req.body;

      if (!translationId || !text || !text.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'translationId and non-empty text are required' }));
      }

      const translation = await prisma.translation.findUnique({
        where: { id: parseInt(translationId) }
      });

      if (!translation) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Translation not found' }));
      }

      const comment = await prisma.comment.create({
        data: {
          text: text.trim(),
          userId: user.id,
          translationId: parseInt(translationId)
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(comment));
    } catch (error) {
      console.error('Error creating comment:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create comment' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'POST' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
