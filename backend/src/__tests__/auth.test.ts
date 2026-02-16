import request from 'supertest';
import { createTestApp } from './setup';

const app = createTestApp();

describe('Auth Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should reject signup without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject signup with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'not-an-email', name: 'Test User', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject signup with short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', name: 'Test User', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ])
      );
    });

    it('should reject signup with short name', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', name: 'A', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
        ])
      );
    });

    it('should create a user with valid data', async () => {
      const unique = `testuser_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: unique, name: 'Test User', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(unique);
      // Password should not be returned
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login without credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'demo@taskflow.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with nonexistent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login with valid seeded credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'demo@taskflow.com', password: 'demo123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('demo@taskflow.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject without auth token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      // Login first to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'demo@taskflow.com', password: 'demo123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('demo@taskflow.com');
      expect(res.body.data.password).toBeUndefined();
    });
  });
});

describe('Health Check', () => {
  it('GET /api/health should return success', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.timestamp).toBeDefined();
  });
});
