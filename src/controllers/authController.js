// File: src/controllers/authController.js
// Generated: 2025-10-08 12:31:54 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_qhus97ikhv8f


const User = require('../models/User');


const bcrypt = require('bcryptjs');


const jwt = require('jsonwebtoken');


const logger = require('../utils/logger');

const { successResponse, errorResponse } = require('../utils/apiResponse');


const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET not configured');
    throw new Error('Authentication configuration error');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    logger.info('User registration attempt', { email });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email });
      return res.status(409).json(
        errorResponse('User with this email already exists')
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    const token = generateToken(user._id);

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(201).json(
      successResponse(
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        },
        'User registered successfully'
      )
    );
  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info('User login attempt', { email });

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(401).json(
        errorResponse('Invalid email or password')
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', {
        email,
        userId: user._id
      });
      return res.status(401).json(
        errorResponse('Invalid email or password')
      );
    }

    const token = generateToken(user._id);

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json(
      successResponse(
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        },
        'Login successful'
      )
    );
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    next(error);
  }
};
