import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { AuthContext } from '../context/AuthContext';
import { validateEmail, validateUsername, validatePassword } from '../utils/validation'; // #37

const Signup = () => {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) { // #2 — shared util >= 8
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const data = await register({ username, email, password });
      if (data && data.success) {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const EyeToggle = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary bg-transparent border-none p-0 focus:outline-none hover:text-text transition-colors"
    >
      {show ? (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-screen">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="glass p-8 sm:p-10 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <span className="text-4xl">✒️</span>
              </div>
              <h1 className="text-3xl font-bold text-text mb-2">Join QuillSpace</h1>
              <p className="text-text-secondary">Start your writing journey today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors duration-300"
                />
                <p className="text-xs text-text-secondary/70 mt-1">3-20 characters, alphanumeric with - and _</p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors duration-300"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors duration-300"
                  />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </div>
                <p className="text-xs text-text-secondary/70 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 bg-button-dark border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-gold transition-colors duration-300"
                  />
                  <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
                {confirmPassword && password === confirmPassword && confirmPassword.length >= 8 && (
                  <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-text-secondary text-sm mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-gold hover:text-yellow-400 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-text-secondary hover:text-gold transition-colors text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
