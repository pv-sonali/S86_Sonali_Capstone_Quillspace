import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import CreatePost from '../pages/CreatePost';
import PostDetail from '../pages/PostDetail';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import ForgotPassword from '../pages/ForgotPassword';

// ProtectedRoute uses AuthContext properly (not raw localStorage) (#25)
const ProtectedRoute = ({ element }) => {
  const { token, isAuthChecked } = useContext(AuthContext);

  // Show spinner while validating token (#44 — was returning null = blank screen)
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading QuillSpace...</p>
        </div>
      </div>
    );
  }

  return token ? element : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
        <Route path="/edit/:postId" element={<ProtectedRoute element={<CreatePost />} />} />
        <Route path="/profile/:username" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} /> {/* #13 */}

        {/* Feature Routes — use Home with context */}
        <Route path="/explore" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/trending" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/bookmarks" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/drafts" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/my-posts" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/category/:category" element={<ProtectedRoute element={<Home />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
