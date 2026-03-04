import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const translationId = parseInt(req.query.translationId);

      const comments = await prisma.comment.findMany({
        where: { translationId },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(comments));
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch comments' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
