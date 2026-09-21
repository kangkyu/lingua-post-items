import prisma from '../lib/prisma.js';
import { serializePassage } from '../lib/serialize.js';

/**
 * GET /works/:id
 * GET /works/:id?targetLanguage=ko
 *
 * A work with its passages in reading order. Passages with no translation are
 * included -- an untranslated passage is an invitation, not an absence.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { id, targetLanguage } = req.query;

  try {
    const work = await prisma.work.findUnique({
      where: { id: parseInt(id) },
      include: {
        passages: {
          orderBy: { position: 'asc' },
          include: {
            translations: {
              where: targetLanguage ? { targetLanguage } : undefined,
              orderBy: { createdAt: 'asc' },
              include: {
                translator: { select: { id: true, name: true, email: true } },
                _count: { select: { comments: true } },
              },
            },
          },
        },
      },
    });

    if (!work) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Work not found' }));
    }

    const passages = work.passages.map(serializePassage);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: work.id,
      title: work.title,
      language: work.language,
      passageCount: passages.length,
      translatedCount: passages.filter((p) => p.translations.length > 0).length,
      passages,
    }));
  } catch (error) {
    console.error('Error fetching work:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch work' }));
  }
}
