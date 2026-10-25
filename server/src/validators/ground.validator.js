const { body, query, param } = require('express-validator');

const createGroundValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ground name is required')
    .isLength({ max: 150 }),
  body('sportType')
    .trim()
    .notEmpty()
    .withMessage('Sport type is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('hourlyPrice')
    .isFloat({ min: 1 })
    .withMessage('Hourly price must be a positive number greater than 0'),
  body('imageUrl')
    .trim()
    .isURL()
    .withMessage('A valid image URL is required'),
  body('facilities')
    .isArray({ min: 1 })
    .withMessage('Facilities must be an array with at least one facility'),
  body('facilities.*')
    .trim()
    .notEmpty()
    .withMessage('Facility item cannot be empty')
];

const updateGroundValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid Ground ID is required'),
  body('name').optional().trim().notEmpty(),
  body('sportType').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('city').optional().trim().notEmpty(),
  body('hourlyPrice').optional().isFloat({ min: 1 }),
  body('imageUrl').optional().trim().isURL(),
  body('facilities').optional().isArray(),
  body('isActive').optional().isBoolean()
];

const listGroundsValidator = [
  query('search').optional().trim(),
  query('sportType').optional().trim(),
  query('city').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['hourlyPrice', 'name', 'rating', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc'])
];

module.exports = {
  createGroundValidator,
  updateGroundValidator,
  listGroundsValidator
};
