import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useState } from "react";

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
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const currentPage = searchParams.get("page") || "1";
  
  // Determine current route to pass as 'from' parameter
  const getCurrentRoute = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/home') return 'home';
    if (location.pathname === '/explore') return 'explore';
    // Remove leading slash and use pathname
    return location.pathname.slice(1) || 'explore';
  };

  const currentRoute = getCurrentRoute();

  return (
    <Link 
      to={`/books/${book._id}?returnPage=${currentPage}&from=${currentRoute}`} 
      className="group h-full block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03] overflow-hidden border border-slate-700 hover:border-slate-600">
        
        {/* Animated background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 blur-sm" />

        {/* Cover */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[3/4] overflow-hidden rounded-t-2xl">
          <img
            src={book.image || book.coverImage || "/fallback-book.jpg"}
            alt={book.title || "Book Cover"}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            onError={(e) => {
              e.target.src = "/fallback-book.jpg";
            }}
          />
          
          {/* Animated overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Floating play button on hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 shadow-2xl animate-pulse">
              <div className="w-6 h-6 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1" />
            </div>
          </div>

          {book.language && (
            <div className="absolute top-2 right-2 transform transition-all duration-300 group-hover:scale-110">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm border border-white/20">
                {book.language}
              </span>
            </div>
          )}
          
          {/* Animated shimmer effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-between flex-1 p-3 sm:p-4 z-10">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-500 transform group-hover:translate-y-[-2px]">
              {book.title || "Untitled Book"}
            </h2>

            <div className="flex items-center text-xs sm:text-sm text-gray-300 transition-all duration-300 group-hover:text-gray-200 transform group-hover:translate-x-1">
              <span className="mr-2 text-base transition-transform duration-300 group-hover:scale-110">👤</span>
              <span>by {book.author || "Unknown Author"}</span>
            </div>

            <div className="flex items-center text-xs sm:text-sm text-gray-400 transition-all duration-300 group-hover:text-gray-300 transform group-hover:translate-x-1">
              <span className="mr-2 text-base transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">⏱️</span>
              <span>{formatDuration(book.duration)}</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
              {book.genre && (
                <div className="flex items-center text-blue-300 transition-all duration-300 group-hover:text-blue-200 transform group-hover:translate-x-1">
                  <span className="mr-2 text-base transition-transform duration-300 group-hover:scale-110">📚</span>
                  <span className="bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30 transition-all duration-300 group-hover:bg-blue-500/30 group-hover:border-blue-400/50">
                    {book.genre}
                  </span>
                </div>
              )}
              {book.rating && (
                <div className="flex items-center text-yellow-400 transition-all duration-300 group-hover:text-yellow-300">
                  <span className="mr-1 text-base transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">⭐</span>
                  <span className="bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30 transition-all duration-300 group-hover:bg-yellow-500/30 group-hover:border-yellow-400/50">
                    {book.rating}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Tags */}
          {(book.tags?.length > 0 || book.categories?.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-4 text-[10px] sm:text-xs">
              {(book.tags || book.categories || []).slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 text-gray-200 px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-purple-600/30 group-hover:to-blue-600/30 border border-slate-600 group-hover:border-purple-500/50 whitespace-nowrap transform group-hover:translate-y-[-1px]"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animation: isHovered ? 'bounce 0.6s ease-in-out' : 'none'
                  }}
                >
                  <span className="relative">
                    #{tag}
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </span>
                </span>
              ))}
              {(book.tags?.length > 3 || book.categories?.length > 3) && (
                <span className="text-gray-400 px-2 py-1 transition-all duration-300 group-hover:text-gray-300 group-hover:scale-105">
                  +{(book.tags?.length || book.categories?.length) - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom gradient glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </Link>
  );
};

export default BookCard;