import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import axios from 'axios';
import { LogOut, ChevronDown, ChevronUp, Pencil, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const getAvatarUrl = (avatar) => {
  if (!avatar) return '/default-avatar.png';
  return `http://localhost:5000/uploads/${avatar}?t=${Date.now()}`;
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('/default-avatar.png');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [editAvatarMode, setEditAvatarMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force re-render key

  const token = localStorage.getItem('token');
  const objectUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Single source of truth for avatar URL
  const getDisplayAvatar = useCallback(() => {
    if (selectedFile && objectUrlRef.current) {
      return objectUrlRef.current;
    }
    if (user?.avatar) {
      return `http://localhost:5000/uploads/${user.avatar}?t=${avatarKey}`;
    }
    return '/default-avatar.png';
  }, [user?.avatar, selectedFile, avatarKey]);

  // Fetch profile on mount - only once
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || initialLoadRef.current) return;
      
      initialLoadRef.current = true;
      
      try {
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data;
        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setIsInitialized(true);
        setAvatarKey(Date.now()); // Update avatar key on initial load
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile");
        setIsInitialized(true);
      }
    };

    fetchProfile();
  }, [token, setUser]);

  // Use useLayoutEffect to prevent flickering - synchronous DOM updates
  useLayoutEffect(() => {
    if (isInitialized && !selectedFile) {
      const newAvatarUrl = getDisplayAvatar();
      setAvatarPreview(newAvatarUrl);
    }
  }, [isInitialized, selectedFile, getDisplayAvatar]);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Clean up previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      
      // Update state in proper order to prevent flickering
      setSelectedFile(file);
      setAvatarPreview(objectUrl);
      setEditAvatarMode(false);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (selectedFile) formData.append('image', selectedFile);
      if (showPasswordFields && newPassword && currentPassword) {
        formData.append('password', newPassword);
        formData.append('currentPassword', currentPassword);
      }

      const res = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const updated = res.data;
      
      console.log('Profile update response:', updated); // Debug log
      
      // Update user data first
      setUser(updated);
      
      // Clean up file selection state
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Force avatar update with new key and cache busting
      const newAvatarKey = Date.now();
      setAvatarKey(newAvatarKey);
      
      const newAvatarUrl = updated.avatar 
        ? `http://localhost:5000/uploads/${updated.avatar}?t=${newAvatarKey}` 
        : '/default-avatar.png';
      
      console.log('New avatar URL:', newAvatarUrl); // Debug log
      setAvatarPreview(newAvatarUrl);
      
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordFields(false);

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error('Update error:', err);
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      alert(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAvatarEdit = () => {
    // Clean up in proper order
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    setSelectedFile(null);
    setEditAvatarMode(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset to current user avatar with cache busting
    const resetUrl = user?.avatar 
      ? `http://localhost:5000/uploads/${user.avatar}?t=${avatarKey}`
      : '/default-avatar.png';
    setAvatarPreview(resetUrl);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleAvatarError = useCallback((e) => {
    // Prevent infinite loops by checking current src
    if (e.target.src !== window.location.origin + "/default-avatar.png") {
      console.log('Avatar load error, falling back to default'); // Debug log
      e.target.src = "/default-avatar.png";
    }
  }, []);

  // Show loading until everything is properly initialized
  if (!isInitialized) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-300">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-300">
        User not found
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 max-w-xl mx-auto rounded-xl shadow-md relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="absolute top-4 left-4 sm:hidden">
        <button onClick={() => setDarkMode(!darkMode)} className="text-yellow-400 hover:text-yellow-300">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <button onClick={handleLogout} className="text-red-500 hover:text-red-400 flex items-center">
          <LogOut className="mr-1" size={18} /> Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded border">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="relative">
            <img
              key={`${user?.avatar}-${avatarKey}`} // Force re-render when avatar or key changes
              src={avatarPreview}
              alt="avatar"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white dark:border-green-500 transition-opacity duration-200"
              onError={handleAvatarError}
              onLoad={() => console.log('Avatar loaded:', avatarPreview)} // Debug log
              style={{ 
                minHeight: '96px', 
                minWidth: '96px',
                backgroundColor: '#f3f4f6' // Fallback background
              }}
            />
          </div>
          {!editAvatarMode ? (
            <button 
              type="button" 
              onClick={() => setEditAvatarMode(true)} 
              className="text-sm text-green-400 hover:underline flex items-center"
            >
              <Pencil className="mr-1" size={16} /> Edit Avatar
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="text-xs text-gray-600 dark:text-gray-300" 
              />
              <button 
                type="button" 
                onClick={cancelAvatarEdit} 
                className="text-xs text-red-400 hover:underline flex items-center"
              >
                <X className="mr-1" size={12} /> Cancel
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="button"
          onClick={() => setShowPasswordFields(prev => !prev)}
          className="flex items-center gap-2 text-sm text-green-400 hover:underline"
        >
          {showPasswordFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
        </button>

        {showPasswordFields && (
          <>
            <input
              type="password"
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 rounded w-full sm:w-auto text-white ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;