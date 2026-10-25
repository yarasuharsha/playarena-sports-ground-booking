class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict occurred', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

class SlotAlreadyBookedError extends ConflictError {
  constructor(message = 'This time slot is no longer available.') {
    super(message, 'SLOT_ALREADY_BOOKED');
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  SlotAlreadyBookedError
};
