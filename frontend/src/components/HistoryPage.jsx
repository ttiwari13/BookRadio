import { useHistory } from "../context/HistoryContext";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";

const HistoryPage = () => {
  const { history, clearHistory, loading } = useHistory();
  const { darkMode } = useTheme();

  return (
    <Layout>
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
            Listening History
          </h1>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-400 hover:text-red-500 transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {history.map((item) => (
              item.book && (
                <Link
                  key={item.book._id}
                  to={`/books/${item.book._id}`}
                  className="group"
                >
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={item.book.image || item.book.coverImage || "/fallback-book.jpg"}
                      alt={item.book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.target.src = "/fallback-book.jpg"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">{item.book.title}</p>
                      <p className="text-gray-300 text-[10px] mt-1">
                        {new Date(item.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <p className="text-lg">No listening history yet.</p>
            <p className="text-sm mt-2">Start listening to a book to see it here!</p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default HistoryPage;