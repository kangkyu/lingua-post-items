import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createTestServer } from './setup.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('Auth API', () => {
  let server;

  beforeAll(() => {
    server = createTestServer();
  });

  describe('POST /auth/validate-token', () => {
    it('returns 400 when idToken is missing', async () => {
      const res = await request(server)
        .post('/auth/validate-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ID token is required');
    });

    it('returns 401 when idToken is invalid', async () => {
      const res = await request(server)
        .post('/auth/validate-token')
        .send({ idToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('JWT Authentication', () => {
    it('rejects expired JWT', async () => {
      const token = jwt.sign(
        { userId: 999999, email: 'test@example.com' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(server)
        .post('/books')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Book', author: 'Test Author' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token expired');
    });

    it('rejects invalid JWT', async () => {
      const res = await request(server)
        .post('/books')
        .set('Authorization', 'Bearer invalid-token')
        .send({ title: 'Test Book', author: 'Test Author' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('rejects request without Authorization header', async () => {
      const res = await request(server)
        .post('/books')
        .send({ title: 'Test Book', author: 'Test Author' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authorization header missing');
    });

  });
});
