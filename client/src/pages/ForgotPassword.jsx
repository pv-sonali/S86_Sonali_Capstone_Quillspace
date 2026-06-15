import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { validateEmail } from '../utils/validation';
import { Lock, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Password reset email is sent — in production, this calls a /auth/forgot-password endpoint
      // For now we show the confirmation UI (#20 — was a dead href="#forgot" link)
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-screen">
        <div className="w-full max-w-md">
          <div className="glass p-8 sm:p-10 rounded-2xl">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <Lock className="w-12 h-12 mx-auto text-accent mb-4" />
                  <h1 className="text-3xl font-bold text-text mb-2">Forgot Password?</h1>
                  <p className="text-text-secondary">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto text-accent mb-6" />
                <h2 className="text-2xl font-bold text-text mb-4">Check Your Email</h2>
                <p className="text-text-secondary mb-2">
                  If an account exists for <span className="text-accent font-medium">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <p className="text-text-secondary/70 text-sm mb-8">
                  Check your spam folder if you don't see it within a few minutes.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/login')}
                className="text-text-secondary hover:text-accent transition-colors text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
