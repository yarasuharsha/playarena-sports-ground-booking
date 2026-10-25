const express = require('express');
const router = express.Router();

const prisma = require('../config/prisma');
const authRoutes = require('./auth.routes');
const groundRoutes = require('./ground.routes');
const slotRoutes = require('./slot.routes');
const bookingRoutes = require('./booking.routes');
const analyticsRoutes = require('./analytics.routes');
const { successResponse } = require('../utils/response');

// API Health Check
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'UP',
    service: 'PlayArena API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Database Health Check & Seed Verification
router.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [userCount, groundCount, slotCount] = await Promise.all([
      prisma.user.count(),
      prisma.ground.count(),
      prisma.slot.count()
    ]);

    return successResponse(res, {
      status: 'UP',
      database: 'connected',
      counts: {
        users: userCount,
        grounds: groundCount,
        slots: slotCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'DOWN',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Resource routes under /api/v1
router.use('/auth', authRoutes);
router.use('/grounds', groundRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
