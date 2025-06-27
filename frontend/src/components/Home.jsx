import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Sun, Moon, Menu, X } from 'lucide-react';
import DropdownSidebar from "../components/DropdownSidebar";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal"; // Add this import
import BookCard from './BookCard';
import axios from "axios";

const Home = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Fallback for when localStorage is not available
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [modalType, setModalType] = useState("login");
  const [connectionError, setConnectionError] = useState(null);
  const [books, setBooks] = useState([]); // ✅ This line was missing

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    const root = document.documentElement;
    try {
      if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, [darkMode]);
  useEffect(() => {
  setBooks([
    {
      id: 1,
      title: "The Count of Monte Cristo",
      author: "Alexandre Dumas",
      duration: "49 hours",
      language: "English",
      image: "https://archive.org/services/img/count_monte_cristo_librivox",
      rssUrl: "https://librivox.org/bookfeeds/count-of-monte-cristo-by-alexandre-dumas.xml",
      tags: ["Fiction", "1800s"]
    },
    {
      id: 2,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      duration: "12 hours",
      language: "English",
      image: "https://archive.org/services/img/pride_and_prejudice_librivox",
      rssUrl: "https://librivox.org/bookfeeds/pride-and-prejudice-by-jane-austen.xml",
      tags: ["Romance", "Classic"]
    }
  ]);
}, []);

  useEffect(() => {
  const controller = new AbortController();
  
  const checkLogin = async () => {
    try {
      setConnectionError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      console.log('Attempting to connect to backend...');
      
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        signal: controller.signal // Add this line
      });

      console.log('Backend response:', res.data);
      setIsLoggedIn(!!res.data);
      
    } catch (error) {
      // Don't update state if request was cancelled
      if (error.name === 'CanceledError' || controller.signal.aborted) {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Backend connection error:', error);
      setIsLoggedIn(false);
      setConnectionError(error.message);
    }
  };

  checkLogin();

  // Cleanup function
  return () => {
    controller.abort();
  };
}, []); // Empty dependency array

  const closeModal = () => {
    setIsLoggedIn(true);
    setConnectionError(null);
  };
  
  const switchToSignup = () => setModalType("signup");
  const switchToLogin = () => setModalType("login");

  // Loading state
  if (isLoggedIn === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div>Connecting to server...</div>
          {connectionError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold">Connection Error:</p>
              <p>{connectionError}</p>
              <div className="mt-2 text-sm">
                <p>Please check:</p>
                <ul className="list-disc list-inside">
                  <li>Backend server is running on port 5000</li>
                  <li>CORS is properly configured</li>
                  <li>API endpoint '/api/auth/me' exists</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* If not logged in, blur home and show modal */}
      {!isLoggedIn && (
        <>
          <div className="fixed inset-0 z-30 backdrop-blur-sm bg-black/30"></div>
          {modalType === "login" && (
            <LoginModal onClose={closeModal} onSwitchToSignup={switchToSignup} />
          )}
          {modalType === "signup" && (
            <SignupModal onClose={closeModal} onSwitchToLogin={switchToLogin} />
          )}
        </>
      )}

      {/* Topbar */}
      <div className={`flex relative items-center justify-between p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} transition duration-300`}>
        <Link to="/" className="mr-4">
          <img
            src="/logobr.png"
            alt="logo"
            className="h-10 ml-2 sm:ml-6 cursor-pointer hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Search - Desktop only */}
        <div className="hidden sm:flex items-center border border-gray-400 rounded-full px-4 py-1 w-full max-w-md mx-6 bg-[#D2ECC1]">
          <Search className="w-5 h-5 text-gray-700 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-gray-700 w-full"
          />
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4 mr-4">
          <User className="w-7 h-7 text-[#D2ECC1] cursor-pointer" />

          <button onClick={() => setDarkMode(!darkMode)} className="hidden sm:block">
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
          </button>

          <button onClick={toggleMenu}>
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-[#D2ECC1]" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-[#D2ECC1]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 py-2 bg-[#D2ECC1] transition-all">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-400 bg-white text-black outline-none"
          />
        </div>
      </div>

      {/* Sidebar */}
      {menuOpen && <DropdownSidebar darkMode={darkMode} />}
      {/*BookCard*/}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {books.map(book => <BookCard key={book.id} book={book} />)}
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && connectionError && (
        <div className="fixed bottom-4 right-4 p-3 bg-red-500 text-white rounded shadow-lg max-w-sm">
          <p className="text-sm font-semibold">Backend Connection Issue:</p>
          <p className="text-xs">{connectionError}</p>
        </div>
      )}
    </>
  );
};

export default Home;