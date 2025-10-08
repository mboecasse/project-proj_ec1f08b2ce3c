// File: src/middleware/security.js
// Generated: 2025-10-08 12:32:01 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_0ba7t2q828s3


const config = require('../config/env');


const cors = require('cors');


const helmet = require('helmet');


const hpp = require('hpp');


const logger = require('../utils/logger');


const mongoSanitize = require('express-mongo-sanitize');


const rateLimit = require('express-rate-limit');


const xss = require('xss-clean');

/**
 * Configure CORS options based on environment
 * @returns {Object} CORS configuration
 */


const getCorsOptions = () => {
  const allowedOrigins = config.CORS_ORIGIN
    ? config.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400
  };
};

/**
 * Configure rate limiting based on environment
 * @returns {Object} Rate limiter middleware
 */


const getRateLimiter = () => {
  const isProduction = config.NODE_ENV === 'production';

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 1000,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (config.NODE_ENV === 'development' && req.ip === '127.0.0.1') {
        return true;
      }
      return false;
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later'
      });
    }
  });
};

/**
 * Configure Helmet security headers
 * @returns {Object} Helmet configuration
 */


const getHelmetConfig = () => {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  };
};

/**
 * Apply all security middleware to Express app
 * @param {Object} app - Express application instance
 */


const applySecurity = (app) => {
  try {
    app.set('trust proxy', 1);

    app.use(helmet(getHelmetConfig()));
    logger.info('Helmet security headers configured');

    app.use(cors(getCorsOptions()));
    logger.info('CORS configured', {
      allowedOrigins: config.CORS_ORIGIN || 'http://localhost:3000'
    });

    app.use(xss());
    logger.info('XSS protection enabled');

    app.use(mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.warn('MongoDB injection attempt detected', {
          ip: req.ip,
          path: req.path,
          key
        });
      }
    }));
    logger.info('MongoDB injection protection enabled');

    app.use(hpp({
      whitelist: ['sort', 'fields', 'page', 'limit', 'filter']
    }));
    logger.info('HTTP parameter pollution protection enabled');

    app.use('/api/', getRateLimiter());
    logger.info('Rate limiting configured');

    app.use((req, res, next) => {
      res.removeHeader('X-Powered-By');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    logger.info('Security middleware initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize security middleware', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const sanitizeInput = (req, res, next) => {
  try {
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') {
        return obj;
      }

      const sanitized = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          if (typeof value === 'string') {
            sanitized[key] = value.trim();
          } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
      }

      return sanitized;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization failed', {
      error: error.message,
      path: req.path
    });
    next(error);
  }
};

/**
 * Security headers middleware for API responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

module.exports = {
  applySecurity,
  sanitizeInput,
  securityHeaders,
  getRateLimiter,
  getCorsOptions,
  getHelmetConfig
};
