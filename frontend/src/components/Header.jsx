// Header.js - Updated Header Component with Conditional Search
import { Link } from "react-router-dom";
import { Search, User, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/useAuth";

const Header = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  toggleProfile,
  toggleMenu,
  menuOpen,
  showSearch = false
}) => {
  const { darkMode, toggleTheme } = useTheme();
  const { isLoggedIn } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b shadow">
      <div className="container mx-auto flex justify-between items-center px-4 py-3 gap-4">
        <Link to="/" className="shrink-0">
          <img src="/logobr.png" alt="logo" className="h-10" />
        </Link>

        {/* Desktop Search - Only show if showSearch is true */}
        {showSearch && (
          <div className="hidden sm:flex flex-grow max-w-md items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
            <Search className="mr-2 text-gray-500 dark:text-gray-300" />
            <input
              type="text"
              value={searchQuery || ''}
              placeholder="Search books..."
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch && handleSearch()}
              className="bg-transparent outline-none w-full text-sm dark:text-white text-black"
            />
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Profile Button - Show different states based on login */}
          <button 
            onClick={toggleProfile}
            className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full ${
              !isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={!isLoggedIn ? 'Login to access profile' : 'Open profile'}
          >
            <User className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="hidden sm:inline p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search - Only show if showSearch is true */}
      {showSearch && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch && handleSearch()}
              className="w-full pl-10 pr-4 py-3 rounded-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;