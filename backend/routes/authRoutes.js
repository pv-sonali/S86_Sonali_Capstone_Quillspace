const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} = require('../utils/validationRules');

// Strict rate limit for auth endpoints (#36 — was using general 120/min)
const authRateLimit = rateLimit({ windowMs: 60 * 1000, max: 10 });

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, registerValidation, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', authRateLimit, loginValidation, validate, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', protect, changePasswordValidation, validate, changePassword);

module.exports = router;
