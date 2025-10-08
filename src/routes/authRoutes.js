// File: src/routes/authRoutes.js
// Generated: 2025-10-08 12:32:00 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_ls0w5hvqw7xs


const bcrypt = require('bcryptjs');


const express = require('express');


const jwt = require('jsonwebtoken');


const logger = require('../utils/logger');

const { body } = require('express-validator');

const { validate } = require('../middleware/validator');


const router = express.Router();

// Validation schemas


const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores')
];


const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, validate, async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    logger.info('Registration attempt', { email, username });

    // Check if user already exists (mock implementation - replace with actual DB check)
    // In production, this would query the User model
    const existingUser = null; // await User.findOne({ email });

    if (existingUser) {
      logger.warn('Registration failed - user exists', { email });
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (mock implementation - replace with actual DB save)
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    // In production: await User.create(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'genesis-api'
      }
    );

    logger.info('User registered successfully', {
      userId: newUser.id,
      email: newUser.email
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username
        },
        token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    next(error);
  }
});

// Login endpoint
router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    // Find user (mock implementation - replace with actual DB query)
    // In production: const user = await User.findOne({ email }).select('+password');
    const user = null;

    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'genesis-api'
      }
    );

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    next(error);
  }
});

module.exports = router;
