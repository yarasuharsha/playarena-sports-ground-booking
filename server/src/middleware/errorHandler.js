const { Prisma } = require('@prisma/client');
const { AppError } = require('../errors');
const { errorResponse } = require('../utils/response');
const config = require('../config');

function errorHandler(err, req, res, next) {
  // Log server error with request ID
  console.error(`[Error] [${req.id || 'NO_REQ_ID'}]`, err);

  // 1. Handled Operational Application Errors
  if (err instanceof AppError) {
    return errorResponse(res, err, err.statusCode);
  }

  // 2. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      if (Array.isArray(target) && target.includes('slotId')) {
        return errorResponse(res, {
          errorCode: 'SLOT_ALREADY_BOOKED',
          message: 'This time slot is no longer available. Another booking has already reserved it.'
        }, 409);
      }
      if (err.message && err.message.includes('unique_active_booking_per_slot')) {
        return errorResponse(res, {
          errorCode: 'SLOT_ALREADY_BOOKED',
          message: 'This time slot is no longer available. Another booking has already reserved it.'
        }, 409);
      }
      return errorResponse(res, {
        errorCode: 'DUPLICATE_RESOURCE',
        message: 'A resource with these unique values already exists.',
        details: err.meta
      }, 409);
    }

    // Record not found in nested operation
    if (err.code === 'P2025') {
      return errorResponse(res, {
        errorCode: 'RESOURCE_NOT_FOUND',
        message: 'The requested record could not be found or has already been updated.'
      }, 404);
    }

    // Foreign key violation
    if (err.code === 'P2003') {
      return errorResponse(res, {
        errorCode: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced entity does not exist in the database.'
      }, 400);
    }
  }

  // 3. JSON body parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, {
      errorCode: 'INVALID_JSON_PAYLOAD',
      message: 'Malformed JSON payload provided in request body.'
    }, 400);
  }

  // 4. Default 500 Internal Error (Sanitized in production)
  const isDev = config.nodeEnv === 'development';
  return errorResponse(res, {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: isDev ? err.message : 'An internal server error occurred. Please try again later.'
  }, 500);
}

module.exports = errorHandler;
