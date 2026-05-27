const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { mongoIdValidation } = require('../utils/validationRules');

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarks for current user
 * @access  Private
 */
router.get('/', protect, getBookmarks);

/**
 * @route   POST /api/bookmarks/:id
 * @desc    Add a post to bookmarks
 * @access  Private
 */
router.post('/:id', protect, mongoIdValidation, validate, addBookmark);

/**
 * @route   DELETE /api/bookmarks/:id
 * @desc    Remove a post from bookmarks
 * @access  Private
 */
router.delete('/:id', protect, mongoIdValidation, validate, removeBookmark);

/**
 * @route   GET /api/bookmarks/:id/check
 * @desc    Check if a post is bookmarked
 * @access  Private
 */
router.get('/:id/check', protect, mongoIdValidation, validate, checkBookmark);

module.exports = router;
