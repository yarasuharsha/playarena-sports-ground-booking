require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'playarena_super_secret_jwt_key_2026_educational_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;
