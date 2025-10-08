// File: src/middleware/validator.js
// Generated: 2025-10-08 12:31:41 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_jqe8koex0rs1


const logger = require('../utils/logger');

const { validationResult } = require('express-validator');

/**
 * Validation middleware that checks express-validator results
 * Logs validation errors and returns consistent error response
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with validation errors or calls next()
 */


const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: errorMessages,
      ip: req.ip,
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }

  next();
};

/**
 * Sanitizes request body by trimming string values
 * Removes leading/trailing whitespace from all string fields
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

/**
 * Sanitizes query parameters by trimming string values
 * Removes leading/trailing whitespace from all query string parameters
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  next();
};

/**
 * Sanitizes URL parameters by trimming string values
 * Removes leading/trailing whitespace from all route parameters
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === 'object') {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim();
      }
    });
  }
  next();
};

/**
 * Combined sanitization middleware
 * Sanitizes body, query, and params in one middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const sanitizeAll = (req, res, next) => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
};

module.exports = {
  validate,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll
};
