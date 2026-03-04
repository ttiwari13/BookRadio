// Layout.js - Updated Layout Component with Profile Support
import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/useAuth";
import Header from "./Header";
import Footer from "./Footer";
import Feedback from "./FloatingFeedbackButton";
import Profile from "./Profile";
import DropdownSidebar from "./DropdownSidebar";

const Layout = ({
  children,
  searchQuery,
  setSearchQuery,
  handleSearch,
  showSearch = false,
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters
}) => {
  const { darkMode } = useTheme();
  const { isLoggedIn } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleProfile = () => {
    if (isLoggedIn) {
      setShowProfile(prev => !prev);
    }
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black'}`}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        toggleProfile={toggleProfile}
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
        showSearch={showSearch}
      />

      {/* Menu Sidebar */}
      {menuOpen && (
        <div className="fixed top-0 right-0 z-40 h-full bg-white dark:bg-gray-900 shadow-xl w-80">
          <DropdownSidebar
            darkMode={darkMode}
            filters={filters || { language: '', genre: '', duration: '', author: '' }}
            filterOptions={filterOptions || { languages: [], genres: [], authors: [] }}
            onFiltersChange={onFiltersChange || (() => {})}
            onClearFilters={onClearFilters || (() => {})}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-md h-full bg-white dark:bg-gray-900 p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Profile</h2>
              <button 
                onClick={() => setShowProfile(false)} 
                className="text-xl text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
              >
                <X />
              </button>
            </div>
            <Profile />
          </div>
        </div>
      )}

      {children}
      <Feedback />
      <Footer />
    </div>
  );
};

export default Layout;