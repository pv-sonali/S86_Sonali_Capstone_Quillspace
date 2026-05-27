const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createCommentValidation,
  updateCommentValidation,
  mongoIdValidation,
  postIdParamValidation, // #3 — was using mongoIdValidation which checked param 'id' not 'postId'
} = require('../utils/validationRules');

/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post('/', protect, createCommentValidation, validate, createComment);

/**
 * @route   GET /api/comments/:postId
 * @desc    Get all comments for a specific post
 * @access  Public
 * Fixed: now uses postIdParamValidation which validates param('postId') not param('id')
 */
router.get('/:postId', postIdParamValidation, validate, getCommentsByPost);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  mongoIdValidation,
  updateCommentValidation,
  validate,
  updateComment
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:id', protect, mongoIdValidation, validate, deleteComment);

module.exports = router;
