import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../context/useAuth";

import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Use the new login method

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    console.log('🔍 Attempting login with:', { email, password: '***' });

    try {
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:5000/api/auth/login',
        data: {
          email: email.trim().toLowerCase(),
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: true
      });

      console.log('✅ Login successful:', response.data);

      if (response.data && response.data.token) {
        // Use the context login method instead of manual localStorage
        login(response.data.token, response.data.user);
        
        // Close modal
        onClose();
        
        console.log('🎉 Login process completed successfully');
        
      } else {
        setError('Login successful but no token received');
        console.error('❌ No token in response:', response.data);
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check if the server is running.';
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.error('❌ Server error response:', { status, data });
        
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = data?.message || 'Invalid email or password.';
            break;
          case 404:
            errorMessage = 'Login service not found. Please check if the server is running.';
            break;
          case 500:
            errorMessage = data?.message || 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data?.message || `Server error (${status}). Please try again.`;
        }
      } else if (err.request) {
        console.error('❌ No response received:', err.request);
        errorMessage = 'Cannot connect to server. Please check if the server is running on http://localhost:5000';
      } else {
        console.error('❌ Request setup error:', err.message);
        errorMessage = `Request failed: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-8 rounded-xl w-full max-w-md shadow-2xl transform animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToSignup} 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              disabled={loading}
            >
              Sign up 
            </button>
          </p>
          
          <button 
            onClick={onClose} 
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;