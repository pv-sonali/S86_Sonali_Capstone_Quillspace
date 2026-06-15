const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  toggleLike,
  getStats,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createPostValidation,
  updatePostValidation,
  mongoIdValidation,
} = require('../utils/validationRules');

/**
 * @route   GET /api/posts/stats
 * @desc    Get platform statistics (total posts, likes, comments)
 * @access  Public
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/posts/slug/:slug
 * @desc    Get single post by slug
 * @access  Public
 * IMPORTANT: This MUST be declared before /:id to avoid Express
 * matching "slug" as an :id param (#1 — critical fix)
 */
router.get('/slug/:slug', optionalAuth, getPostBySlug);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', protect, createPostValidation, validate, createPost);

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination and filtering
 * @access  Public
 */
router.get('/', optionalAuth, getAllPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, mongoIdValidation, validate, getPostById);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  mongoIdValidation,
  updatePostValidation,
  validate,
  updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete('/:id', protect, mongoIdValidation, validate, deletePost);

/**
 * @route   PUT /api/posts/:id/like
 * @desc    Like/Unlike a post
 * @access  Private
 */
router.put('/:id/like', protect, mongoIdValidation, validate, toggleLike);

module.exports = router;
