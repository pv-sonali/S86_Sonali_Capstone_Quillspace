const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const postCount = await Post.countDocuments({ author: user._id, status: 'published' });

    sendSuccess(res, 200, 'User retrieved successfully', {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt,
        postCount,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res, next) => {
  try {
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this user');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const { username, email, bio, profileImage, location, socialLinks } = req.body;

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (location !== undefined) user.location = location;
    if (socialLinks) {
      user.socialLinks = {
        github: socialLinks.github !== undefined ? socialLinks.github : user.socialLinks.github,
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : user.socialLinks.twitter,
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : user.socialLinks.linkedin,
        website: socialLinks.website !== undefined ? socialLinks.website : user.socialLinks.website,
      };
    }

    await user.save();

    sendSuccess(res, 200, 'User updated successfully', {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        socialLinks: user.socialLinks,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (cascade posts + comments) (#7)
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this user');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Get all post IDs for this user
    const userPosts = await Post.find({ author: user._id }).select('_id');
    const postIds = userPosts.map((p) => p._id);

    // Delete all comments on those posts
    if (postIds.length > 0) {
      await Comment.deleteMany({ post: { $in: postIds } });
    }

    // Delete all comments authored by this user
    await Comment.deleteMany({ author: user._id });

    // Remove this user from other users' followers/following lists
    await User.updateMany(
      { followers: user._id },
      { $pull: { followers: user._id } }
    );
    await User.updateMany(
      { following: user._id },
      { $pull: { following: user._id } }
    );

    // Remove user's bookmarks from nothing (user is being deleted, nothing to clean up)

    // Delete all posts
    await Post.deleteMany({ author: user._id });

    // Delete user
    await user.deleteOne();

    sendSuccess(res, 200, 'User and all associated data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by username
 * @route   GET /api/users/profile/:username
 * @access  Public
 */
const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const postCount = await Post.countDocuments({ author: user._id, status: 'published' });

    sendSuccess(res, 200, 'User retrieved successfully', {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt,
        postCount,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Follow a user (#14)
 * @route   PUT /api/users/:id/follow
 * @access  Private
 */
const followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return sendError(res, 400, 'You cannot follow yourself');
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found');
    }

    const alreadyFollowing = targetUser.followers.some((id) => id.equals(currentUserId));
    if (alreadyFollowing) {
      return sendError(res, 400, 'You are already following this user');
    }

    // Add to target's followers and current user's following
    await Promise.all([
      User.findByIdAndUpdate(targetId, { $push: { followers: currentUserId } }),
      User.findByIdAndUpdate(currentUserId, { $push: { following: targetId } }),
    ]);

    sendSuccess(res, 200, 'User followed successfully', {
      followersCount: targetUser.followers.length + 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unfollow a user (#14)
 * @route   PUT /api/users/:id/unfollow
 * @access  Private
 */
const unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found');
    }

    await Promise.all([
      User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } }),
      User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } }),
    ]);

    sendSuccess(res, 200, 'User unfollowed successfully', {
      followersCount: Math.max(0, targetUser.followers.length - 1),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
};
