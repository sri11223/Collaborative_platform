import request from 'supertest';
import { createTestApp } from './setup';

const app = createTestApp();

/**
 * Helper: log in as the demo user and return the JWT token.
 */
async function getAuthToken(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'demo@taskflow.com', password: 'demo123' });
  return res.body.data.token;
}

describe('Board Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  describe('GET /api/boards', () => {
    it('should reject without auth', async () => {
      const res = await request(app).get('/api/boards');
      expect(res.status).toBe(401);
    });

    it('should return boards for authenticated user', async () => {
      const res = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      // May be paginated { boards: [...], total, page } or a direct array
      const boards = Array.isArray(res.body.data) ? res.body.data : res.body.data.boards;
      expect(Array.isArray(boards)).toBe(true);
    });
  });

  describe('POST /api/boards', () => {
    it('should reject board creation without title', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create a board with valid data', async () => {
      // First, get a workspace to attach the board to
      const wsRes = await request(app)
        .get('/api/workspaces')
        .set('Authorization', `Bearer ${token}`);

      const workspaceId = wsRes.body.data[0]?.id;

      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `Test Board ${Date.now()}`,
          description: 'Created by automated test',
          workspaceId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Test Board');
    });
  });

  describe('GET /api/boards/:id', () => {
    it('should return 404 for non-existent board', async () => {
      const res = await request(app)
        .get('/api/boards/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return full board details', async () => {
      // Get boards list first
      const listRes = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${token}`);

      const boardId = listRes.body.data[0]?.id;
      if (!boardId) return; // skip if no boards

      const res = await request(app)
        .get(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(boardId);
      expect(res.body.data.lists).toBeDefined();
    });
  });
});

describe('Workspace Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  describe('GET /api/workspaces', () => {
    it('should return workspaces for authenticated user', async () => {
      const res = await request(app)
        .get('/api/workspaces')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/workspaces', () => {
    it('should reject without a name', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should create a workspace', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: `Test WS ${Date.now()}` });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('Test WS');
    });
  });
});

describe('Notification Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  it('should return notification list', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return unread count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.count).toBe('number');
  });
});

describe('Favorites Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  it('should return favorite boards', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
