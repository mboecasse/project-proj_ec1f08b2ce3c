// File: src/config/database.js
// Generated: 2025-10-08 12:31:33 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_t0zb6wvqc29h


const logger = require('../utils/logger');


const mongoose = require('mongoose');


const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000;
  let retries = 0;

  const connectionOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  while (retries < maxRetries) {
    try {
      const mongoURI = process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      await mongoose.connect(mongoURI, connectionOptions);

      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        poolSize: connectionOptions.maxPoolSize
      });

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', {
          error: error.message,
          stack: error.stack
        });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing MongoDB connection', {
            error: error.message
          });
          process.exit(1);
        }
      });

      return mongoose.connection;
    } catch (error) {
      retries++;
      logger.error('MongoDB connection failed', {
        attempt: retries,
        maxRetries: maxRetries,
        error: error.message,
        stack: error.stack
      });

      if (retries >= maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB', {
          totalAttempts: retries
        });
        throw new Error('Failed to connect to MongoDB after maximum retries');
      }

      logger.info(`Retrying MongoDB connection in ${retryDelay / 1000} seconds...`, {
        nextAttempt: retries + 1
      });

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

module.exports = mongoose;
module.exports.connectDB = connectDB;
