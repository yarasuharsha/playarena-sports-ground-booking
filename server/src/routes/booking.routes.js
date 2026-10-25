const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const {
  createBookingValidator,
  listBookingsValidator,
  cancelBookingValidator
} = require('../validators/booking.validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

// All booking operations require authentication
router.use(authenticate);

// Dedicated admin all-bookings route (Strictly protected by authorize('ADMIN'))
router.get(
  '/admin/all',
  authorize('ADMIN'),
  listBookingsValidator,
  validate,
  (req, res, next) => {
    req.query.all = true;
    bookingController.listBookings(req, res, next);
  }
);

router.post('/', createBookingValidator, validate, bookingController.createBooking);
router.get('/', listBookingsValidator, validate, bookingController.listBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', cancelBookingValidator, validate, bookingController.cancelBooking);

module.exports = router;
