import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Flame, Bookmark, Search, PenTool } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams();
  const { user, token } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [trending, setTrending] = useState([]);
  const [recommendedWriters, setRecommendedWriters] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // Determine current page type
  const isMyPostsPage = location.pathname === '/my-posts';
  const isDraftsPage = location.pathname === '/drafts';
  const isTrendingPage = location.pathname === '/trending';
  const isBookmarksPage = location.pathname === '/bookmarks';
  const isExplore = location.pathname === '/explore';
  const isCategoryPage = location.pathname.startsWith('/category/');

  // Extract search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Reset page on route change
  useEffect(() => {
    setPage(1);
  }, [location.pathname, searchQuery]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch posts based on current page
  useEffect(() => {
    if (token) fetchPosts();
  }, [page, location.pathname, token, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch sidebar data — use dedicated smaller queries (#41 — was fetching 100 posts)
  useEffect(() => {
    if (token) fetchSidebarData();
  }, [token]);

  const fetchSidebarData = async () => {
    try {
      // Fetch recent posts for sidebar (small limit)
      const recentRes = await api.get('/posts', { params: { limit: 5, page: 1 } });
      const recent = recentRes.data.data.posts || [];
      setRecentPosts(recent);

      // Fetch trending — top liked posts
      const trendingRes = await api.get('/posts', { params: { limit: 10, page: 1, sort: '-likes' } });
      const trendingPosts = trendingRes.data.data.posts || [];

      // Calculate trending topics from those posts' tags
      const tagMap = {};
      trendingPosts.forEach((post) => {
        post.tags?.forEach((tag) => {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
      });
      const trendingTags = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTrending(trendingTags);

      // Get recommended writers
      const writerMap = {};
      trendingPosts.forEach((post) => {
        if (!post.author) return;
        const authorId = post.author._id || post.author;
        if (!writerMap[authorId]) {
          writerMap[authorId] = {
            _id: post.author._id || post.author,
            username: post.author.username || 'Unknown',
            postCount: 0,
          };
        }
        writerMap[authorId].postCount++;
      });
      const writers = Object.values(writerMap)
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5);
      setRecommendedWriters(writers);
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');

      let params = { page, limit: 10 };

      if (isBookmarksPage) {
        // Fetch real bookmarks from the bookmarks endpoint
        const res = await api.get('/bookmarks');
        setPosts(res.data.data.bookmarks || []);
        setTotalPages(1);
        setLoading(false);
        return;
      } else if (isMyPostsPage && user) {
        params.author = user._id;
        params.includeDrafts = 'true'; // Show own published + drafts (#10 — now auth-protected)
      } else if (isDraftsPage && user) {
        params.author = user._id;
        params.includeDrafts = 'true';
      } else if (isTrendingPage) {
        params.sort = '-likes'; // #9 — now actually supported
      } else if (isCategoryPage && category) {
        params.tag = category;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/posts', { params });
      let fetchedPosts = response.data.data.posts || [];

      // Client-side filter for drafts page (since backend returns all statuses for owner)
      if (isDraftsPage) {
        fetchedPosts = fetchedPosts.filter((p) => p.status === 'draft');
      } else if (isMyPostsPage) {
        // My Posts shows all — no additional filter
      }

      setPosts(fetchedPosts);
      setTotalPages(response.data.data.pagination?.total || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const getPageTitle = () => {
    if (searchQuery) return { title: <span className="flex items-center"><Search className="w-6 h-6 mr-2" /> Search: "{searchQuery}"</span>, subtitle: `Results for "${searchQuery}"` };
    if (isMyPostsPage) return { title: 'My Posts', subtitle: 'All your published articles and drafts.' };
    if (isDraftsPage) return { title: 'Drafts', subtitle: 'Your unpublished drafts.' };
    if (isTrendingPage) return { title: <span className="flex items-center"><Flame className="w-6 h-6 mr-2 text-accent" /> Trending</span>, subtitle: 'Most liked posts right now.' };
    if (isBookmarksPage) return { title: <span className="flex items-center"><Bookmark className="w-6 h-6 mr-2 text-accent" /> Bookmarks</span>, subtitle: 'Your saved posts.' };
    if (isExplore) return { title: <span className="flex items-center"><Search className="w-6 h-6 mr-2" /> Explore</span>, subtitle: 'Discover great content from all writers.' };
    if (isCategoryPage) return { title: `#${category}`, subtitle: `Posts tagged with #${category}` };
    return { title: 'Latest from QuillSpace', subtitle: 'Discover thoughtful stories and ideas from our community.' };
  };

  const pageInfo = getPageTitle();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="flex pt-20">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Feed */}
        <main className="flex-1 ml-56 mr-80 px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">{pageInfo.title}</h1>
            <p className="text-text-secondary">{pageInfo.subtitle}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* No Posts State */}
          {!loading && posts.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-20 h-20 text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-text mb-2">
                {isBookmarksPage ? 'No bookmarks yet' : isDraftsPage ? 'No draft posts' : isMyPostsPage ? 'Nothing posted yet' : 'No posts found'}
              </h3>
              <p className="text-text-secondary text-center max-w-md mb-6">
                {isBookmarksPage
                  ? 'Save posts you want to read later by clicking the bookmark icon on any post.'
                  : isMyPostsPage
                  ? "You haven't created any posts yet. Start writing your first story!"
                  : isDraftsPage
                  ? "You don't have any draft posts."
                  : searchQuery
                  ? `No posts found for "${searchQuery}". Try a different search term.`
                  : 'Be the first to share your thoughts. Create your first blog and inspire others.'}
              </p>
              {!isBookmarksPage && (
                <button
                  onClick={() => navigate('/create')}
                  className="flex items-center px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <PenTool className="w-5 h-5 mr-2" /> Write your first blog
                </button>
              )}
            </div>
          )}

          {/* Posts List */}
          {!loading && posts.length > 0 && (
            <>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onEdit={(isMyPostsPage || isDraftsPage) ? handleEditPost : null}
                    isOwnPost={isMyPostsPage || isDraftsPage}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-bg/50 border border-border rounded-lg text-text hover:bg-bg/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <div className="text-text-secondary">
                    Page <span className="font-bold text-text">{page}</span> of{' '}
                    <span className="font-bold text-text">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-bg/50 border border-border rounded-lg text-text hover:bg-bg/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          trending={trending}
          recommendedWriters={recommendedWriters}
          recentPosts={recentPosts}
        />
      </div>
    </div>
  );
};

export default Home;
