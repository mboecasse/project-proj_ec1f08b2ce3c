// File: tests/integration/postRoutes.test.js
// Generated: 2025-10-08 12:32:47 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_uizji8n7g3lc


const Post = require('../../src/models/Post');


const app = require('../../src/app');


const logger = require('../../src/utils/logger');


const mongoose = require('mongoose');


const request = require('supertest');

describe('Post Routes Integration Tests', () => {
  let server;
  let testPostId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/blog_test';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Post.deleteMany({});

    const testPost = await Post.create({
      title: 'Test Post',
      content: 'This is test content for integration testing',
      author: 'Test Author'
    });

    testPostId = testPost._id.toString();
  });

  afterEach(async () => {
    await Post.deleteMany({});
  });

  describe('GET /api/posts', () => {
    it('should return all posts with 200 status', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Test Post');
    });

    it('should return empty array when no posts exist', async () => {
      await Post.deleteMany({});

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(Post, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/posts')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post by id with 200 status', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPostId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPostId);
      expect(response.body.data.title).toBe('Test Post');
      expect(response.body.data.content).toBe('This is test content for integration testing');
      expect(response.body.data.author).toBe('Test Author');
    });

    it('should return 404 when post not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 for invalid post id format', async () => {
      const response = await request(app)
        .get('/api/posts/invalid-id-format')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data and return 201', async () => {
      const newPost = {
        title: 'New Integration Test Post',
        content: 'Content for the new post created in integration test',
        author: 'Integration Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newPost.title);
      expect(response.body.data.content).toBe(newPost.content);
      expect(response.body.data.author).toBe(newPost.author);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();

      const savedPost = await Post.findById(response.body.data._id);
      expect(savedPost).toBeDefined();
      expect(savedPost.title).toBe(newPost.title);
    });

    it('should return 400 when title is missing', async () => {
      const invalidPost = {
        content: 'Content without title',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when content is missing', async () => {
      const invalidPost = {
        title: 'Title without content',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when author is missing', async () => {
      const invalidPost = {
        title: 'Title without author',
        content: 'Content without author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when title is too short', async () => {
      const invalidPost = {
        title: 'Ab',
        content: 'Valid content here',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when content is too short', async () => {
      const invalidPost = {
        title: 'Valid Title',
        content: 'Short',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update an existing post with valid data and return 200', async () => {
      const updatedData = {
        title: 'Updated Test Post',
        content: 'This content has been updated in integration test',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/posts/${testPostId}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPostId);
      expect(response.body.data.title).toBe(updatedData.title);
      expect(response.body.data.content).toBe(updatedData.content);
      expect(response.body.data.author).toBe(updatedData.author);

      const updatedPost = await Post.findById(testPostId);
      expect(updatedPost.title).toBe(updatedData.title);
      expect(updatedPost.content).toBe(updatedData.content);
      expect(updatedPost.author).toBe(updatedData.author);
    });

    it('should return 404 when updating non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        author: 'Updated Author'
      };

      const response = await request(app)
        .put(`/api/posts/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 when update data is invalid', async () => {
      const invalidData = {
        title: 'Ab',
        content: 'Valid content',
        author: 'Valid Author'
      };

      const response = await request(app)
        .put(`/api/posts/${testPostId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid post id format', async () => {
      const updateData = {
        title: 'Valid Title',
        content: 'Valid content',
        author: 'Valid Author'
      };

      const response = await request(app)
        .put('/api/posts/invalid-id')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete an existing post and return 200', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPostId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/deleted successfully/i);

      const deletedPost = await Post.findById(testPostId);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 when deleting non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 for invalid post id format', async () => {
      const response = await request(app)
        .delete('/api/posts/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/posts/nonexistent/route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", invalid json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Content Type Validation', () => {
    it('should accept application/json content type', async () => {
      const newPost = {
        title: 'JSON Content Type Test',
        content: 'Testing with proper content type',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Content-Type', 'application/json')
        .send(newPost)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Response Headers', () => {
    it('should return correct content-type headers', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
