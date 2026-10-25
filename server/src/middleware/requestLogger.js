const morgan = require('morgan');

morgan.token('req-id', (req) => req.id || '-');

const requestLogger = morgan(
  '[:req-id] :remote-addr - :method :url :status :res[content-length] - :response-time ms'
);

module.exports = requestLogger;
