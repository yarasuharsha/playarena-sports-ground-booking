/**
 * Standardized JSON API Response Helpers
 */

function successResponse(res, data = {}, meta = null, statusCode = 200) {
  const payload = {
    success: true,
    data
  };

  if (meta !== null) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

function errorResponse(res, error, statusCode = 500) {
  const code = error.errorCode || 'INTERNAL_ERROR';
  const message = error.message || 'An unexpected error occurred.';
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
