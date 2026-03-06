import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext";

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

export const BookCardSkeleton = () => (
  <div className="group h-full block">
    <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 text-white rounded-2xl shadow-lg overflow-hidden border border-slate-700">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-2xl bg-slate-700 animate-pulse">
        <div className="absolute top-2 right-2 w-14 h-5 bg-slate-600 rounded-full" />
      </div>
      <div className="relative flex flex-col justify-between flex-1 p-3 sm:p-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-700 rounded-full animate-pulse w-full" />
            <div className="h-4 bg-slate-700 rounded-full animate-pulse w-3/4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-700 rounded-full animate-pulse shrink-0" />
            <div className="h-3 bg-slate-700 rounded-full animate-pulse w-2/3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-700 rounded-full animate-pulse shrink-0" />
            <div className="h-3 bg-slate-700 rounded-full animate-pulse w-1/2" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="h-6 w-16 bg-slate-700 rounded-full animate-pulse" />
            <div className="h-6 w-10 bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          <div className="h-6 w-14 bg-slate-700 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-slate-700 rounded-full animate-pulse" />
          <div className="h-6 w-12 bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const BookCard = ({ book }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentPage = searchParams.get("page") || "1";

  const getCurrentRoute = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/home') return 'home';
    if (location.pathname === '/explore') return 'explore';
    return location.pathname.slice(1) || 'explore';
  };

  const currentRoute = getCurrentRoute();

  return (
    <>
      <style>{`
        @keyframes tagBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }
      `}</style>

      <Link
        to={`/books/${book._id}?returnPage=${currentPage}&from=${currentRoute}`}
        className="group h-full block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03] overflow-hidden border border-slate-700"
          style={{ ['--tw-border-opacity']: 1 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(210,236,193,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgb(51 65 85)'}
        >


          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(210,236,193,0.07), rgba(210,236,193,0.03))' }} />
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-2xl">
            <img
              src={book.image || book.coverImage || "/fallback-book.jpg"}
              alt={book.title || "Book Cover"}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              onError={(e) => { e.target.src = "/fallback-book.jpg"; }}
            />

            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="backdrop-blur-sm rounded-full p-4 border shadow-2xl"
                style={{ background: 'rgba(210,236,193,0.2)', borderColor: 'rgba(210,236,193,0.4)' }}>
                <div className="w-6 h-6 border-l-8 border-t-4 border-b-4 border-t-transparent border-b-transparent ml-1"
                  style={{ borderLeftColor: '#D2ECC1' }} />
              </div>
            </div>

            {book.language && (
              <div className="absolute top-2 right-2 transform transition-all duration-300 group-hover:scale-110">
                <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm border"
                  style={{ background: 'rgba(210,236,193,0.15)', borderColor: 'rgba(210,236,193,0.3)', color: '#D2ECC1' }}>
                  {book.language}
                </span>
              </div>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(book._id);
              }}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 z-10"
            >
              {isFavorite(book._id) ? (
                <span className="text-base">❤️</span>
              ) : (
                <span className="text-base">🤍</span>
              )}
            </button>


            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
          </div>

          <div className="relative flex flex-col justify-between flex-1 p-3 sm:p-4 z-10">
            <div className="space-y-3">

              <h2 className="text-base sm:text-lg font-semibold line-clamp-2 transition-all duration-500 transform group-hover:translate-y-[-2px]"
                style={{ color: isHovered ? 'transparent' : 'white',
                  backgroundImage: isHovered ? 'linear-gradient(to right, #D2ECC1, #a8d48a)' : 'none',
                  WebkitBackgroundClip: isHovered ? 'text' : 'unset',
                  backgroundClip: isHovered ? 'text' : 'unset',
                }}>
                {book.title || "Untitled Book"}
              </h2>

              <div className="flex items-center text-xs sm:text-sm text-gray-300 transition-all duration-300 group-hover:text-gray-200 transform group-hover:translate-x-1">
                <span>by {book.author || "Unknown Author"}</span>
              </div>

              <div className="flex items-center text-xs sm:text-sm text-gray-400 transition-all duration-300 group-hover:text-gray-300 transform group-hover:translate-x-1">
               
                <span>{formatDuration(book.duration)}</span>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
                {book.genre && (
                  <div className="flex items-center" style={{ color: '#D2ECC1' }}>
                    
                    <span className="px-2 py-1 rounded-full border"
                      style={{ background: 'rgba(210,236,193,0.1)', borderColor: 'rgba(210,236,193,0.25)' }}>
                      {book.genre}
                    </span>
                  </div>
                )}
                {book.rating && (
                  <div className="flex items-center text-yellow-400">
                    <span className="mr-1 text-base">⭐</span>
                    <span className="bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                      {book.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(book.tags?.length > 0 || book.categories?.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-4 text-[10px] sm:text-xs">
                {(book.tags || book.categories || []).slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full shadow-md transition-all duration-300 group-hover:scale-105 whitespace-nowrap"
                    style={{
                      background: isHovered ? 'rgba(210,236,193,0.12)' : 'linear-gradient(to right, #334155, #1e293b)',
                      border: isHovered ? '1px solid rgba(210,236,193,0.3)' : '1px solid #475569',
                      color: isHovered ? '#D2ECC1' : '#d1d5db',
                      animation: isHovered ? `tagBounce 0.6s ease-in-out ${i * 100}ms` : 'none',
                    }}
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

          <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(to right, #D2ECC1, #a8d48a, #D2ECC1)' }} />
        </div>
      </Link>
    </>
  );
};

export default BookCard;