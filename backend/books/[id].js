import prisma from '../lib/prisma.js';

export default async function handler(req, res) {

  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      const book = await prisma.book.findUnique({
        where: {
          id: parseInt(id)
        },
        include: {
          authorUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          translations: {
            include: {
              translator: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          bookmarks: {
            select: {
              id: true
            }
          }
        }
      });

      if (!book) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Book not found' }));
        return;
      }

      // Transform the data to match frontend expectations
      const transformedBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        description: book.description,
        language: book.language,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        translationsCount: book.translations.length,
        bookmarksCount: book.bookmarks.length,
        translations: book.translations.map(translation => ({
          id: translation.id,
          originalText: translation.originalText,
          translatedText: translation.translatedText,
          sourceLanguage: translation.sourceLanguage,
          targetLanguage: translation.targetLanguage,
          context: translation.context,
          chapter: translation.chapter,
          pageNumber: translation.pageNumber,
          createdAt: translation.createdAt,
          createdBy: translation.translator.name || 'Anonymous',
          translatorId: translation.translator.id,
          createdDate: translation.createdAt.toLocaleDateString()
        }))
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transformedBook));
    } catch (error) {
      console.error('Error fetching book:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch book' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
