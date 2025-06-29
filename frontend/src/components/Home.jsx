import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Search, User, Sun, Moon, Menu, X, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import DropdownSidebar from "../components/DropdownSidebar";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import BookCard from './BookCard';
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [modalType, setModalType] = useState("login");
  const [connectionError, setConnectionError] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckRef = useRef(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    language: '',
    genre: '',
    duration: '',
    author: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    languages: [],
    genres: [],
    durations: ['0-5 hours', '5-10 hours', '10-20 hours', '20+ hours'],
    authors: []
  });
  
  // Get page from URL params, default to 1
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      language: searchParams.get('language') || '',
      genre: searchParams.get('genre') || '',
      duration: searchParams.get('duration') || '',
      author: searchParams.get('author') || ''
    };
    setFilters(urlFilters);
  }, [searchParams]);
  
  const toggleMenu = () => setMenuOpen(prev => !prev);

  // Function to update page in URL
  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) {
      params.delete('page'); // Remove page param for page 1 (cleaner URL)
    } else {
      params.set('page', newPage.toString());
    }
    setSearchParams(params);
  };

  // Function to update filters in URL
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    
    // Remove page when filters change
    params.delete('page');
    
    // Update filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  // Function to clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      language: '',
      genre: '',
      duration: '',
      author: ''
    };
    updateFilters(clearedFilters);
  };

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

  // Optimized auth check - runs only once
  useEffect(() => {
    if (authCheckRef.current) return; // Prevent multiple auth checks
    authCheckRef.current = true;

    const checkLogin = async () => {
      try {
        setConnectionError(null);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setIsLoggedIn(false);
          setAuthChecked(true);
          return;
        }

        // If token exists, assume user is logged in for better UX
        // Don't validate JWT locally as it might cause issues
        setIsLoggedIn(true);
        setAuthChecked(true);

        // Verify with server in background (optional)
        try {
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000 // 8 second timeout
          });
          
          // Only logout if server explicitly says token is invalid
          if (!res.data) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
        } catch (error) {
          // Don't logout on network errors, only on 401/403 responses
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
          console.warn("Background auth check failed:", error.message);
        }
      } catch (error) {
        console.warn("Auth check failed:", error.message);
        // Only set to false if there's no token at all
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
      } finally {
        setAuthChecked(true);
      }
    };

    checkLogin();
  }, [setIsLoggedIn]);

  // FIXED: Fetch books with proper filter handling
  useEffect(() => {
    const fetchBooks = async () => {
      // Show loading only on initial load
      if (initialLoad) {
        setLoading(true);
      }
      
      try {
        // Build query string with filters
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12'
        });
        
        // Check if any filters are active
        const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');
        
        // Only add filters to query if they have actual values
        if (hasActiveFilters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
              queryParams.set(key, value);
            }
          });
        }
        
        const res = await axios.get(`http://localhost:5000/api/books?${queryParams.toString()}`, {
          timeout: 10000 // 10 second timeout
        });
        
        if (Array.isArray(res.data)) {
          setBooks(res.data);
        } else if (res.data.books && Array.isArray(res.data.books)) {
          setBooks(res.data.books);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          setBooks(res.data.data);
        } else {
          console.warn('⚠️ Unexpected books response format:', res.data);
          setBooks([]);
        }
      } catch (error) {
        console.error("❌ Error fetching books:", error.message);
        setBooks([]);
        
        // Set connection error if it's a network issue
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          setConnectionError('Connection timeout. Please check your internet connection.');
        } else if (error.code === 'ERR_NETWORK') {
          setConnectionError('Network error. Please check if the server is running.');
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    // Fetch filter options for dropdowns
    const fetchFilterOptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books/filters', {
          timeout: 5000
        });
        
        if (res.data) {
          setFilterOptions(prev => ({
            ...prev,
            languages: res.data.languages || [],
            genres: res.data.genres || [],
            authors: res.data.authors || []
          }));
        }
      } catch (error) {
        console.warn("Failed to fetch filter options:", error.message);
        // Set default options if API fails
        setFilterOptions(prev => ({
          ...prev,
          languages: ['English', 'Hindi', 'Spanish', 'French', 'German'],
          genres: ['Fiction', 'Non-fiction', 'Romance', 'Thriller', 'Mystery', 'Sci-Fi', 'Biography'],
          authors: ['J.K. Rowling', 'Premchand', 'Dan Brown', 'Agatha Christie', 'Stephen King']
        }));
      }
    };
    
    // Only fetch if auth is checked
    if (authChecked) {
      fetchBooks();
      if (initialLoad) {
        fetchFilterOptions();
      }
    }
  }, [currentPage, authChecked, initialLoad, filters]); // Added filters dependency

  const closeModal = () => {
    setIsLoggedIn(true);
    setConnectionError(null);
    // Mark auth as checked to prevent re-checking
    setAuthChecked(true);
    authCheckRef.current = true;
  };

  const switchToSignup = () => setModalType("signup");
  const switchToLogin = () => setModalType("login");

  // Show loading only during initial auth check
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#D2ECC1] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D2ECC1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      {!isLoggedIn && (
        <>
          <div className="fixed inset-0 z-30 backdrop-blur-sm bg-black/30 animate-fadeIn"></div>
          {modalType === "login" && <LoginModal onClose={closeModal} onSwitchToSignup={switchToSignup} />}
          {modalType === "signup" && <SignupModal onClose={closeModal} onSwitchToLogin={switchToLogin} />}
        </>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-md ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} border-b border-gray-200 dark:border-gray-700 transition-all duration-300`}>
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="mr-4 group">
            <img 
              src="/logobr.png" 
              alt="logo" 
              className="h-10 ml-2 sm:ml-6 cursor-pointer group-hover:scale-105 transition-transform duration-200" 
            />
          </Link>
          
          <div className="hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 w-full max-w-md mx-6 bg-[#D2ECC1] dark:bg-[#D2ECC1]/90 transition-all duration-300 hover:shadow-md">
            <Search className="w-5 h-5 text-gray-700 mr-2" />
            <input 
              type="text" 
              placeholder="Search books..." 
              className="bg-transparent outline-none text-gray-700 w-full placeholder-gray-600" 
            />
          </div>
          
          <div className="flex items-center space-x-4 mr-4">
            <User className="w-7 h-7 text-[#D2ECC1] cursor-pointer hover:scale-110 transition-transform duration-200" />
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="hidden sm:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {darkMode ? 
                <Sun className="w-6 h-6 text-yellow-400" /> : 
                <Moon className="w-6 h-6 text-gray-600" />
              }
            </button>
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {menuOpen ? 
                <X className="w-6 h-6 text-gray-700 dark:text-[#D2ECC1]" /> : 
                <Menu className="w-6 h-6 text-gray-700 dark:text-[#D2ECC1]" />
              }
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search books..." 
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-[#D2ECC1] transition-all duration-200" 
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-30 transform transition-transform duration-300 ease-in-out ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {menuOpen && (
          <DropdownSidebar 
            darkMode={darkMode} 
            filters={filters}
            filterOptions={filterOptions}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Connection Error */}
        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Connection Error:</strong> {connectionError}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}



        {/* Books Grid */}
        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#D2ECC1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-500 text-lg">Loading amazing books...</div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {books.length > 0 ? (
                books.map((book, index) => (
                  <div
                    key={book._id}
                    className="opacity-0 animate-slideUp"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <BookCard book={book} currentPage={currentPage} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 animate-fadeIn">
                  <div className="text-8xl mb-6 opacity-50">📚</div>
                  <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {Object.values(filters).some(f => f) ? 'No books match your filters' : 'No books found'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {Object.values(filters).some(f => f) 
                      ? 'Try adjusting your filters or search terms' 
                      : 'Check back later or contact support if this persists'
                    }
                  </p>
                  {Object.values(filters).some(f => f) && (
                    <button 
                      onClick={clearFilters}
                      className="px-6 py-2 bg-[#D2ECC1] text-gray-800 rounded-lg hover:bg-[#C1E5B0] transition-colors duration-200"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {books.length > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-12 mb-8">
            <button 
              onClick={() => setPage(Math.max(currentPage - 1, 1))} 
              className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm" 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="font-semibold px-6 py-3 bg-[#D2ECC1] text-gray-800 rounded-lg shadow-sm">
              {currentPage}
            </span>
            <button 
              onClick={() => setPage(currentPage + 1)} 
              className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}
      </main>

      {/* Custom Animations */}
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
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-slideUp {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;