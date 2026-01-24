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
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverImage: true
            }
          },
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
        context: translation.context,
        chapter: translation.chapter,
        pageNumber: translation.pageNumber,
        createdAt: translation.createdAt,
        bookTitle: translation.book.title,
        author: translation.book.author,
        bookId: translation.book.id,
        coverImage: translation.book.coverImage,
        createdBy: translation.translator.name || 'Anonymous',
        translatorId: translation.translator.id,
        createdDate: translation.createdAt.toLocaleDateString(),
        likesCount: 0, // TODO: Implement likes system
        commentsCount: 0, // TODO: Implement comments system
        tags: [translation.sourceLanguage, translation.targetLanguage, 'classic'] // TODO: Implement dynamic tags
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transformedTranslations));
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch translations' }));
    }
  } else if (req.method === 'POST') {
    // Authenticate user
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
        bookId,
        context,
        chapter,
        pageNumber
      } = req.body;

      // Validate required fields
      if (!originalText || !translatedText || !targetLanguage || !bookId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Missing required fields: originalText, translatedText, targetLanguage, and bookId are required'
        }));
        return;
      }

      // Verify book exists
      const book = await prisma.book.findUnique({
        where: { id: parseInt(bookId) }
      });

      if (!book) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Book not found' }));
        return;
      }

      // Create translation
      const translation = await prisma.translation.create({
        data: {
          originalText,
          translatedText,
          sourceLanguage: sourceLanguage || 'en',
          targetLanguage,
          context,
          chapter,
          pageNumber: pageNumber ? parseInt(pageNumber) : null,
          bookId: parseInt(bookId),
          translatorId: user.id
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverImage: true
            }
          },
          translator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Transform response
      const response = {
        id: translation.id,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        context: translation.context,
        chapter: translation.chapter,
        pageNumber: translation.pageNumber,
        createdAt: translation.createdAt,
        bookTitle: translation.book.title,
        author: translation.book.author,
        bookId: translation.book.id,
        coverImage: translation.book.coverImage,
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
