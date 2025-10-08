// File: src/middleware/auth.js
// Generated: 2025-10-08 12:31:53 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_atpci4mwi7lq


const apiResponse = require('../utils/apiResponse');


const config = require('../config/env');


const jwt = require('jsonwebtoken');


const logger = require('../utils/logger');


const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Authentication failed: No authorization header', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json(
        apiResponse.error('Access denied. No token provided.')
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Invalid authorization format', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json(
        apiResponse.error('Access denied. Invalid token format.')
      );
    }

    const token = authHeader.substring(7);

    if (!token) {
      logger.warn('Authentication failed: Empty token', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return res.status(401).json(
        apiResponse.error('Access denied. No token provided.')
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Authentication failed: Token expired', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          expiredAt: error.expiredAt
        });
        return res.status(401).json(
          apiResponse.error('Access denied. Token expired.')
        );
      }

      if (error.name === 'JsonWebTokenError') {
        logger.warn('Authentication failed: Invalid token', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          error: error.message
        });
        return res.status(401).json(
          apiResponse.error('Access denied. Invalid token.')
        );
      }

      logger.error('Authentication failed: JWT verification error', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        error: error.message,
        stack: error.stack
      });
      return res.status(401).json(
        apiResponse.error('Access denied. Token verification failed.')
      );
    }

    req.user = decoded;

    logger.info('Authentication successful', {
      userId: decoded.id || decoded.userId,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(500).json(
      apiResponse.error('Internal server error during authentication.')
    );
  }
};

module.exports = auth;
