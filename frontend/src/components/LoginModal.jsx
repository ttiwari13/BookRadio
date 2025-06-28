import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔍 Attempting login with:', { email, password: '***' });
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // Add this for CORS
      });
      
      console.log('✅ Login successful:', res.data);
      
      // Token ko localStorage me save karo
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      // Success ke baad modal band karo
      onClose();
      
      // Optional: page reload ya user redirect karna ho to yahan karo
      // window.location.reload();
      
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error message:', err.message);
      
      if (err.response) {
        // Server responded with error status
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error - cannot connect to server');
      } else {
        // Something else happened
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="mt-3 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-blue-500 hover:underline">
            Sign up
          </button>
        </div>
        <button onClick={onClose} className="mt-3 text-sm text-center text-gray-500 hover:underline w-full">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;