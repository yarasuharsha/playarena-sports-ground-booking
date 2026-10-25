const request = require('supertest');
const { execSync } = require('child_process');
const path = require('path');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Health and Idempotent Seeding Suite', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/health/db', () => {
    it('should return UP and current database counts', async () => {
      const res = await request(app).get('/api/v1/health/db');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('UP');
      expect(res.body.data.database).toBe('connected');
      expect(typeof res.body.data.counts.users).toBe('number');
      expect(typeof res.body.data.counts.grounds).toBe('number');
      expect(typeof res.body.data.counts.slots).toBe('number');
    });
  });

  describe('Idempotent Database Seeding', () => {
    it('running seed multiple times produces identical counts with zero data loss', async () => {
      const serverDir = path.resolve(__dirname, '..');

      // Run 1: Execute seed script
      execSync('node prisma/seed.js', {
        cwd: serverDir,
        env: { ...process.env, NODE_ENV: 'test' }
      });

      const usersAfterRun1 = await prisma.user.count();
      const groundsAfterRun1 = await prisma.ground.count();
      const slotsAfterRun1 = await prisma.slot.count();

      // Run 2: Execute seed script second time
      execSync('node prisma/seed.js', {
        cwd: serverDir,
        env: { ...process.env, NODE_ENV: 'test' }
      });

      const usersAfterRun2 = await prisma.user.count();
      const groundsAfterRun2 = await prisma.ground.count();
      const slotsAfterRun2 = await prisma.slot.count();

      expect(usersAfterRun2).toBe(usersAfterRun1);
      expect(groundsAfterRun2).toBe(groundsAfterRun1);
      expect(slotsAfterRun2).toBe(slotsAfterRun1);
    }, 45000);
  });
});
