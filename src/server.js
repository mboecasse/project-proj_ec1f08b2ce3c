// File: src/server.js
// Generated: 2025-10-08 12:32:24 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_kqm2ti78xss1


const app = require('./app');


const logger = require('./utils/logger');


const mongoose = require('./config/database');

const { PORT, NODE_ENV } = require('./config/env');


let server;

async function startServer() {
  try {
    logger.info('Starting server initialization', {
      nodeEnv: NODE_ENV,
      port: PORT
    });

    await mongoose.connect();
    logger.info('Database connected successfully');

    server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error('Port already in use', {
          port: PORT,
          error: error.message
        });
      } else {
        logger.error('Server error', {
          error: error.message,
          stack: error.stack
        });
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info('Shutdown signal received', { signal });

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await mongoose.connection.close();
        logger.info('Database connection closed');
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during database shutdown', {
          error: error.message,
          stack: error.stack
        });
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    logger.info('No active server to close');
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason,
    promise: promise
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
