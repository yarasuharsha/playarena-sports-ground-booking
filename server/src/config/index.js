require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required in production mode');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production mode');
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: nodeEnv === 'production'
      ? process.env.JWT_SECRET
      : (process.env.JWT_SECRET || 'playarena_super_secret_jwt_key_2026_educational_dev'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;
