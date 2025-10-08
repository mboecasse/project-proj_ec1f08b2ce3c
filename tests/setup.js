// File: tests/setup.js
// Generated: 2025-10-08 12:31:43 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_qsy7fq8k2jup

  const Post = require('../src/models/Post');


const logger = require('../src/utils/logger');


const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');


let mongoServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.disconnect();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Test database connected', { uri: mongoUri });
  } catch (error) {
    logger.error('Failed to connect to test database', { error: error.message });
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoServer) {
      await mongoServer.stop();
    }

    logger.info('Test database disconnected and cleaned up');
  } catch (error) {
    logger.error('Failed to cleanup test database', { error: error.message });
    throw error;
  }
});

afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    logger.error('Failed to clear test collections', { error: error.message });
    throw error;
  }
});

global.createTestPost = async (overrides = {}) => {

  const defaultPost = {
    title: 'Test Post',
    content: 'Test content for the post',
    author: 'Test Author',
    ...overrides
  };

  try {
    const post = await Post.create(defaultPost);
    return post;
  } catch (error) {
    logger.error('Failed to create test post', { error: error.message });
    throw error;
  }
};

global.clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    logger.error('Failed to clear database', { error: error.message });
    throw error;
  }
};

jest.setTimeout(30000);

process.env.NODE_ENV = 'test';
