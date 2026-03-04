import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import axios from 'axios';
import { LogOut, ChevronDown, ChevronUp, Pencil, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

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
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const token = localStorage.getItem('token');
  const objectUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialLoadRef = useRef(false);

  const getAvatarUrl = useCallback(() => {
    if (selectedFile && objectUrlRef.current) return objectUrlRef.current;
    if (user?.avatar) return `http://localhost:5000/uploads/${user.avatar}?t=${avatarKey}`;
    return '/default-avatar.png';
  }, [user?.avatar, selectedFile, avatarKey]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || initialLoadRef.current) return;
      initialLoadRef.current = true;

      try {
        const { data } = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setIsInitialized(true);
        setAvatarKey(Date.now());
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setError('Failed to load profile');
        setIsInitialized(true);
      }
    };

    fetchProfile();
  }, [token, setUser]);

  useLayoutEffect(() => {
    if (isInitialized && !selectedFile) {
      setAvatarPreview(getAvatarUrl());
    }
  }, [isInitialized, selectedFile, getAvatarUrl]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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
    if (!file) return;

    if (!file.type.startsWith('image/')) return setError('Invalid image file');
    if (file.size > 5 * 1024 * 1024) return setError('Max size 5MB');

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    objectUrlRef.current = URL.createObjectURL(file);
    setSelectedFile(file);
    setAvatarPreview(objectUrlRef.current);
    setEditAvatarMode(false);
    setError('');
  };

  const cancelAvatarEdit = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    setEditAvatarMode(false);
    fileInputRef.current && (fileInputRef.current.value = '');
    setAvatarPreview(getAvatarUrl());
    setError('');
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

      const { data } = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(data);
      setSelectedFile(null);
      fileInputRef.current && (fileInputRef.current.value = '');
      setAvatarKey(Date.now());
      setAvatarPreview(getAvatarUrl());
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordFields(false);
      alert('✅ Profile updated');
    } catch (err) {
      console.error('❌ Update error:', err);
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      alert(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarError = useCallback((e) => {
    if (!e.target.src.includes('default-avatar')) {
      e.target.src = '/default-avatar.png';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!isInitialized) return <div className="p-6 text-center">Loading...</div>;
  if (!user) return <div className="p-6 text-center text-red-500">User not found</div>;

  return (
    <div className={`p-6 max-w-xl mx-auto rounded-xl shadow-md relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="absolute top-4 left-4 sm:hidden">
        <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
      </div>

      <div className="absolute top-4 right-4">
        <button onClick={handleLogout} className="text-red-500 flex items-center">
          <LogOut className="mr-1" size={18} /> Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center">
          <img
            key={`${user.avatar}-${avatarKey}`}
            src={avatarPreview}
            onError={handleAvatarError}
            className="w-24 h-24 rounded-full object-cover border dark:border-green-400"
            alt="avatar"
          />
          {!editAvatarMode ? (
            <button type="button" onClick={() => setEditAvatarMode(true)} className="text-sm text-teal-400 hover:underline mt-1">
              <Pencil className="inline mr-1" size={14} /> Edit Avatar
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 mt-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
              <button type="button" onClick={cancelAvatarEdit} className="text-xs text-red-400 hover:underline">
                <X size={12} className="inline mr-1" /> Cancel
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Username"
          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />

        <button
          type="button"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="flex items-center gap-2 text-sm text-teal-400 hover:underline"
        >
          {showPasswordFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
        </button>

        {showPasswordFields && (
          <>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              required
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 rounded w-full text-white ${isLoading ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'}`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
