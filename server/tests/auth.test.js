const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Auth API Endpoints', () => {
  let createdUserId;

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  const testEmail = `testuser_${Date.now()}@playarena.com`;

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: 'Integration Test User',
          phone: '+91 9888877777'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.token).toBeDefined();
      createdUserId = res.body.data.user?.id;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: 'Duplicate User'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
          name: 'Invalid Email User'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@playarena.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('user@playarena.com');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@playarena.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@playarena.com', password: 'Password123!' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('user@playarena.com');
    });

    it('should reject request without authorization token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
