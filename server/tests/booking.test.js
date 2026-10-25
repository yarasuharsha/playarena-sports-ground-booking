const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Booking API Lifecycle & Authorization', () => {
  let adminToken;
  let userToken;
  let user2Token;
  let testSlot;
  let pastSlot;
  let createdBookingId;

  beforeAll(async () => {
    // Login Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@playarena.com', password: 'AdminPass123!' });
    adminToken = adminLogin.body.data.token;

    // Login user 1
    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@playarena.com', password: 'Password123!' });
    userToken = userLogin.body.data.token;

    // Login user 2
    const user2Login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aditi@playarena.com', password: 'Password123!' });
    user2Token = user2Login.body.data.token;

    // Find or ensure a future available slot for testing (2 days ahead)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    futureDate.setHours(0, 0, 0, 0);

    testSlot = await prisma.slot.findFirst({
      where: {
        date: { gte: futureDate },
        isAvailable: true,
        bookings: { none: { status: { in: ['HELD', 'CONFIRMED'] } } }
      }
    });

    if (!testSlot) {
      // Create a test future slot if none found
      const ground = await prisma.ground.findFirst();
      testSlot = await prisma.slot.create({
        data: {
          groundId: ground.id,
          date: futureDate,
          startTime: '10:00',
          endTime: '11:00',
          price: 1200,
          isAvailable: true
        }
      });
    }

    // Find or create a past slot for validation testing
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    pastSlot = await prisma.slot.findFirst({
      where: {
        date: { lt: new Date() }
      }
    });

    if (!pastSlot) {
      const ground = await prisma.ground.findFirst();
      pastSlot = await prisma.slot.create({
        data: {
          groundId: ground.id,
          date: yesterday,
          startTime: '08:00',
          endTime: '09:00',
          price: 1000,
          isAvailable: true
        }
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/bookings', () => {
    it('should reject booking a past date or expired time slot with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          slotId: pastSlot.id,
          notes: 'Attempting to book a past slot'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toMatch(/past/i);
    });

    it('should create a booking for an available future slot with trusted backend price', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          slotId: testSlot.id,
          notes: 'Test friendly match'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingReference).toMatch(/^PA-\d{8}-[A-Z0-9]{4}$/);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(parseFloat(res.body.data.totalAmount)).toBe(parseFloat(testSlot.price));

      createdBookingId = res.body.data.id;

      // Verify slot is now marked as unavailable in DB
      const updatedSlot = await prisma.slot.findUnique({ where: { id: testSlot.id } });
      expect(updatedSlot.isAvailable).toBe(false);
    });

    it('should reject booking attempt on an already occupied slot with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          slotId: testSlot.id,
          notes: 'Competing attempt'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SLOT_ALREADY_BOOKED');
    });
  });

  describe('GET /api/v1/bookings - Role Visibility & Tabs', () => {
    it('should retrieve booking history for authenticated user (only their own bookings)', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((b) => b.id === createdBookingId)).toBe(true);
      // All returned bookings must belong to the requesting user
      res.body.data.forEach((b) => {
        expect(b.userId).toBe(b.user?.id);
      });
    });

    it('should support tab=UPCOMING and return only future confirmed bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings?tab=UPCOMING')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((b) => {
        expect(b.status).toBe('CONFIRMED');
        expect(b.isPast).toBe(false);
      });
    });

    it('should prevent regular users from accessing all bookings with all=true with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/bookings?all=true')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should prevent regular users from accessing /api/v1/bookings/admin/all with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admins to access all platform bookings via /api/v1/bookings/admin/all', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/v1/bookings/:id/cancel', () => {
    it('should prevent unauthorized user from cancelling another user booking with 403', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ reason: 'Attempted hijack' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_BOOKING_OWNER');
    });

    it('should allow booking owner to cancel an active booking and restore slot availability', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Change of plans' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CANCELLED');

      // Verify slot is now available again
      const restoredSlot = await prisma.slot.findUnique({ where: { id: testSlot.id } });
      expect(restoredSlot.isAvailable).toBe(true);
    });

    it('should reject repeated cancellation with 400 Bad Request', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_CANCELLED');
    });
  });
});
