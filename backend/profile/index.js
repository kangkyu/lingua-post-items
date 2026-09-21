import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';
import { translationInclude, serializeTranslation } from '../lib/serialize.js';

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
            bookmarks: true
          }
        }
      }
    });

    const recentTranslations = await prisma.translation.findMany({
      include: translationInclude,
      where: { translatorId: user.id },
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
        bookmarksCount: userData._count.bookmarks
      },
      recentTranslations: recentTranslations.map(serializeTranslation)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch profile data' }));
  }
}
