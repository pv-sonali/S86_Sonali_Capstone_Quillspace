import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/image';

const PostCard = ({ post, onEdit, isOwnPost = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const postLink = post.slug ? `/post/${post.slug}` : `/post/${post._id}`;

  return (
    <article className="glass rounded-xl hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 group relative">
      {isOwnPost && onEdit && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post._id);
            }}
            className="text-xs px-3 py-1 bg-gold/20 text-gold hover:bg-gold/30 rounded transition-colors"
          >
            ✏️ Edit
          </button>
        </div>
      )}
      <Link to={postLink} className="block h-full p-6">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border -m-6 mb-6">
            <img
              src={getImageUrl(post.coverImage)}
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-text mb-3 group-hover:text-gold transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm sm:text-base text-text-secondary line-clamp-3 mb-4 leading-relaxed">
          {post.content?.slice(0, 150)}...
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gold/10 border border-gold/20 text-gold rounded-full"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-text-secondary/70">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
              {post.author?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <span className="text-sm text-text-secondary block">
                {post.author?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-text-secondary/70">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary/70">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>💬 {post.comments?.length || 0}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
