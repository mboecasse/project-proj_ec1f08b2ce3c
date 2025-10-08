// File: src/utils/apiResponse.js
// Generated: 2025-10-08 12:31:40 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_7rmjk0jyhw0e

* Format: {success, data, message} for success, {success, error} for errors
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data (can be object, array, string, etc.)
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */


const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */


const error = (res, error = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error
  });
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */


const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */


const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Send bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const badRequest = (res, message = 'Bad request') => {
  return error(res, message, 400);
};

/**
 * Send unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

/**
 * Send forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

/**
 * Send not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Send conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const conflict = (res, message = 'Resource conflict') => {
  return error(res, message, 409);
};

/**
 * Send validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 */


const validationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    errors
  });
};

/**
 * Send internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */


const serverError = (res, message = 'Internal server error') => {
  return error(res, message, 500);
};

module.exports = {
  success,
  error,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError
};
