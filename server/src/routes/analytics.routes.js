const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Protected admin-only metrics
router.get('/dashboard', authenticate, authorize('ADMIN'), analyticsController.getDashboard);

module.exports = router;
