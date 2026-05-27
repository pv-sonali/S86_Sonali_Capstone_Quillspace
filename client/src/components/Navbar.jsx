import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useContext(AuthContext);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
  ];

  // Don't show landing nav links on dashboard pages
  const showNavLinks = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-button-dark border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(isLoggedIn ? '/home' : '/')}
          >
            <span className="text-2xl">✒️</span>
            <span className="text-xl sm:text-2xl font-bold text-text">QuillSpace</span>
          </div>

          {/* Desktop Navigation Links (landing only) */}
          {showNavLinks && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-secondary hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Search Bar (dashboard only) */}
          {isLoggedIn && !showNavLinks && (
            <div className="hidden md:flex items-center flex-1 mx-8 max-w-md">
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Search for blogs, writers, topics..."
                  className="w-full px-4 py-2 bg-bg/50 border border-border rounded-lg text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/home?search=${encodeURIComponent(e.target.value.trim())}`);
                    }
                  }}
                />
                <svg
                  className="absolute right-3 top-2.5 w-4 h-4 text-text-secondary pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn && !showNavLinks ? (
              <>
                {/* Notifications */}
                <button className="hidden sm:flex p-2 hover:bg-bg/30 rounded-lg transition-colors relative items-center justify-center">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                {/* Write Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/create')}
                  className="hidden sm:inline-flex gap-2"
                >
                  ✍️ Write
                </Button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full bg-gold/30 flex items-center justify-center text-sm font-bold text-gold hover:bg-gold/40 transition-colors"
                    title={user?.username}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-bg border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-semibold text-text">{user?.username}</p>
                        <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate(`/profile/${user?.username}`); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          👤 My Profile
                        </button>
                        <button
                          onClick={() => { navigate('/my-posts'); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          ✍️ My Posts
                        </button>
                        <button
                          onClick={() => { navigate('/bookmarks'); setShowProfileMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          🔖 Bookmarks
                        </button>
                        <button
                          onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} // #13 — was /settings which didn't exist
                          className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-bg/50 transition-colors flex items-center gap-2"
                        >
                          ⚙️ Settings
                        </button>
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              !showNavLinks || !isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Button variant="ghost" size="sm" to="/login">
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm" to="/signup">
                    Get Started
                  </Button>
                </div>
              ) : null
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-bg/30 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border animate-fade-in">
            {showNavLinks && navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-text-secondary hover:text-gold hover:bg-button-dark rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isLoggedIn ? (
              <div className="px-4 py-2 space-y-2">
                <button onClick={() => { navigate('/create'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-text-secondary hover:text-gold transition-colors">✍️ Write</button>
                <button onClick={() => { navigate(`/profile/${user?.username}`); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-text-secondary hover:text-gold transition-colors">👤 Profile</button>
                <button onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-text-secondary hover:text-gold transition-colors">⚙️ Settings</button>
                <button onClick={handleLogout} className="w-full text-left py-2 text-red-400 hover:text-red-300 transition-colors">🚪 Logout</button>
              </div>
            ) : (
              <div className="px-4 py-3 flex gap-3">
                <Button variant="ghost" size="sm" to="/login" className="flex-1">Sign In</Button>
                <Button variant="primary" size="sm" to="/signup" className="flex-1">Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
