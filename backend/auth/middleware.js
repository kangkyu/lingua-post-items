import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT and attach user to request
 */
export async function authenticateUser(req, res) {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (!authHeader) {
      return { error: 'Authorization header missing', statusCode: 401 };
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return { error: 'Token missing', statusCode: 401 };
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return { error: 'User not found', statusCode: 401 };
    }

    return { user };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', statusCode: 401 };
    }
    console.error('Authentication error:', error.message);
    return { error: 'Invalid token', statusCode: 401 };
  }
}
