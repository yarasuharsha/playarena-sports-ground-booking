const { body, query, param } = require('express-validator');

const createBookingValidator = [
  body('slotId')
    .isInt({ min: 1 })
    .withMessage('Valid slotId is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Notes cannot exceed 255 characters')
];

const listBookingsValidator = [
  query('status')
    .optional()
    .isIn(['HELD', 'CONFIRMED', 'CANCELLED'])
    .withMessage('Invalid status filter. Must be HELD, CONFIRMED, or CANCELLED'),
  query('groundId')
    .optional()
    .isInt({ min: 1 }),
  query('date')
    .optional()
    .isISO8601(),
  query('tab')
    .optional()
    .isIn(['UPCOMING', 'PAST', 'CANCELLED', 'ALL'])
    .withMessage('Invalid tab filter. Must be UPCOMING, PAST, CANCELLED, or ALL'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('all')
    .optional()
    .isIn(['true', 'false', true, false]),
  query('userId')
    .optional()
    .isInt({ min: 1 }),
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
];

const cancelBookingValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 })
];

module.exports = {
  createBookingValidator,
  listBookingsValidator,
  cancelBookingValidator
};
