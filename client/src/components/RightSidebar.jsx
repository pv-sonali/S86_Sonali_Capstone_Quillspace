import { useNavigate } from 'react-router-dom';

const RightSidebar = ({ trending, recommendedWriters, recentPosts }) => {
  const navigate = useNavigate();

  return (
    <aside className="fixed right-0 top-0 w-80 h-screen bg-button-dark border-l border-border overflow-y-auto pt-20 p-6 space-y-6 z-40">
      {/* Trending Topics */}
      <div>
        <h3 className="text-lg font-bold text-text mb-4">🔥 Trending Topics</h3>
        {trending && trending.length > 0 ? (
          <div className="space-y-2">
            {trending.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/category/${topic.tag.toLowerCase()}`)}
                className="w-full text-left p-3 bg-bg/30 rounded-lg hover:bg-bg/50 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-gold">#{topic.tag}</p>
                <p className="text-xs text-text-secondary/70">{topic.count} {topic.count === 1 ? 'post' : 'posts'}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">📈</p>
            <p className="text-sm text-text-secondary/70">No trending topics yet.</p>
            <p className="text-xs text-text-secondary/50 mt-1">Check back later!</p>
          </div>
        )}
      </div>

      {/* Recommended Writers
      <div>
        <h3 className="text-lg font-bold text-text mb-4">👥 Writers to Follow</h3>
        {recommendedWriters && recommendedWriters.length > 0 ? (
          <div className="space-y-2">
            {recommendedWriters.map((writer) => (
              <div
                key={writer._id}
                className="flex items-center justify-between p-3 bg-bg/30 rounded-lg hover:bg-bg/50 transition-colors"
              >
                <button
                  onClick={() => navigate(`/profile/${writer.username}`)}
                  className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/30 flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                    {writer.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{writer.username}</p>
                    <p className="text-xs text-text-secondary/70">{writer.postCount} posts</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/profile/${writer.username}`)}
                  className="text-xs px-3 py-1 border border-gold text-gold rounded hover:bg-gold hover:text-button-dark transition-colors ml-2 flex-shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-sm text-text-secondary/70">No writers yet.</p>
            <p className="text-xs text-text-secondary/50 mt-1">Be the first to write!</p>
          </div>
        )}
      </div>
      */}

      {/* Recently Published */}
      <div>
        <h3 className="text-lg font-bold text-text mb-4">📚 Recently Published</h3>
        {recentPosts && recentPosts.length > 0 ? (
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <button
                key={post._id}
                onClick={() => navigate(`/post/${post.slug}`)}
                className="w-full text-left p-3 bg-bg/30 rounded-lg hover:bg-bg/50 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-text line-clamp-2 hover:text-gold transition-colors">{post.title}</p>
                <p className="text-xs text-text-secondary/70 mt-1">
                  By {post.author?.username || 'Unknown'}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">📚</p>
            <p className="text-sm text-text-secondary/70">No blogs published yet.</p>
            <p className="text-xs text-text-secondary/50 mt-1">Be the first to publish!</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
