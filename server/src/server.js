const app = require('./app');
const config = require('./config');
const prisma = require('./config/prisma');

const server = app.listen(config.port, () => {
  console.log(`🚀 PlayArena Server running on http://localhost:${config.port} in ${config.nodeEnv} mode`);
});

// Graceful Shutdown Handling
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('⚡ HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('💾 Database connection closed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
