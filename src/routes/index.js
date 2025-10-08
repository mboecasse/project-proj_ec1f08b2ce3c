// File: src/routes/index.js
// Generated: 2025-10-08 12:31:29 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_zpz6xtbk1vwq


const express = require('express');


const logger = require('../utils/logger');


const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'API is running'
  });
});

router.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

router.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

module.exports = router;
