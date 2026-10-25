const express = require('express');
const router = express.Router();

const slotController = require('../controllers/slot.controller');
const {
  createSlotValidator,
  batchGenerateSlotsValidator
} = require('../validators/slot.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// Admin-only management endpoints
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createSlotValidator,
  validate,
  slotController.createSlot
);

router.post(
  '/batch',
  authenticate,
  authorize('ADMIN'),
  batchGenerateSlotsValidator,
  validate,
  slotController.batchGenerateSlots
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  slotController.deleteSlot
);

module.exports = router;
