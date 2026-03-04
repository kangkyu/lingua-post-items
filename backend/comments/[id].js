import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const authResult = await authenticateUser(req);
    if (authResult.error) {
      res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: authResult.error }));
    }
    const user = authResult.user;

    try {
      const commentId = parseInt(req.query.id);

      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Comment not found' }));
      }

      if (comment.userId !== user.id) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not authorized to delete this comment' }));
      }

      await prisma.comment.delete({ where: { id: commentId } });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Comment deleted' }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to delete comment' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'DELETE' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
