import React from "react";
import { X } from 'lucide-react';

const DropdownSidebar = ({ 
  darkMode, 
  filters, 
  filterOptions, 
  onFiltersChange, 
  onClearFilters,
  onClose 
}) => {
  
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value === 'all' ? '' : value
    };
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  // Safe access to filterOptions with fallbacks
  const languages = filterOptions?.languages || [];
  const genres = filterOptions?.genres || [];
  const authors = filterOptions?.authors || [];
  const durations = filterOptions?.durations || [];

  return (
    <div
      className={`absolute right-4 mt-2 w-full sm:w-72 px-6 py-6 z-50     
      ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}     
      transition-all rounded-xl shadow-2xl ml-4`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">🎯 Filters</h2>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full transition-colors duration-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors duration-200 hover:scale-110
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-600'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Language Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-sm">📚 Language</label>
        <select 
          value={filters.language || ''}
          onChange={(e) => handleFilterChange('language', e.target.value)}
          className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-[#D2ECC1] outline-none
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-black'
            }`}
        >
          <option value="">All Languages</option>
          {languages.length > 0 ? (
            languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))
          ) : (
            <option disabled>No languages found</option>
          )}
        </select>
      </div>

      {/* Genre Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-sm">🎭 Genre</label>
        <select 
          value={filters.genre || ''}
          onChange={(e) => handleFilterChange('genre', e.target.value)}
          className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-[#D2ECC1] outline-none
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-black'
            }`}
        >
          <option value="">All Genres</option>
          {genres.length > 0 ? (
            genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))
          ) : (
            <option disabled>No genres found</option>
          )}
        </select>
      </div>

      {/* Author Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-sm">✍️ Author</label>
        <select 
          value={filters.author || ''}
          onChange={(e) => handleFilterChange('author', e.target.value)}
          className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-[#D2ECC1] outline-none
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-black'
            }`}
        >
          <option value="">All Authors</option>
          {authors.length > 0 ? (
            authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))
          ) : (
            <option disabled>No authors found</option>
          )}
        </select>
      </div>

      {/* Duration Dropdown */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-sm">⏱️ Duration</label>
        <select 
          value={filters.duration || ''}
          onChange={(e) => handleFilterChange('duration', e.target.value)}
          className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-[#D2ECC1] outline-none
            ${darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-black'
            }`}
        >
          <option value="">All Durations</option>
          {durations.length > 0 ? (
            durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))
          ) : (
            <option disabled>No durations found</option>
          )}
        </select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t pt-4 border-gray-300 dark:border-gray-600">
          <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              const filterLabel = {
                language: '📚',
                genre: '🎭', 
                author: '✍️',
                duration: '⏱️'
              }[key] || '';
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#D2ECC1] text-gray-800"
                >
                  <span className="mr-1">{filterLabel}</span>
                  {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Results Count (optional) */}
      {hasActiveFilters && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          <span>🔍 Filters applied - showing filtered results</span>
        </div>
      )}
    </div>
  );
};

export default DropdownSidebar;
