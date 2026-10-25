const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Database-Backed Concurrency Protection (Race Condition Test)', () => {
  let user1Token;
  let user2Token;
  let targetSlot;

  beforeAll(async () => {
    // Authenticate two distinct users
    const [login1, login2] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({
        email: 'user@playarena.com',
        password: 'Password123!'
      }),
      request(app).post('/api/v1/auth/login').send({
        email: 'aditi@playarena.com',
        password: 'Password123!'
      })
    ]);

    user1Token = login1.body.data.token;
    user2Token = login2.body.data.token;

    // Pick a fresh available future slot (2 days ahead)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    futureDate.setHours(0, 0, 0, 0);

    targetSlot = await prisma.slot.findFirst({
      where: {
        date: { gte: futureDate },
        isAvailable: true,
        bookings: { none: { status: { in: ['HELD', 'CONFIRMED'] } } }
      }
    });

    if (!targetSlot) {
      const ground = await prisma.ground.findFirst();
      targetSlot = await prisma.slot.create({
        data: {
          groundId: ground.id,
          date: futureDate,
          startTime: '14:00',
          endTime: '15:00',
          price: 1500,
          isAvailable: true
        }
      });
    }

    expect(targetSlot).toBeDefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should allow exactly ONE booking and reject concurrent attempt with 409 Conflict', async () => {
    console.log(`⚡ Launching 2 simultaneous competing booking requests for Slot ID: ${targetSlot.id}`);

    // Execute two concurrent HTTP booking requests in parallel using Promise.all
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          slotId: targetSlot.id,
          notes: 'User 1 concurrent attempt'
        }),
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          slotId: targetSlot.id,
          notes: 'User 2 concurrent attempt'
        })
    ]);

    const statuses = [res1.status, res2.status].sort();
    console.log(`📊 Concurrency Test Result Statuses: [${res1.status}, ${res2.status}]`);

    // Verification 1: Exactly one succeeded (201) and one received conflict (409)
    expect(statuses).toEqual([201, 409]);

    // Verification 2: The winning request has confirmed status
    const winner = res1.status === 201 ? res1 : res2;
    const loser = res1.status === 409 ? res1 : res2;

    expect(winner.body.success).toBe(true);
    expect(winner.body.data.status).toBe('CONFIRMED');
    expect(winner.body.data.slotId).toBe(targetSlot.id);

    // Verification 3: The losing request receives SLOT_ALREADY_BOOKED error
    expect(loser.body.success).toBe(false);
    expect(loser.body.error.code).toBe('SLOT_ALREADY_BOOKED');

    // Verification 4: Query PostgreSQL directly to verify only 1 active booking exists in the database
    const dbActiveBookings = await prisma.booking.findMany({
      where: {
        slotId: targetSlot.id,
        status: { in: ['HELD', 'CONFIRMED'] }
      }
    });

    expect(dbActiveBookings.length).toBe(1);
    expect(dbActiveBookings[0].id).toBe(winner.body.data.id);
  });
});
