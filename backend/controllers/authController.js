const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Helper to build safe user object
const buildUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profileImage: user.profileImage,
  bio: user.bio,
  location: user.location || '',
  socialLinks: user.socialLinks || { github: '', twitter: '', linkedin: '', website: '' },
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, bio, profileImage } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return sendError(res, 400, 'User with this email or username already exists');
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      bio: bio || '',
      profileImage: profileImage || '',
    });

    const token = generateToken(user._id);

    sendSuccess(res, 201, 'User registered successfully', {
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    sendSuccess(res, 200, 'Login successful', {
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User retrieved successfully', {
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current password and new password are required');
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
