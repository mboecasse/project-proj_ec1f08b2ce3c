// File: tests/unit/postController.test.js
// Generated: 2025-10-08 12:32:27 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_msi11bha2k3h


const Post = require('../../src/models/Post');


const logger = require('../../src/utils/logger');

const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../../src/controllers/postController');

jest.mock('../../src/models/Post');
jest.mock('../../src/utils/logger');

describe('Post Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all posts with pagination', async () => {
      const mockPosts = [
        { _id: '1', title: 'Post 1', content: 'Content 1', author: 'Author 1', isDeleted: false },
        { _id: '2', title: 'Post 2', content: 'Content 2', author: 'Author 2', isDeleted: false }
      ];
      const mockCount = 2;

      req.query = { page: '1', limit: '10' };

      Post.countDocuments = jest.fn().mockResolvedValue(mockCount);
      Post.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockPosts)
          })
        })
      });

      await getAllPosts(req, res, next);

      expect(Post.countDocuments).toHaveBeenCalledWith({ isDeleted: false });
      expect(Post.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
        message: 'Posts retrieved successfully',
        pagination: {
          page: 1,
          limit: 10,
          total: mockCount,
          pages: 1
        }
      });
      expect(logger.info).toHaveBeenCalledWith('Retrieved posts', { count: mockPosts.length, page: 1, limit: 10 });
    });

    it('should use default pagination values when not provided', async () => {
      const mockPosts = [];
      const mockCount = 0;

      req.query = {};

      Post.countDocuments = jest.fn().mockResolvedValue(mockCount);
      Post.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockPosts)
          })
        })
      });

      await getAllPosts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
        message: 'Posts retrieved successfully',
        pagination: {
          page: 1,
          limit: 10,
          total: mockCount,
          pages: 0
        }
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      req.query = { page: '1', limit: '10' };

      Post.countDocuments = jest.fn().mockRejectedValue(mockError);

      await getAllPosts(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error retrieving posts', { error: mockError.message });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      const mockPost = { _id: '123', title: 'Test Post', content: 'Test Content', author: 'Test Author', isDeleted: false };
      req.params.id = '123';

      Post.findOne = jest.fn().mockResolvedValue(mockPost);

      await getPostById(req, res, next);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: '123', isDeleted: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
        message: 'Post retrieved successfully'
      });
      expect(logger.info).toHaveBeenCalledWith('Retrieved post', { postId: '123' });
    });

    it('should return 404 when post not found', async () => {
      req.params.id = '999';

      Post.findOne = jest.fn().mockResolvedValue(null);

      await getPostById(req, res, next);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: '999', isDeleted: false });
      expect(logger.warn).toHaveBeenCalledWith('Post not found', { postId: '999' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Post not found'
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      req.params.id = '123';

      Post.findOne = jest.fn().mockRejectedValue(mockError);

      await getPostById(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error retrieving post', { error: mockError.message, postId: '123' });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPostData = { title: 'New Post', content: 'New Content', author: 'New Author' };
      const mockCreatedPost = { _id: '456', ...mockPostData, isDeleted: false, createdAt: new Date(), updatedAt: new Date() };

      req.body = mockPostData;

      Post.prototype.save = jest.fn().mockResolvedValue(mockCreatedPost);
      Post.mockImplementation(() => ({
        save: Post.prototype.save
      }));

      await createPost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedPost,
        message: 'Post created successfully'
      });
      expect(logger.info).toHaveBeenCalledWith('Post created', { postId: '456', title: 'New Post' });
    });

    it('should handle validation errors', async () => {
      const mockError = new Error('Validation failed');
      mockError.name = 'ValidationError';
      req.body = { title: '', content: '', author: '' };

      Post.prototype.save = jest.fn().mockRejectedValue(mockError);
      Post.mockImplementation(() => ({
        save: Post.prototype.save
      }));

      await createPost(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error creating post', { error: mockError.message });
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database write failed');
      req.body = { title: 'Test', content: 'Test', author: 'Test' };

      Post.prototype.save = jest.fn().mockRejectedValue(mockError);
      Post.mockImplementation(() => ({
        save: Post.prototype.save
      }));

      await createPost(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error creating post', { error: mockError.message });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const mockUpdatedPost = { _id: '123', title: 'Updated Post', content: 'Updated Content', author: 'Updated Author', isDeleted: false };
      req.params.id = '123';
      req.body = { title: 'Updated Post', content: 'Updated Content' };

      Post.findOneAndUpdate = jest.fn().mockResolvedValue(mockUpdatedPost);

      await updatePost(req, res, next);

      expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', isDeleted: false },
        { title: 'Updated Post', content: 'Updated Content' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedPost,
        message: 'Post updated successfully'
      });
      expect(logger.info).toHaveBeenCalledWith('Post updated', { postId: '123' });
    });

    it('should return 404 when post not found', async () => {
      req.params.id = '999';
      req.body = { title: 'Updated Post' };

      Post.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await updatePost(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith('Post not found for update', { postId: '999' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Post not found'
      });
    });

    it('should handle validation errors', async () => {
      const mockError = new Error('Validation failed');
      mockError.name = 'ValidationError';
      req.params.id = '123';
      req.body = { title: '' };

      Post.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);

      await updatePost(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error updating post', { error: mockError.message, postId: '123' });
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database update failed');
      req.params.id = '123';
      req.body = { title: 'Updated' };

      Post.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);

      await updatePost(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error updating post', { error: mockError.message, postId: '123' });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deletePost', () => {
    it('should soft delete a post', async () => {
      const mockDeletedPost = { _id: '123', title: 'Deleted Post', isDeleted: true };
      req.params.id = '123';

      Post.findOneAndUpdate = jest.fn().mockResolvedValue(mockDeletedPost);

      await deletePost(req, res, next);

      expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeletedPost,
        message: 'Post deleted successfully'
      });
      expect(logger.info).toHaveBeenCalledWith('Post deleted', { postId: '123' });
    });

    it('should return 404 when post not found', async () => {
      req.params.id = '999';

      Post.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await deletePost(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith('Post not found for deletion', { postId: '999' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Post not found'
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database delete failed');
      req.params.id = '123';

      Post.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);

      await deletePost(req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error deleting post', { error: mockError.message, postId: '123' });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
