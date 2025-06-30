import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, User, Sun, Moon, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import DropdownSidebar from "../components/DropdownSidebar";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import BookCard from './BookCard';
import axios from "axios";
import { useAuth } from "../context/useAuth";
import Footer from './Footer';
import Profile from './Profile';
import Feedback from './FloatingFeedbackButton';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [modalType, setModalType] = useState("login");
  const [connectionError, setConnectionError] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckRef = useRef(false);
  const [showProfile, setShowProfile] = useState(false);

  const [filters, setFilters] = useState({
    language: '', genre: '', duration: '', author: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    languages: [], genres: [], authors: []
  });

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const urlFilters = {
      language: searchParams.get('language') || '',
      genre: searchParams.get('genre') || '',
      duration: searchParams.get('duration') || '',
      author: searchParams.get('author') || ''
    };
    setFilters(urlFilters);
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleProfile = () => setShowProfile(prev => !prev);

  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    setSearchParams(params);
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    updateFilters({ language: '', genre: '', duration: '', author: '' });
  };

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

  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const checkLogin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setAuthChecked(true);
          return;
        }
        setIsLoggedIn(true);
        setAuthChecked(true);
        try {
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }, timeout: 8000
          });
          if (!res.data) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
        } catch (error) {
          if (error.response && (error.response.status === 401 || 403)) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
        }
      } catch {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
      } finally {
        setAuthChecked(true);
      }
    };

    checkLogin();
  }, [setIsLoggedIn]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (initialLoad) setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) queryParams.set("q", searchQuery.trim());
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.trim() !== '') queryParams.set(key, value);
        });
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '12');
        const res = await axios.get(`http://localhost:5000/api/books?${queryParams.toString()}`, { timeout: 10000 });
        const data = res.data;
        setBooks(Array.isArray(data) ? data : data.books || data.data || []);
      } catch (error) {
        console.error("Fetch error:", error.message);
        setBooks([]);
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          setConnectionError('Connection timeout. Please check your internet.');
        } else if (error.code === 'ERR_NETWORK') {
          setConnectionError('Network error. Please check if the server is running.');
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books/filters', { timeout: 5000 });
        if (res.data) {
          setFilterOptions(prev => ({
            ...prev,
            languages: res.data.languages || [],
            genres: res.data.genres || [],
            authors: res.data.authors || []
          }));
        }
      } catch {
        setFilterOptions(prev => ({
          ...prev,
          languages: ['English', 'Hindi'],
          genres: ['Fiction', 'Romance'],
          authors: ['Agatha Christie']
        }));
      }
    };

    if (authChecked) {
      fetchBooks();
      if (initialLoad) fetchFilterOptions();
    }
  }, [currentPage, authChecked, initialLoad, filters, searchQuery]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const closeModal = () => {
    setIsLoggedIn(true);
    setConnectionError(null);
    setAuthChecked(true);
    authCheckRef.current = true;
  };

  const switchToSignup = () => setModalType("signup");
  const switchToLogin = () => setModalType("login");

  if (!authChecked) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black'}`}>
      {!isLoggedIn && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" />
          {modalType === "login" && <LoginModal onClose={closeModal} onSwitchToSignup={switchToSignup} />}
          {modalType === "signup" && <SignupModal onClose={closeModal} onSwitchToLogin={switchToLogin} />}
        </>
      )}

      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b shadow">
  <div className="container mx-auto flex justify-between items-center px-4 py-3 gap-4">
    {/* Logo */}
    <Link to="/" className="shrink-0">
      <img src="/logobr.png" alt="logo" className="h-10" />
    </Link>

    {/* Search Bar - Desktop */}
    <div className={`hidden sm:flex flex-grow max-w-md items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full`}>
      <Search className="mr-2 text-gray-500 dark:text-gray-300" />
      <input
        type="text"
        value={searchQuery}
        placeholder="Search books..."
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="bg-transparent outline-none w-full text-sm dark:text-white text-black"
      />
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3 shrink-0">
      <button onClick={toggleProfile} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
        <User className="w-5 h-5" />
      </button>
      <button onClick={() => setDarkMode(!darkMode)} className="hidden sm:inline p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <button onClick={toggleMenu} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  </div>

  {/* Search Bar - Mobile */}
  <div className="sm:hidden px-4 pb-3">
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-500" />
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="w-full pl-10 pr-4 py-3 rounded-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
      />
    </div>
  </div>
</header>


      {menuOpen && (
        <div className="fixed top-0 right-0 z-40 h-full bg-white dark:bg-gray-900 shadow-xl w-80">
          <DropdownSidebar
            darkMode={darkMode}
            filters={filters}
            filterOptions={filterOptions}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {connectionError && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Connection Error:</strong> {connectionError}
            <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
          </div>
        )}

        {loading ? (
  <div className="text-center py-20">Loading...</div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2 sm:p-4">
    {books.length > 0 ? (
      books.map(book => (
        <BookCard key={book._id} book={book} currentPage={currentPage} />
      ))
    ) : (
      <div className="col-span-full text-center py-20">No books found</div>
    )}
  </div>
)}


        {books.length > 0 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <button onClick={() => setPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="bg-gray-200 dark:bg-gray-700 p-2 rounded">
              <ChevronLeft />
            </button>
            <span className="px-4 py-2 bg-green-200 dark:bg-green-700 text-black dark:text-white rounded">
              {currentPage}
            </span>
            <button onClick={() => setPage(currentPage + 1)} className="bg-gray-200 dark:bg-gray-700 p-2 rounded">
              <ChevronRight />
            </button>
          </div>
        )}
      </main>

      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-md h-full bg-white dark:bg-gray-900 p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Profile</h2>
              <button onClick={toggleProfile} className="text-xl text-black dark:text-white">
                <X />
              </button>
            </div>
            <Profile />
          </div>
        </div>
      )}
      <Feedback />
      <Footer />
    </div>
  );
};

export default Home;
