const express = require('express');
const router = express.Router();

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

// Resource routes under /api/v1
router.use('/auth', authRoutes);
router.use('/grounds', groundRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
