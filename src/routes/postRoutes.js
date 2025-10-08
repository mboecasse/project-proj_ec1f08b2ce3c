// File: src/routes/postRoutes.js
// Generated: 2025-10-08 12:31:59 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_1c27rt3c6m3p


const express = require('express');

const { authenticate } = require('../middleware/auth');

const { validatePost, validatePostUpdate } = require('../middleware/validator');


const router = express.Router();

const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

router.get('/', getAllPosts);

router.get('/:id', getPostById);

router.post('/', authenticate, validatePost, createPost);

router.put('/:id', authenticate, validatePostUpdate, updatePost);

router.delete('/:id', authenticate, deletePost);

module.exports = router;
