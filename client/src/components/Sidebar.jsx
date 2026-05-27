import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenu = [
    { icon: '🏠', label: 'Home', path: '/home' },
    { icon: '🔥', label: 'Trending', path: '/trending' }, // #29 — was empty string
    { icon: '🔖', label: 'Bookmarks', path: '/bookmarks' },
    { icon: '📝', label: 'Drafts', path: '/drafts' },
    { icon: '✍️', label: 'My Posts', path: '/my-posts' },
  ];

  const categories = [
    'Technology',
    'Productivity',
    'Career',
    'Design',
    'AI',
    'Education',
    'Lifestyle',
    'Entrepreneurship',
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 w-56 h-screen bg-button-dark border-r border-border overflow-y-auto pt-20 z-40">
      <div className="p-4 space-y-6">
        {/* Main Menu */}
        <nav className="space-y-1">
          {mainMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-gold/20 text-gold'
                  : 'text-text-secondary hover:text-text hover:bg-bg/30'
              }`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Categories */}
        <div>
          <h3 className="text-xs uppercase font-bold text-text-secondary/70 px-4 mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
                className={`w-full text-left px-4 py-2 text-sm hover:text-gold hover:bg-bg/20 rounded-lg transition-colors duration-200 ${
                  location.pathname === `/category/${cat.toLowerCase()}`
                    ? 'text-gold bg-bg/20'
                    : 'text-text-secondary'
                }`}
              >
                #{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Write Card */}
        <div className="bg-bg/50 border border-border rounded-xl p-4 text-center mt-6">
          <span className="text-3xl mb-2 block">✒️</span>
          <h4 className="font-bold text-text mb-2 text-sm">Share Your Story</h4>
          <p className="text-xs text-text-secondary/70 mb-4">
            Write and publish your ideas with the world.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="w-full bg-gold text-button-dark font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-200 text-sm"
          >
            Create Blog
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
