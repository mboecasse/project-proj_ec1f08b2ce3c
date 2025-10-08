// File: src/controllers/postController.js
// Generated: 2025-10-08 12:31:55 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_j4yw4v4o6mkt


const Post = require('../models/Post');


const logger = require('../utils/logger');

const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    logger.info('Fetching all posts', { page, limit });

    const [posts, total] = await Promise.all([
      Post.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ isDeleted: false })
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info('Posts fetched successfully', { count: posts.length, total, page, totalPages });

    return res.status(200).json(successResponse({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: total,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, 'Posts retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching posts', { error: error.message, stack: error.stack });
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Fetching post by ID', { postId: id });

    const post = await Post.findOne({ _id: id, isDeleted: false }).lean();

    if (!post) {
      logger.warn('Post not found', { postId: id });
      return res.status(404).json(errorResponse('Post not found'));
    }

    logger.info('Post fetched successfully', { postId: id });

    return res.status(200).json(successResponse(post, 'Post retrieved successfully'));
  } catch (error) {
    logger.error('Error fetching post by ID', { postId: req.params.id, error: error.message, stack: error.stack });
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, author } = req.body;

    logger.info('Creating new post', { title, author });

    const post = new Post({
      title,
      content,
      author
    });

    await post.save();

    logger.info('Post created successfully', { postId: post._id, title });

    return res.status(201).json(successResponse(post, 'Post created successfully'));
  } catch (error) {
    logger.error('Error creating post', { error: error.message, stack: error.stack, body: req.body });
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    logger.info('Updating post', { postId: id });

    const post = await Post.findOne({ _id: id, isDeleted: false });

    if (!post) {
      logger.warn('Post not found for update', { postId: id });
      return res.status(404).json(errorResponse('Post not found'));
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (author !== undefined) post.author = author;

    await post.save();

    logger.info('Post updated successfully', { postId: id });

    return res.status(200).json(successResponse(post, 'Post updated successfully'));
  } catch (error) {
    logger.error('Error updating post', { postId: req.params.id, error: error.message, stack: error.stack });
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Soft deleting post', { postId: id });

    const post = await Post.findOne({ _id: id, isDeleted: false });

    if (!post) {
      logger.warn('Post not found for deletion', { postId: id });
      return res.status(404).json(errorResponse('Post not found'));
    }

    post.isDeleted = true;
    await post.save();

    logger.info('Post soft deleted successfully', { postId: id });

    return res.status(200).json(successResponse({ id: post._id }, 'Post deleted successfully'));
  } catch (error) {
    logger.error('Error deleting post', { postId: req.params.id, error: error.message, stack: error.stack });
    next(error);
  }
};
