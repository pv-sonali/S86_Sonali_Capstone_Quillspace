const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return sendError(res, 401, 'User not found');
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return sendError(res, 401, 'Not authorized, token invalid or expired');
    }
  } else {
    return sendError(res, 401, 'Not authorized, no token provided');
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
