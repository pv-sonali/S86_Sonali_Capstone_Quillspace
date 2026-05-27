const express = require('express');
const router = express.Router();
const {
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  updateUserValidation,
  mongoIdValidation,
} = require('../utils/validationRules');

/**
 * @route   GET /api/users/profile/:username
 * @desc    Get user by username
 * @access  Public
 * IMPORTANT: Must be before /:id to prevent 'profile' matching as an id
 */
router.get('/profile/:username', getUserByUsername);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', mongoIdValidation, validate, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  mongoIdValidation,
  updateUserValidation,
  validate,
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private
 */
router.delete('/:id', protect, mongoIdValidation, validate, deleteUser);

/**
 * @route   PUT /api/users/:id/follow
 * @desc    Follow a user (#14)
 * @access  Private
 */
router.put('/:id/follow', protect, mongoIdValidation, validate, followUser);

/**
 * @route   PUT /api/users/:id/unfollow
 * @desc    Unfollow a user (#14)
 * @access  Private
 */
router.put('/:id/unfollow', protect, mongoIdValidation, validate, unfollowUser);

module.exports = router;
