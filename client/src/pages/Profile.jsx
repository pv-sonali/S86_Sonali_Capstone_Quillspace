import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, MapPin, Edit3, Globe, FileText, PenTool } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { getImageUrl } from '../utils/image';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('published');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const userRes = await api.get(`/users/profile/${username}`);
      const u = userRes.data.data.user;
      setProfileUser(u);
      setFollowersCount(u.followersCount || u.followers?.length || 0);

      // Check if current user is following this profile
      if (currentUser && !isOwnProfile) {
        const isAlreadyFollowing = u.followers?.some(
          (id) => id?.toString() === currentUser._id?.toString() || id === currentUser._id
        );
        setIsFollowing(!!isAlreadyFollowing);
      }

      // Fetch posts by this user
      const postsParams = { author: u._id, limit: 50 };
      if (isOwnProfile) {
        postsParams.includeDrafts = 'true';
      }

      const postsRes = await api.get('/posts', { params: postsParams });
      setPosts(postsRes.data.data.posts || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.put(`/users/${profileUser._id}/unfollow`);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await api.put(`/users/${profileUser._id}/follow`);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = isOwnProfile ? posts.filter((p) => p.status === 'draft') : [];

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  const tabs = [
    { id: 'published', label: 'Published', count: publishedPosts.length },
    ...(isOwnProfile ? [{ id: 'drafts', label: 'Drafts', count: draftPosts.length }] : []),
  ];

  const currentPosts = activeTab === 'drafts' ? draftPosts : publishedPosts;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <User className="w-16 h-16 text-text-secondary" />
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 ml-56 px-6 py-8 max-w-5xl">

          <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-bg bg-accent/20 flex items-center justify-center relative z-10 text-accent shadow-xl">
                {profileUser.profileImage ? (
                  <img
                    src={getImageUrl(profileUser.profileImage)}
                    alt={profileUser.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text">{profileUser.username}</h1>
                    {profileUser.location && (
                      <p className="flex items-center text-text-secondary text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" /> {profileUser.location}
                      </p>
                    )}
                    <p className="text-text-secondary/70 text-sm mt-1">
                      Member since {formatDate(profileUser.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {isOwnProfile ? (
                      <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center px-4 py-2 border border-accent/50 text-accent rounded-lg hover:bg-accent/10 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          isFollowing
                            ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/40'
                            : 'bg-accent text-white hover:bg-accent-hover'
                        }`}
                      >
                        {followLoading ? '...' : isFollowing ? 'Following ✓' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>

                {profileUser.bio && (
                  <p className="text-text-secondary mt-4 leading-relaxed">
                    {profileUser.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{publishedPosts.length}</p>
                <p className="text-text-secondary/70 text-sm">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{followersCount}</p>
                <p className="text-text-secondary/70 text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{profileUser.followingCount || 0}</p>
                <p className="text-text-secondary/70 text-sm">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{totalViews}</p>
                <p className="text-text-secondary/70 text-sm">Views</p>
              </div>
            </div>

            {profileUser.socialLinks && Object.values(profileUser.socialLinks).some(Boolean) && (
              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-border">
                {profileUser.socialLinks.github && (
                  <a href={profileUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-secondary hover:text-accent transition-colors text-sm">
                    <FaGithub className="w-4 h-4 mr-2" /> GitHub
                  </a>
                )}
                {profileUser.socialLinks.twitter && (
                  <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-secondary hover:text-accent transition-colors text-sm">
                    <FaTwitter className="w-4 h-4 mr-2" /> Twitter/X
                  </a>
                )}
                {profileUser.socialLinks.linkedin && (
                  <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-secondary hover:text-accent transition-colors text-sm">
                    <FaLinkedin className="w-4 h-4 mr-2" /> LinkedIn
                  </a>
                )}
                {profileUser.socialLinks.website && (
                  <a href={profileUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-text-secondary hover:text-accent transition-colors text-sm">
                    <Globe className="w-4 h-4 mr-2" /> Website
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex gap-1 mb-6 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-accent border-b-2 border-accent -mb-px bg-accent/5'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-accent/20 text-accent'
                      : 'bg-border text-text-secondary'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {currentPosts.length === 0 ? (
              <div className="text-center py-16 bg-bg-secondary rounded-2xl border border-border">
                <FileText className="w-12 h-12 mx-auto mb-4 text-text-secondary/50" />
                <h3 className="text-xl font-bold text-text mb-2">
                  {activeTab === 'drafts' ? 'No drafts yet' : 'No posts published yet'}
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  {isOwnProfile
                    ? activeTab === 'drafts'
                      ? 'Save a post as draft to see it here.'
                      : "You haven't published anything yet. Start writing!"
                    : `${profileUser.username} hasn't published any posts yet.`}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/create')}
                    className="flex items-center mx-auto px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <PenTool className="w-5 h-5 mr-2" /> Write your first post
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {currentPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onEdit={isOwnProfile ? handleEditPost : null}
                    isOwnPost={isOwnProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
