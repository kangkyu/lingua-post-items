import prisma from '../lib/prisma.js';
import { authenticateUser } from '../auth/middleware.js';
import { translationInclude, serializeTranslation } from '../lib/serialize.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const translation = await prisma.translation.findUnique({
        where: { id: parseInt(id) },
        include: translationInclude,
      });

      if (!translation) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Translation not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(serializeTranslation(translation)));
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

      const { translatedText, targetLanguage } = req.body;

      if (!translatedText || !targetLanguage) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Missing required fields: translatedText and targetLanguage are required'
        }));
        return;
      }

      // The source text belongs to the passage and is shared with everyone
      // else translating it, so editing a translation cannot change it.
      const translation = await prisma.translation.update({
        where: { id: parseInt(id) },
        data: { text: translatedText, targetLanguage },
        include: translationInclude,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(serializeTranslation(translation)));
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
