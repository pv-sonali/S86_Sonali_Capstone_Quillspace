const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new comment
 * @route   POST /api/comments
 * @access  Private
 */
const createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // If parentCommentId is provided, check if it exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return sendError(res, 404, 'Parent comment not found');
      }
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parentComment: parentCommentId || null,
    });

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate author details
    await comment.populate('author', 'username profileImage');

    sendSuccess(res, 201, 'Comment created successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a specific post
 * @route   GET /api/comments/:postId
 * @access  Public
 */
const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Get all comments for this post
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username profileImage')
      .populate('parentComment')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Comments retrieved successfully', {
      comments,
      count: comments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    // Check if user is comment author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this comment');
    }

    const { content } = req.body;
    if (content) {
      comment.content = content;
    }

    await comment.save();
    await comment.populate('author', 'username profileImage');

    sendSuccess(res, 200, 'Comment updated successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    // Get the post to check if user is post creator
    const post = await Post.findById(comment.post);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Check if user is comment author, post creator, or admin
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isPostCreator = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostCreator && !isAdmin) {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await comment.deleteOne();

    sendSuccess(res, 200, 'Comment and replies deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
};
