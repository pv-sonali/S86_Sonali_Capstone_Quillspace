import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/image';
import { Edit3, Heart, MessageSquare } from 'lucide-react';

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
    <article className="bg-card border border-white/5 rounded-2xl p-2 sm:p-0 hover:bg-card-hover hover:-translate-y-[2px] transition-all duration-200 group relative">
      {isOwnPost && onEdit && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post._id);
            }}
            className="flex items-center text-xs px-3 py-1 bg-accent/20 text-accent hover:bg-accent/30 rounded transition-colors"
          >
            <Edit3 className="w-3 h-3 mr-1" /> Edit
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
        <h3 className="text-lg sm:text-xl font-semibold text-text mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-2">
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
                className="px-3 py-1 text-xs bg-accent/10 border border-accent/20 text-[#A5B4FC] rounded-full hover:bg-accent/20 transition-colors"
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
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
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
            <span className="flex items-center"><Heart className="w-3 h-3 mr-1" /> {post.likes?.length || 0}</span>
            <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> {post.comments?.length || 0}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
