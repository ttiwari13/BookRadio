import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res = await API.get("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await API.post(`/api/history/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHistory();
    } catch (err) {
      console.error("Failed to add to history:", err);
    }
  };

  const clearHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await API.delete("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, loading, addToHistory, clearHistory, fetchHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);