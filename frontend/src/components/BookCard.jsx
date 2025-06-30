import { Link, useSearchParams } from "react-router-dom";

const formatDuration = (duration) => {
  if (!duration || duration === 0) return "Duration not available";
  if (typeof duration === "number") {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  if (typeof duration === "string") {
    const match = duration.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match) {
      const [, h, m] = match;
      return parseInt(h) > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return duration;
  }
  return "Unknown duration";
};

const BookCard = ({ book }) => {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  return (
    <Link to={`/books/${book._id}?returnPage=${currentPage}`} className="group h-full">
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] overflow-hidden border border-slate-700">

        {/* Cover */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[3/4] overflow-hidden">
          <img
            src={book.image || book.coverImage || "/fallback-book.jpg"}
            alt={book.title || "Book Cover"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/fallback-book.jpg";
            }}
          />
          {book.language && (
            <div className="absolute top-2 right-2">
              <span className="bg-indigo-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium shadow">
                {book.language}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 p-3 sm:p-4">
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-teal-400 transition-colors">
              {book.title || "Untitled Book"}
            </h2>

            <div className="flex items-center text-xs sm:text-sm text-gray-300">
              <span className="mr-1">👤</span>
              <span>by {book.author || "Unknown Author"}</span>
            </div>

            <div className="flex items-center text-xs sm:text-sm text-gray-400">
              <span className="mr-1">⏱️</span>
              <span>{formatDuration(book.duration)}</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
              {book.genre && (
                <div className="flex items-center text-blue-300">
                  <span className="mr-1">📚</span>
                  <span>{book.genre}</span>
                </div>
              )}
              {book.rating && (
                <div className="flex items-center text-yellow-400">
                  <span className="mr-1">⭐</span>
                  <span>{book.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {(book.tags?.length > 0 || book.categories?.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-4 text-[10px] sm:text-xs">
              {(book.tags || book.categories || []).slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="bg-slate-700 text-gray-200 px-2 py-1 rounded-full shadow whitespace-nowrap"
                >
                  #{tag}
                </span>
              ))}
              {(book.tags?.length > 3 || book.categories?.length > 3) && (
                <span className="text-gray-400 px-2 py-1">
                  +{(book.tags?.length || book.categories?.length) - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
