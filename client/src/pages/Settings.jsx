import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Lock, AlertTriangle, Globe, Check, Trash2 } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import api from '../services/api';
import { validatePassword } from '../utils/validation';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      twitter: user?.socialLinks?.twitter || '',
      linkedin: user?.socialLinks?.linkedin || '',
      website: user?.socialLinks?.website || '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const key = name.replace('social_', '');
      setProfileData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await api.put(`/users/${user._id}`, {
        username: profileData.username,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        socialLinks: profileData.socialLinks,
      });

      const updatedUser = { ...user, ...profileData };
      updateUser(updatedUser);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to update profile'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!validatePassword(passwordData.newPassword)) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) {
      setProfileError(`Type your username "${user?.username}" to confirm deletion`);
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${user._id}`);
      logout();
      navigate('/');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 ml-56 px-6 py-8 max-w-3xl">
          <div className="mb-8 border-b border-border pb-6 flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-text" />
            <div>
              <h1 className="text-3xl font-bold text-text">Settings</h1>
              <p className="text-text-secondary mt-1">Manage your account preferences and profile details</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-5 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'profile' ? 'text-accent border-b-2 border-accent -mb-px bg-accent/5' : 'text-text-secondary hover:text-text'}`}
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center px-5 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'password' ? 'text-accent border-b-2 border-accent -mb-px bg-accent/5' : 'text-text-secondary hover:text-text'}`}
            >
              <Lock className="w-4 h-4 mr-2" /> Password
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center px-5 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'danger' ? 'text-red-400 border-b-2 border-red-500 -mb-px bg-red-500/5' : 'text-text-secondary hover:text-text'}`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Danger Zone
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{profileError}</p>
                </div>
              )}
              {profileSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">{profileSuccess}</p>
                </div>
              )}

              <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-text">Profile Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={3}
                    maxLength={500}
                    placeholder="Tell others about yourself..."
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                  <p className="text-xs text-text-secondary/50 mt-1">{profileData.bio.length}/500</p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-text">Social Links</h2>

                {[
                  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: FaGithub },
                  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username', icon: FaTwitter },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: FaLinkedin },
                  { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com', icon: Globe },
                ].map(({ key, label, placeholder, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text mb-2 flex items-center">
                      <Icon className="w-4 h-4 mr-2" /> {label}
                    </label>
                    <input
                      type="url"
                      name={`social_${key}`}
                      value={profileData.socialLinks[key]}
                      onChange={handleProfileChange}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {profileLoading ? 'Saving...' : <><Check className="w-5 h-5 mr-2" /> Save Changes</>}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm">{passwordSuccess}</p>
                </div>
              )}

              <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-bold text-text">Change Password</h2>

                {[
                  { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                  { name: 'newPassword', label: 'New Password', placeholder: '••••••••', hint: 'At least 8 characters' },
                  { name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
                ].map(({ name, label, placeholder, hint }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-text mb-2">{label}</label>
                    <input
                      type="password"
                      name={name}
                      value={passwordData[name]}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, [name]: e.target.value }))}
                      placeholder={placeholder}
                      autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                    />
                    {hint && <p className="text-xs text-text-secondary/60 mt-1">{hint}</p>}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : <><Check className="w-5 h-5 mr-2" /> Update Password</>}
              </button>
            </form>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Delete Account</h2>
                <p className="text-text-secondary text-sm mb-4">
                  This action is <strong className="text-text">irreversible</strong>. All your posts, comments, and data will be permanently deleted.
                </p>
                {profileError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{profileError}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text">
                    Type <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{user?.username}</code> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={user?.username}
                    className="w-full px-4 py-2.5 bg-surface border border-red-500/30 rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirm !== user?.username}
                    className="flex items-center px-6 py-3 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500 hover:text-white border border-red-500/50 transition-all disabled:opacity-50"
                  >
                    {deleteLoading ? 'Processing...' : <><Trash2 className="w-5 h-5 mr-2" /> Permanently Delete Account</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
