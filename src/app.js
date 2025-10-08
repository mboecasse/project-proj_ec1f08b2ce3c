// File: src/app.js
// Generated: 2025-10-08 12:32:12 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_p5hentgh83p1


const cors = require('cors');


const errorHandler = require('./middleware/errorHandler');


const express = require('express');


const helmet = require('helmet');


const logger = require('./utils/logger');


const mongoSanitize = require('express-mongo-sanitize');


const rateLimiter = require('./middleware/rateLimiter');


const routes = require('./routes/index');


const securityMiddleware = require('./middleware/security');


const app = express();

// Trust proxy - required for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(securityMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting
app.use(rateLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Service is running'
  });
});

// API routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
