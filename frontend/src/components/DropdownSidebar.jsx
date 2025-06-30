import React, { useEffect, useState } from "react";
import { X } from 'lucide-react';
import axios from "axios";

const DropdownSidebar = ({ 
  darkMode, 
  filters, 
  filterOptions: initialOptions, 
  onFiltersChange, 
  onClearFilters,
  onClose 
}) => {
  const [filterOptions, setFilterOptions] = useState(initialOptions || {
    languages: [],
    genres: [],
    authors: [],
    durations: []
  });

  useEffect(() => {
    if (!initialOptions) {
      axios.get('/api/books/filters')
        .then(res => setFilterOptions(res.data))
        .catch(err => console.error("Error fetching filter options:", err));
    }
  }, [initialOptions]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value === 'all' ? '' : value
    };
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  const languages = filterOptions?.languages || [];
  const genres = filterOptions?.genres || [];
  const authors = filterOptions?.authors || [];

  return (
    <div
      className={`absolute right-4 mt-2 w-full sm:w-72 px-6 py-6 z-50 transition-all rounded-2xl shadow-xl
        ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">🎯 Filters</h2>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:scale-110 transition-transform
              ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dropdowns */}
      {[
        { key: 'language', label: '📚 Language', options: languages },
        { key: 'genre', label: '🎭 Genre', options: genres },
        { key: 'author', label: '✍️ Author', options: authors },
      ].map(({ key, label, options }) => (
        <div key={key} className="mb-4">
          <label className="block mb-2 font-medium text-sm">{label}</label>
          <select
            value={filters[key] || ''}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#D2ECC1] outline-none
              ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          >
            <option value="">All {key.charAt(0).toUpperCase() + key.slice(1)}s</option>
            {options.length > 0 ? (
              options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))
            ) : (
              <option disabled>No {key}s found</option>
            )}
          </select>
        </div>
      ))}

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
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Info */}
      {hasActiveFilters && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          🔍 Filters applied - showing filtered results
        </div>
      )}
    </div>
  );
};

export default DropdownSidebar;
