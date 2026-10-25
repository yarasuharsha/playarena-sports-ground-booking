const { body, query, param } = require('express-validator');

const createSlotValidator = [
  body('groundId')
    .isInt({ min: 1 })
    .withMessage('Valid Ground ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date in YYYY-MM-DD format is required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm 24-hour format'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm 24-hour format'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid non-negative number')
];

const batchGenerateSlotsValidator = [
  body('groundId')
    .isInt({ min: 1 })
    .withMessage('Valid Ground ID is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid startDate in YYYY-MM-DD format is required'),
  body('days')
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30'),
  body('slotTimes')
    .isArray({ min: 1 })
    .withMessage('slotTimes array is required with at least one slot definition')
];

const getGroundSlotsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Ground ID is required'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format')
];

module.exports = {
  createSlotValidator,
  batchGenerateSlotsValidator,
  getGroundSlotsValidator
};
