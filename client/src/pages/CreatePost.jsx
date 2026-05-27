import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const CreatePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEditing = !!postId;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    coverImage: '',
    status: 'published',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Load existing post data if editing
  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPost = async () => {
    try {
      const res = await api.get(`/posts/${postId}`);
      const post = res.data.data.post;

      // Verify ownership
      if (post.author._id !== user?._id && post.author !== user?._id) {
        setError('You are not authorized to edit this post.');
        return;
      }

      setFormData({
        title: post.title || '',
        content: post.content || '',
        tags: post.tags?.join(', ') || '',
        coverImage: post.coverImage || '',
        status: post.status || 'published',
      });
    } catch (err) {
      // #31 — use proper error message extraction
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || err.message
        || 'Failed to load post';
      setError(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid image type. Please use JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Maximum size is 5MB.');
      return;
    }

    setImageUploading(true);
    setError('');
    try {
      const formDataImg = new FormData();
      formDataImg.append('image', file);
      const res = await api.post('/upload', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, coverImage: res.data.data.url }));
    } catch (err) {
      // #31 — extract server message first
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.[0]?.msg
        || err.message
        || 'Image upload failed';
      setError(msg);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [],
        coverImage: formData.coverImage,
        status: submitStatus || formData.status,
      };

      let res;
      if (isEditing) {
        res = await api.put(`/posts/${postId}`, payload);
      } else {
        res = await api.post('/posts', payload);
      }

      const savedPost = res.data.data.post;
      navigate(`/post/${savedPost.slug}`);
    } catch (err) {
      // #31 — proper server error extraction
      const serverErrors = err.response?.data?.errors;
      const msg = serverErrors && serverErrors.length > 0
        ? serverErrors.map((e) => e.msg).join('; ')
        : err.response?.data?.message
        || err.message
        || (isEditing ? 'Failed to update post' : 'Failed to create post');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">
              {isEditing ? '✏️ Edit Post' : '✍️ Create Post'}
            </h1>
            <p className="text-text-secondary mt-1">
              {isEditing ? 'Update your article' : 'Share your ideas with the community'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-text-secondary hover:text-gold transition-colors text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <form onSubmit={(e) => handleSubmit(e, 'published')}>
            {/* Title */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="An interesting title for your post..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-button-dark border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors text-lg"
                />
                <p className="text-xs text-text-secondary/50 mt-1">{formData.title.length}/200</p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Cover Image</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg or upload below"
                    className="flex-1 px-4 py-3 bg-button-dark border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                  <label className="px-4 py-3 bg-button-dark border border-border rounded-xl text-text-secondary hover:text-gold hover:border-gold transition-colors cursor-pointer text-sm whitespace-nowrap">
                    {imageUploading ? 'Uploading...' : '📁 Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                </div>
                {formData.coverImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-border h-40">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        setError('Invalid image URL');
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your post content here. Share your knowledge, ideas, or stories..."
                  rows={18}
                  className="w-full px-4 py-3 bg-button-dark border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors resize-y text-sm leading-relaxed"
                />
                <p className="text-xs text-text-secondary/50 mt-1">{formData.content.length} characters</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Tags <span className="text-text-secondary/50 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="technology, programming, design, ai"
                  className="w-full px-4 py-3 bg-button-dark border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors text-sm"
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gold/10 border border-gold/20 text-gold rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 flex-wrap">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none px-8 py-3 bg-gold text-button-dark font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publishing...' : isEditing ? '✅ Update Post' : '🚀 Publish'}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, 'draft')}
                className="flex-1 sm:flex-none px-8 py-3 border border-border text-text-secondary rounded-xl hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
              >
                📝 Save as Draft
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="px-6 py-3 text-text-secondary hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
