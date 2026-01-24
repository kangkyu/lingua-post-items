import prisma from '../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const userId = req.params.id;

  if (!userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'User ID is required' }));
    return;
  }

  try {
    // Get user with stats (public profile - no email)
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            translations: true,
            books: true
          }
        }
      }
    });

    if (!userData) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }

    // Get recent translations with book info
    const recentTranslations = await prisma.translation.findMany({
      where: { translatorId: userId },
      include: {
        book: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const response = {
      user: {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        createdAt: userData.createdAt
      },
      stats: {
        translationsCount: userData._count.translations,
        booksCount: userData._count.books
      },
      recentTranslations: recentTranslations.map(t => ({
        id: t.id,
        originalText: t.originalText,
        translatedText: t.translatedText,
        sourceLanguage: t.sourceLanguage,
        targetLanguage: t.targetLanguage,
        createdAt: t.createdAt,
        book: t.book
      }))
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch profile data' }));
  }
}
