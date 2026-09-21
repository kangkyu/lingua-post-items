import prisma from '../lib/prisma.js';
import { serializePassage } from '../lib/serialize.js';

/**
 * GET /passages/:id -- a source passage and every rendering of it. This is
 * what the Share form loads when someone sets out to translate a passage that
 * has no translation yet.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { id } = req.query;

  try {
    const passage = await prisma.passage.findUnique({
      where: { id: parseInt(id) },
      include: {
        work: true,
        translations: {
          orderBy: { createdAt: 'asc' },
          include: {
            translator: { select: { id: true, name: true, email: true } },
            _count: { select: { comments: true } },
          },
        },
      },
    });

    if (!passage) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Passage not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...serializePassage(passage),
      work: {
        id: passage.work.id,
        title: passage.work.title,
        language: passage.work.language,
      },
    }));
  } catch (error) {
    console.error('Error fetching passage:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch passage' }));
  }
}
