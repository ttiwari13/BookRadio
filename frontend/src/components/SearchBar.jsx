import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 Load existing search query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const existingQuery = params.get("q") || "";
    setQuery(existingQuery);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    params.delete("page"); // Reset pagination on search
    navigate(`/?${params.toString()}`);
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
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent outline-none w-full text-gray-800"
      />
    </form>
  );
};

export default SearchBar;
