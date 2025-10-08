// File: src/routes/healthRoutes.js
// Generated: 2025-10-08 12:31:36 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_8ivnvu9q96y9


const express = require('express');


const logger = require('../utils/logger');


const mongoose = require('../config/database');


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbStatusCode = mongoose.connection.readyState;

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        readyState: dbStatusCode
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };

    logger.info('Health check performed', {
      dbStatus,
      uptime: process.uptime()
    });

    res.status(200).json({
      success: true,
      data: healthStatus,
      message: 'API is healthy'
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      success: false,
      error: 'Service unavailable'
    });
  }
});

module.exports = router;
