import { GOOGLE_CLIENT_ID, handleCors, validateGoogleConfig } from '../config.js';

export default function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    validateGoogleConfig();

    // Get redirect URI from request origin
    const origin = req.headers.origin || req.headers.referer?.split('/')[0] + '//' + req.headers.referer?.split('/')[2] || 'http://localhost:5173';
    const redirectUri = `${origin}/auth/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'id_token token',
      scope: 'openid email profile',
      nonce: Date.now().toString()
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ authUrl }));
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to generate authentication URL' }));
  }
}
