import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { validatePassword } from '../utils/validation'; // #37

const EditProfile = ({ user, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    location: user.location || '', // #45
    socialLinks: {
      github: user.socialLinks?.github || '',
      twitter: user.socialLinks?.twitter || '',
      linkedin: user.socialLinks?.linkedin || '',
      website: user.socialLinks?.website || '',
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const key = name.replace('social_', '');
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsLoading(true);
      await api.put(`/users/${user._id}`, {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        socialLinks: formData.socialLinks,
      });

      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        socialLinks: formData.socialLinks,
      };
      updateUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePassword(passwordData.newPassword)) { // #2 — was checking < 8 inline, now uses shared util
      setError('Password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to change password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* #23 — was max-h-96 (384px) which clipped content; now uses max-h-[90vh] */}
      <div className="bg-bg rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-bg border-b border-border p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-text">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text rounded-lg hover:bg-bg/50 transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {!isChangingPassword ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Location (#45) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleProfileChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleProfileChange}
                  rows="3"
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              {/* Social Links (#19) */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text mb-3">Social Links</h3>
                {[
                  { key: 'github', label: '🐙 GitHub', placeholder: 'https://github.com/username' },
                  { key: 'twitter', label: '🐦 Twitter/X', placeholder: 'https://twitter.com/username' },
                  { key: 'linkedin', label: '💼 LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                  { key: 'website', label: '🌐 Website', placeholder: 'https://yourwebsite.com' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="mb-3">
                    <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
                    <input
                      type="url"
                      name={`social_${key}`}
                      value={formData.socialLinks[key]}
                      onChange={handleProfileChange}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gold text-button-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="flex-1 px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold/10 transition-colors"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-button-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors"
                />
                <p className="text-xs text-text-secondary/60 mt-1">At least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gold text-button-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-button-dark transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
