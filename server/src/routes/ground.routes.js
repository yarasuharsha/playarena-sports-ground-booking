const express = require('express');
const router = express.Router();

const groundController = require('../controllers/ground.controller');
const slotController = require('../controllers/slot.controller');
const {
  createGroundValidator,
  updateGroundValidator,
  listGroundsValidator
} = require('../validators/ground.validator');
const { getGroundSlotsValidator } = require('../validators/slot.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', listGroundsValidator, validate, groundController.listGrounds);
router.get('/:id', groundController.getGroundById);
router.get('/:id/slots', getGroundSlotsValidator, validate, slotController.getGroundSlots);

// Admin-only management routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createGroundValidator,
  validate,
  groundController.createGround
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateGroundValidator,
  validate,
  groundController.updateGround
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  groundController.deleteGround
);

module.exports = router;
