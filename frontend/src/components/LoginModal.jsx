import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../context/useAuth";
import { AlertCircle, CheckCircle, Loader2, LogIn, Sparkles, Heart, X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
        setSuccess('Login successful! Welcome back!');
        
        // Use the context login method
        login(response.data.token, response.data.user);
        
        // Close modal after showing success
        setTimeout(() => {
          onClose();
        }, 1500);
        
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
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={handleOverlayClick}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md mx-4"
          style={{ perspective: '1000px' }}
        >
          <div className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-zinc-800 dark:text-zinc-100 p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-xl overflow-hidden">

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all z-10"
            >
              <X size={20} />
            </motion.button>

            <div className="text-center mb-8 relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-block mb-4"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                  />
                  <LogIn size={32} className="text-white relative z-10" />
                  <motion.div animate={{ y: [-2, -8, -2], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute -top-2 -right-2">
                    <Sparkles size={16} className="text-yellow-400" />
                  </motion.div>
                  <motion.div animate={{ y: [-2, -6, -2], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} className="absolute -bottom-1 -left-2">
                    <Heart size={12} className="text-pink-400" />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Welcome Back</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-3">
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={loading} 
                    required 
                  />
                </div>
                
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={loading} 
                    required 
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl"
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl"
                >
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <div className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToSignup} 
                className="text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text font-bold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300"
                disabled={loading}
              >
                Sign up
              </button>
            </div>

            <div className="text-center mt-2">
              <button 
                onClick={onClose} 
                className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {/* Animated Background Elements */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
              transition={{ 
                rotate: { duration: 15, repeat: Infinity, ease: 'linear' }, 
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } 
              }} 
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-20 blur-sm" 
            />
            <motion.div 
              animate={{ rotate: -360, scale: [1.2, 1, 1.2] }} 
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, 
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } 
              }} 
              className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-sm" 
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;