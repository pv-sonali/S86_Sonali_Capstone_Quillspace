const { body, param } = require('express-validator');

// Auth validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Username must contain only letters, numbers, hyphens, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }) // #2 — was 6, now 8 to match frontend
    .withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Post validation rules
const createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const updatePostValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

// Comment validation rules
const createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID'),
];

const updateCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

// User validation rules
const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Username must contain only letters, numbers, hyphens, and underscores'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }) // #2 — was 6
    .withMessage('Password must be at least 8 characters'),
];

// ID validation
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

// Specific postId param validation (#3 — was using 'id' for postId param)
const postIdParamValidation = [
  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID format'),
];

module.exports = {
  registerValidation,
  loginValidation,
  createPostValidation,
  updatePostValidation,
  createCommentValidation,
  updateCommentValidation,
  updateUserValidation,
  changePasswordValidation,
  mongoIdValidation,
  postIdParamValidation,
};
