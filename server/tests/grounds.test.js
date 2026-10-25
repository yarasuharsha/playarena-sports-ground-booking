const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Grounds & Slots API Endpoints', () => {
  let adminToken;
  let userToken;
  let createdGroundId;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@playarena.com', password: 'AdminPass123!' });
    adminToken = adminLogin.body.data.token;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@playarena.com', password: 'Password123!' });
    userToken = userLogin.body.data.token;
  });

  afterAll(async () => {
    if (createdGroundId) {
      await prisma.ground.delete({ where: { id: createdGroundId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('GET /api/v1/grounds', () => {
    it('should return paginated list of grounds', async () => {
      const res = await request(app)
        .get('/api/v1/grounds')
        .query({ page: 1, limit: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(3);
    });

    it('should filter grounds by sportType', async () => {
      const res = await request(app)
        .get('/api/v1/grounds')
        .query({ sportType: 'Football' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((ground) => {
        expect(ground.sportType.toLowerCase()).toBe('football');
      });
    });

    it('should filter grounds by search query', async () => {
      const res = await request(app)
        .get('/api/v1/grounds')
        .query({ search: 'Apex' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('Apex');
    });
  });

  describe('GET /api/v1/grounds/:id', () => {
    it('should retrieve a single ground with facilities and details', async () => {
      const groundsRes = await request(app).get('/api/v1/grounds');
      const firstGround = groundsRes.body.data[0];

      const res = await request(app).get(`/api/v1/grounds/${firstGround.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(firstGround.id);
      expect(Array.isArray(res.body.data.facilities)).toBe(true);
    });

    it('should return 404 for non-existent ground ID', async () => {
      const res = await request(app).get('/api/v1/grounds/999999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('GROUND_NOT_FOUND');
    });
  });

  describe('GET /api/v1/grounds/:id/slots', () => {
    it('should retrieve available slots for a ground on a given date', async () => {
      const groundsRes = await request(app).get('/api/v1/grounds');
      const ground = groundsRes.body.data[0];
      const todayStr = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/v1/grounds/${ground.id}/slots`)
        .query({ date: todayStr });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('isAvailable');
        expect(res.body.data[0]).toHaveProperty('startTime');
        expect(res.body.data[0]).toHaveProperty('endTime');
      }
    });
  });

  describe('POST /api/v1/grounds (Role Authorization)', () => {
    it('should allow ADMIN to create a new ground', async () => {
      const res = await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Pinnacle Arena Turf',
          sportType: 'Cricket',
          description: 'Top-tier practice cricket pitch',
          location: 'Whitefield Main Road',
          city: 'Bangalore',
          hourlyPrice: 1600.00,
          imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
          facilities: ['Floodlights', 'Turf Nets', 'Water']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Pinnacle Arena Turf');
      createdGroundId = res.body.data?.id;
    });

    it('should reject non-admin users from creating grounds with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Arena',
          sportType: 'Football',
          description: 'Testing permissions',
          location: 'Test Location',
          city: 'Bangalore',
          hourlyPrice: 1000.00,
          imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
          facilities: ['Parking']
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
