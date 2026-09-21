import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';
import { translationInclude, serializeTranslation } from '../lib/serialize.js';

/**
 * Find the passage this translation belongs to, creating the work and the
 * passage if this is the first time anyone has entered that source text.
 */
async function findOrCreatePassage({ originalText, sourceLanguage, sourceName, context, chapter, pageNumber }) {
  const title = (sourceName || '').trim() || 'Untitled';
  const language = sourceLanguage || 'en';

  const work = await prisma.work.upsert({
    where: { title_language: { title, language } },
    update: {},
    create: { title, language },
  });

  const existing = await prisma.passage.findFirst({
    where: { workId: work.id, text: originalText },
  });
  if (existing) return existing;

  const last = await prisma.passage.findFirst({
    where: { workId: work.id },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  return prisma.passage.create({
    data: {
      workId: work.id,
      text: originalText,
      position: (last?.position ?? 0) + 1,
      context: context || null,
      chapter: chapter || null,
      pageNumber: pageNumber ? parseInt(pageNumber) : null,
    },
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const translations = await prisma.translation.findMany({
        include: translationInclude,
        orderBy: { createdAt: 'desc' },
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(translations.map(serializeTranslation)));
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
        passageId,
        originalText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        sourceName,
        context,
        chapter,
        pageNumber
      } = req.body;

      if (!translatedText || !targetLanguage || (!passageId && !originalText)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Missing required fields: translatedText, targetLanguage, and either passageId or originalText are required'
        }));
        return;
      }

      // Translating an existing passage is the common case once a work has
      // been added; originalText creates the passage on the fly.
      let passage;
      if (passageId) {
        passage = await prisma.passage.findUnique({ where: { id: parseInt(passageId) } });
        if (!passage) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Passage not found' }));
          return;
        }
      } else {
        passage = await findOrCreatePassage({
          originalText, sourceLanguage, sourceName, context, chapter, pageNumber
        });
      }

      const translation = await prisma.translation.create({
        data: {
          passageId: passage.id,
          text: translatedText,
          targetLanguage,
          translatorId: user.id,
        },
        include: translationInclude,
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(serializeTranslation(translation)));
    } catch (error) {
      console.error('Error creating translation:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create translation' }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
}
