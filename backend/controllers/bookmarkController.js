const User = require('../models/User');
const Post = require('../models/Post');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all bookmarks for current user
 * @route   GET /api/bookmarks
 * @access  Private
 */
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      match: { status: 'published' },
      populate: {
        path: 'author',
        select: 'username profileImage',
      },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'Bookmarks retrieved successfully', {
      bookmarks: user.bookmarks,
      count: user.bookmarks.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a post to bookmarks
 * @route   POST /api/bookmarks/:id
 * @access  Private
 */
const addBookmark = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const user = await User.findById(req.user.id);
    const alreadyBookmarked = user.bookmarks.some((id) => id.equals(postId));

    if (alreadyBookmarked) {
      return sendError(res, 400, 'Post is already bookmarked');
    }

    await User.findByIdAndUpdate(req.user.id, { $push: { bookmarks: postId } });

    sendSuccess(res, 200, 'Post bookmarked successfully', { bookmarked: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a post from bookmarks
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
const removeBookmark = async (req, res, next) => {
  try {
    const postId = req.params.id;

    await User.findByIdAndUpdate(req.user.id, { $pull: { bookmarks: postId } });

    sendSuccess(res, 200, 'Bookmark removed successfully', { bookmarked: false });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if a post is bookmarked by current user
 * @route   GET /api/bookmarks/:id/check
 * @access  Private
 */
const checkBookmark = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);

    const bookmarked = user.bookmarks.some((id) => id.equals(postId));

    sendSuccess(res, 200, 'Bookmark status retrieved', { bookmarked });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
};
