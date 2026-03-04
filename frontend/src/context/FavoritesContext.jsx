import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]); // array of book IDs
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Store just the IDs for quick lookup
      setFavorites(res.data.map((book) => book._id));
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await API.post(`/api/favorites/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => [...prev, bookId]);
    } catch (err) {
      console.error("Failed to add favorite:", err);
    }
  };

  const removeFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await API.delete(`/api/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((id) => id !== bookId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const isFavorite = (bookId) => favorites.includes(bookId);

  const toggleFavorite = (bookId) => {
    if (isFavorite(bookId)) {
      removeFavorite(bookId);
    } else {
      addFavorite(bookId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, toggleFavorite, isFavorite, fetchFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);