const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return next(new ValidationError('Validation failed for request parameters', formattedErrors));
  }
  next();
}

module.exports = validate;
