// File: src/middleware/errorHandler.js
// Generated: 2025-10-08 12:31:53 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_s8oopodlvnhs


const logger = require('../utils/logger');

const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handling middleware
 * Catches all errors from routes/controllers and returns standardized error responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const errorHandler = (err, req, res, next) => {
  // Log error with context
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose invalid ObjectId
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for field: ${field}`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT invalid token
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired token
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (err.name === 'UnauthorizedError') {
    // Express-jwt unauthorized
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError') {
    // Custom forbidden error
    statusCode = 403;
    message = 'Access forbidden';
  } else if (err.name === 'NotFoundError') {
    // Custom not found error
    statusCode = 404;
    message = 'Resource not found';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
  }

  // Send error response
  res.status(statusCode).json(errorResponse(message));
};

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */


const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json(errorResponse('Route not found'));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
