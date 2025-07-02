import React, { useState } from 'react';

import { AlertCircle, CheckCircle, Loader2, User, Sparkles, Heart, X, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from "../api/axios"; 
const SignupModal = ({ onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
     const res = await API.post('/auth/register', {
        username: name,
        email,
        password
      });

      setSuccess('Signup successful! Redirecting...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
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
                  <User size={32} className="text-white relative z-10" />
                  <motion.div animate={{ y: [-2, -8, -2], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute -top-2 -right-2">
                    <Sparkles size={16} className="text-yellow-400" />
                  </motion.div>
                  <motion.div animate={{ y: [-2, -6, -2], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} className="absolute -bottom-1 -left-2">
                    <Heart size={12} className="text-pink-400" />
                  </motion.div>
                </div>
              </motion.div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Create Account</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Join BookRadio and enjoy stories</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5 relative z-10">
              <div className="space-y-3">
                <input type="text" placeholder="Full Name" className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none" value={name} onChange={e => setName(e.target.value)} disabled={loading} required />
                <input type="email" placeholder="Email Address" className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required />
                <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl">
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </motion.div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing Up...
                  </span>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <div className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text font-bold hover:from-teal-700 hover:to-cyan-700 transition-all duration-300">Sign in</button>
            </div>

            <div className="text-center mt-2">
              <button onClick={onClose} className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Cancel</button>
            </div>

            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ rotate: { duration: 15, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-20 blur-sm" />
            <motion.div animate={{ rotate: -360, scale: [1.2, 1, 1.2] }} transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-sm" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;
