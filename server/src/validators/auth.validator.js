const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 }),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator
};
