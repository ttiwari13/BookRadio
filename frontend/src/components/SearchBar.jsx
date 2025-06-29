import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);

  // Update local state when initialQuery changes (from URL params)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = query.trim();
    
    // Call the parent component's search function
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center bg-[#D2ECC1] px-4 py-2 rounded-full shadow-sm w-full max-w-md"
    >
      <Search className="text-gray-600 mr-2" />
      <input
        type="text"
        placeholder="Search books by title or author..."
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="bg-transparent outline-none w-full text-gray-800 placeholder-gray-500"
      />
      <button
        type="submit"
        className="ml-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Search size={18} />
      </button>
    </form>
  );
};

export default SearchBar;