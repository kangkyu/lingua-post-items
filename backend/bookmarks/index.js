import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';

export default async function handler(req, res) {
  // All bookmark operations require authentication
  const authResult = await authenticateUser(req, res);

  if (authResult.error) {
    res.writeHead(authResult.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: authResult.error }));
    return;
  }

  const user = authResult.user;

  if (req.method === 'GET') {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          translation: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true
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
          },
          book: {
            include: {
              authorUser: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const translations = bookmarks
        .filter(b => b.translation)
        .map(b => ({
          bookmarkId: b.id,
          ...b.translation,
          bookmarkedAt: b.createdAt
        }));

      const books = bookmarks
        .filter(b => b.book)
        .map(b => ({
          bookmarkId: b.id,
          ...b.book,
          bookmarkedAt: b.createdAt
        }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ translations, books }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch bookmarks' }));
    }
  } else if (req.method === 'POST') {
    try {
      const { translationId, bookId } = req.body;

      if (!translationId && !bookId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Either translationId or bookId is required' }));
        return;
      }

      if (translationId && bookId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Cannot bookmark both translation and book' }));
        return;
      }

      // Check if bookmark already exists
      const existing = await prisma.bookmark.findFirst({
        where: {
          userId: user.id,
          ...(translationId ? { translationId } : { bookId })
        }
      });

      if (existing) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bookmark already exists', bookmark: existing }));
        return;
      }

      const bookmark = await prisma.bookmark.create({
        data: {
          userId: user.id,
          ...(translationId ? { translationId } : { bookId })
        }
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bookmark));
    } catch (error) {
      console.error('Error creating bookmark:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create bookmark' }));
    }
  } else {
    res.writeHead(405, { 'Allow': 'GET, POST' });
    res.end(`Method ${req.method} Not Allowed`);
  }
}
