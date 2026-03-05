import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import BookCard from "./BookCard";
import { BookCardSkeleton } from "./BookCard";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

const Favorites = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await API.get("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(res.data);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  return (
    <Layout>
      <main className="container mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>
           My Favorites
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2 sm:p-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
          ) : books.length > 0 ? (
            books.map((book) => <BookCard key={book._id} book={book} />)
          ) : (
            <div className={`col-span-full text-center py-20 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <p className="text-lg">No favorites yet. Start adding books you love!</p>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Favorites;