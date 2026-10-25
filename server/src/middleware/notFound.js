const { NotFoundError } = require('../errors');

function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on this server`, 'ROUTE_NOT_FOUND'));
}

module.exports = notFoundHandler;
