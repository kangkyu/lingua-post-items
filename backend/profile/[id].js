import prisma from '../lib/prisma.js';
import { translationInclude, serializeTranslation } from '../lib/serialize.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const userId = parseInt(req.query.id);

  if (!userId || isNaN(userId)) {
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
            translations: true
          }
        }
      }
    });

    if (!userData) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }

    const recentTranslations = await prisma.translation.findMany({
      include: translationInclude,
      where: { translatorId: userId },
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
        translationsCount: userData._count.translations
      },
      recentTranslations: recentTranslations.map(serializeTranslation)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch profile data' }));
  }
}
