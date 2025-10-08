// File: src/config/env.js
// Generated: 2025-10-08 12:31:34 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_y59zhtlmqbvh


const logger = require('../utils/logger');


const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];


const optionalEnvVars = {
  LOG_LEVEL: 'info',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  BCRYPT_ROUNDS: '12',
  CORS_ORIGIN: '*'
};


function validateEnvVars() {
  const missingVars = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error('Environment validation failed', { missingVars });
    throw new Error(errorMessage);
  }

  validateEnvValues();
  setDefaultValues();

  logger.info('Environment variables validated successfully', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
  });
}


function validateEnvValues() {
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }

  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
  if (!/^\d+[smhd]$/.test(jwtExpiresIn)) {
    throw new Error('JWT_EXPIRES_IN must be in format: number + unit (s/m/h/d), e.g., 7d, 24h');
  }
}


function setDefaultValues() {
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
  if (isNaN(rateLimitWindowMs) || rateLimitWindowMs < 0) {
    process.env.RATE_LIMIT_WINDOW_MS = optionalEnvVars.RATE_LIMIT_WINDOW_MS;
  }

  const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
  if (isNaN(rateLimitMaxRequests) || rateLimitMaxRequests < 1) {
    process.env.RATE_LIMIT_MAX_REQUESTS = optionalEnvVars.RATE_LIMIT_MAX_REQUESTS;
  }

  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS, 10);
  if (isNaN(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 20) {
    process.env.BCRYPT_ROUNDS = optionalEnvVars.BCRYPT_ROUNDS;
  }
}

validateEnvVars();

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  },
  logging: {
    level: process.env.LOG_LEVEL
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10)
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  }
};
