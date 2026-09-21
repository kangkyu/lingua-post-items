import prisma from '../lib/prisma.js';

/**
 * GET /works
 * GET /works?targetLanguage=ko
 *
 * Lists source texts. With targetLanguage, translatedCount reports how many of
 * the work's passages have at least one translation in that language, so a
 * client can show how far along a book is.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'GET' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { targetLanguage } = req.query;

  try {
    const works = await prisma.work.findMany({
      include: {
        passages: {
          select: {
            id: true,
            translations: {
              where: targetLanguage ? { targetLanguage } : undefined,
              select: { id: true },
            },
          },
        },
      },
      orderBy: { title: 'asc' },
    });

    const response = works.map((work) => {
      const translated = work.passages.filter((p) => p.translations.length > 0);
      return {
        id: work.id,
        title: work.title,
        language: work.language,
        passageCount: work.passages.length,
        translatedCount: translated.length,
        translationCount: work.passages.reduce((n, p) => n + p.translations.length, 0),
        createdAt: work.createdAt,
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching works:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch works' }));
  }
}
