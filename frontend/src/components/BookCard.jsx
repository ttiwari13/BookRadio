import { Link, useSearchParams } from "react-router-dom";

// ✅ Enhanced function to convert "HH:MM:SS" → "Xh Ym" or handle any duration format
const formatDuration = (duration) => {
  // Kuch bhi ho, bas string return kar
  if (!duration || duration === 0) {
    return "Duration not available";
  }
  
  // Agar number hai to minutes assume kar
  if (typeof duration === "number") {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }
  
  // Agar string hai aur "HH:MM:SS" format mein hai
  if (typeof duration === "string") {
    // Check if it's in HH:MM:SS or MM:SS format
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = duration.match(timeRegex);
    
    if (match) {
      const [, hours, minutes, seconds] = match;
      const h = parseInt(hours);
      const m = parseInt(minutes);
      
      if (h > 0) {
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      return `${m}m`;
    }
    
    // Agar already formatted string hai to waise hi return kar
    return duration;
  }
  
  return "Unknown duration";
};

// Updated BookCard component with all required fields
const BookCard = ({ book }) => {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get('page') || '1';
  
  return (
    <Link 
      to={`/books/${book._id}?returnPage=${currentPage}`}
      className="cursor-pointer group"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
        
        {/* Book Cover with Genre Badge */}
        <div className="relative h-60 w-full overflow-hidden">
          <img 
            src={book.image || book.coverImage || "/fallback-book.jpg"}
            alt={book.title || book.name || "Book Cover"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/fallback-book.jpg";
            }}
          />
          

          
          {/* Language Badge - Top Right */}
          {book.language && (
            <div className="absolute top-2 right-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                {book.language}
              </span>
            </div>
          )}
        </div>
        
        {/* Book Info Section */}
        <div className="p-4 space-y-3">
          
          {/* Book Title */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {book.title || book.name || "Untitled Book"}
          </h2>
          
          {/* Author Name */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>by {book.author || book.authorName || "Unknown Author"}</span>
          </div>
          
          {/* Duration */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{formatDuration(book.duration)}</span>
          </div>
          
          {/* Genre & Rating Info Row */}
          <div className="flex justify-between items-center text-sm">
            {/* Genre */}
            {(book.genre || book.category) && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="text-xs">{book.genre || book.category}</span>
              </div>
            )}
            
            {/* Rating (if available) */}
            {book.rating && (
              <div className="flex items-center text-yellow-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-medium">{book.rating}</span>
              </div>
            )}
          </div>
          
          {/* Tags/Categories */}
          {(book.tags?.length > 0 || book.categories?.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {(book.tags || book.categories || []).slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {(book.tags?.length > 3 || book.categories?.length > 3) && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{(book.tags?.length || book.categories?.length) - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Additional Info (if available) */}
          {(book.publishedYear || book.pages || book.isbn) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
              {book.publishedYear && <span>Published: {book.publishedYear}</span>}
              {book.pages && <span className="ml-3">Pages: {book.pages}</span>}
            </div>
          )}
          
        </div>
      </div>
    </Link>
  );
};

export default BookCard;