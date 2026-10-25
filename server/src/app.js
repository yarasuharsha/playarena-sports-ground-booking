const express = require('express');
const cors = require('cors');

const config = require('./config');
const requestIdMiddleware = require('./middleware/requestId');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, tests)
    if (!origin) return callback(null, true);
    // In development, allow localhost on any port
    if (config.nodeEnv === 'development' || origin.includes('localhost') || origin === config.clientUrl) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Tracking & Logging Middleware
app.use(requestIdMiddleware);
if (config.nodeEnv !== 'test') {
  app.use(requestLogger);
}

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'PlayArena Sports Ground Booking API',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// Mount API v1 router
app.use('/api/v1', apiRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
