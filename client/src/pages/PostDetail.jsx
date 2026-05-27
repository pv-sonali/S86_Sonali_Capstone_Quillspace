import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (post && token) {
      // Initialize like state based on current user
      const userLiked = user && post.likes?.some((id) => {
        const likeId = typeof id === 'object' ? id._id || id : id;
        return likeId?.toString() === user._id?.toString();
      });
      setLiked(!!userLiked);
      setLikeCount(post.likes?.length || 0);

      // Check bookmark status
      fetchBookmarkStatus();
    }
  }, [post, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/posts/slug/${slug}`);
      const p = res.data.data.post;
      setPost(p);
      setComments(p.comments || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Post not found. It may have been deleted or the link is invalid.');
      } else {
        setError(err.response?.data?.message || 'Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkStatus = async () => {
    if (!token || !post?._id) return;
    try {
      const res = await api.get(`/bookmarks/${post._id}/check`);
      setBookmarked(res.data.data.bookmarked);
    } catch {
      // ignore — non-critical
    }
  };

  const handleLike = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      const { liked: nowLiked, likeCount: newCount } = res.data.data;
      setLiked(nowLiked);
      setLikeCount(newCount);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (bookmarkLoading) return;

    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${post._id}`);
        setBookmarked(false);
      } else {
        await api.post(`/bookmarks/${post._id}`);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      // Native share on mobile devices
      try {
        await navigator.share({ title: post?.title, text: post?.content?.slice(0, 100), url });
      } catch {
        // User cancelled or not supported
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // Manual fallback
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    if (newComment.trim().length > 1000) {
      setCommentError('Comment is too long (max 1000 characters)');
      return;
    }

    setCommentLoading(true);
    setCommentError('');
    try {
      const res = await api.post('/comments', {
        content: newComment.trim(),
        postId: post._id,
      });
      const newCommentData = res.data.data.comment;
      setComments((prev) => [...prev, newCommentData]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPostOwner = user && post && user._id === post.author?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-text-secondary">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-6xl">📄</p>
          <h2 className="text-2xl font-bold text-text">Post Not Found</h2>
          <p className="text-text-secondary max-w-md text-center">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 bg-gold text-button-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors mb-8"
        >
          ← Back
        </button>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-border">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-gold/10 border border-gold/20 text-gold rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author & Meta */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border mb-8">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.username}`}>
              <div className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center font-bold text-gold text-lg hover:bg-gold/40 transition-colors">
                {post.author?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </Link>
            <div>
              <Link to={`/profile/${post.author?.username}`} className="font-semibold text-text hover:text-gold transition-colors">
                {post.author?.username || 'Unknown'}
              </Link>
              <p className="text-text-secondary text-sm">
                {formatDate(post.createdAt)}
                {post.views > 0 && <span className="ml-2">· {post.views} views</span>}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Like Button (#32) */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                liked
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'border-border text-text-secondary hover:border-red-400/50 hover:text-red-400'
              } disabled:opacity-50`}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>

            {/* Bookmark Button (#14) */}
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                bookmarked
                  ? 'bg-gold/20 border-gold/50 text-gold'
                  : 'border-border text-text-secondary hover:border-gold/50 hover:text-gold'
              } disabled:opacity-50`}
            >
              <span>{bookmarked ? '🔖' : '📌'}</span>
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>

            {/* Share Button (#21, #32) */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-text-secondary hover:border-gold/50 hover:text-gold transition-all duration-200 text-sm font-medium"
            >
              <span>🔗</span>
              <span>{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Edit Button (owner only) */}
            {isPostOwner && (
              <button
                onClick={() => navigate(`/edit/${post._id}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-all duration-200 text-sm font-medium"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="prose-blog whitespace-pre-wrap text-text-secondary leading-8 mb-16 text-base sm:text-lg">
          {post.content}
        </div>

        {/* Comments Section */}
        <div className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold text-text mb-6">
            💬 Comments ({comments.length}) {/* #33 — shows live comments array length */}
          </h2>

          {/* Comment Form */}
          {token ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              {commentError && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{commentError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/30 flex items-center justify-center font-bold text-gold text-sm flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-button-dark border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-secondary/50">{newComment.length}/1000</span>
                    <button
                      type="submit"
                      disabled={commentLoading || !newComment.trim()}
                      className="px-5 py-2 bg-gold text-button-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-bg/50 border border-border rounded-xl text-center">
              <p className="text-text-secondary mb-3">Join the conversation</p>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-gold text-button-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
              >
                Sign in to comment
              </button>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">💬</p>
              <p className="text-text-secondary">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 p-4 bg-button-dark border border-border rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold text-xs flex-shrink-0">
                    {comment.author?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-text text-sm">{comment.author?.username || 'Unknown'}</span>
                      <span className="text-xs text-text-secondary/50 flex-shrink-0">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed break-words">{comment.content}</p>
                  </div>
                  {/* Delete button for comment owner or post owner */}
                  {(user?._id === (comment.author?._id || comment.author) || isPostOwner) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-text-secondary/40 hover:text-red-400 transition-colors flex-shrink-0 text-xs mt-0.5"
                      title="Delete comment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
