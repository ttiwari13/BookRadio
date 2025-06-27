import React, { useState } from 'react';
import axios from 'axios';

const SignupModal = ({ onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username: name,
        email,
        password
      });
      setSuccess('Signup successful! Please log in.');
      // Optionally: Auto-switch to login modal after signup
      setTimeout(() => {
        setSuccess('');
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 mb-3 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-500 mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-3 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-500 hover:underline">
            Log in
          </button>
        </div>
        <button onClick={onClose} className="mt-3 text-sm text-center text-gray-500 hover:underline w-full">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
