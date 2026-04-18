import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const translation = await prisma.translation.findUnique({
        where: { id: parseInt(id) },
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

      if (!translation) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Translation not found' }));
        return;
      }

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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error fetching translation:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch translation' }));
    }
  } else if (req.method === 'PUT') {
    const authResult = await authenticateUser(req, res);

    if (authResult.error) {
      res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: authResult.error }));
      return;
    }

    const user = authResult.user;

    try {
      const existingTranslation = await prisma.translation.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingTranslation) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Translation not found' }));
        return;
      }

      if (existingTranslation.translatorId !== user.id) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'You can only edit your own translations' }));
        return;
      }

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

      const translation = await prisma.translation.update({
        where: { id: parseInt(id) },
        data: {
          originalText,
          translatedText,
          sourceLanguage: sourceLanguage || 'en',
          targetLanguage,
          sourceName: sourceName || null,
          context,
          chapter,
          pageNumber: pageNumber ? parseInt(pageNumber) : null
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error updating translation:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to update translation' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET, PUT' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
