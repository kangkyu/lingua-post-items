import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient();

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'global';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
    res.end(JSON.stringify({ error: `Method ${req.method} Not Allowed` }));
    return;
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing text or targetLanguage in request body' }));
    return;
  }

  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);

    if (!response.translations || response.translations.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Translation returned no result' }));
      return;
    }

    const translatedText = response.translations[0].translatedText;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ translatedText }));
  } catch (error) {
    console.error('Error translating text:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to translate text' }));
  }
}
