import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const authResult = await authenticateUser(req, res);

  if (authResult.error) {
    res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: authResult.error }));
    return;
  }

  const user = authResult.user;

  try {
    // Get user with stats
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            translations: true,
            books: true,
            bookmarks: true
          }
        }
      }
    });

    // Get recent translations with book info
    const recentTranslations = await prisma.translation.findMany({
      where: { translatorId: user.id },
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
        email: userData.email,
        avatar: userData.avatar,
        createdAt: userData.createdAt
      },
      stats: {
        translationsCount: userData._count.translations,
        booksCount: userData._count.books,
        bookmarksCount: userData._count.bookmarks
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
    console.error('Error fetching profile:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch profile data' }));
  }
}
