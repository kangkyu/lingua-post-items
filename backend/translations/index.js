import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const translationCount = await prisma.translation.count();

      if (translationCount === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }

      const translations = await prisma.translation.findMany({
        include: {
          translator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          bookmarks: {
            select: {
              id: true
            }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const transformedTranslations = translations.map(translation => ({
        id: translation.id,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        sourceName: translation.sourceName,
        context: translation.context,
        chapter: translation.chapter,
        pageNumber: translation.pageNumber,
        createdAt: translation.createdAt,
        createdBy: translation.translator.name || 'Anonymous',
        translatorId: translation.translator.id,
        createdDate: translation.createdAt.toLocaleDateString(),
        likesCount: 0, // TODO: Implement likes system
        commentsCount: translation._count.comments,
        tags: [translation.sourceLanguage, translation.targetLanguage]
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transformedTranslations));
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch translations' }));
    }
  } else if (req.method === 'POST') {
    const authResult = await authenticateUser(req, res);

    if (authResult.error) {
      res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: authResult.error }));
      return;
    }

    const user = authResult.user;

    try {
      const {
        originalText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        sourceName,
        context,
        chapter,
        pageNumber
      } = req.body;

      if (!originalText || !translatedText || !targetLanguage) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Missing required fields: originalText, translatedText, and targetLanguage are required'
        }));
        return;
      }

      const translation = await prisma.translation.create({
        data: {
          originalText,
          translatedText,
          sourceLanguage: sourceLanguage || 'en',
          targetLanguage,
          sourceName: sourceName || null,
          context,
          chapter,
          pageNumber: pageNumber ? parseInt(pageNumber) : null,
          translatorId: user.id
        },
        include: {
          translator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      const response = {
        id: translation.id,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        sourceName: translation.sourceName,
        context: translation.context,
        chapter: translation.chapter,
        pageNumber: translation.pageNumber,
        createdAt: translation.createdAt,
        createdBy: translation.translator.name || translation.translator.email,
        createdDate: translation.createdAt.toLocaleDateString()
      };

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error creating translation:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create translation' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET, POST' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
