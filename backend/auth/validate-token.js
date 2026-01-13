import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ID token is required' }));
      return;
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Google Client ID not configured' }));
      return;
    }

    // Verify ID token with Google
    const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid ID token');
    }

    // Find or create user (atomic upsert)
    const dbUser = await prisma.user.upsert({
      where: { email: payload.email },
      update: { name: payload.name, avatar: payload.picture },
      create: { email: payload.email, name: payload.name, avatar: payload.picture }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user,
      sessionToken: token
    }));
  } catch (error) {
    console.error('Token validation error:', error.message);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Invalid token or authentication failed'
    }));
  }
}
