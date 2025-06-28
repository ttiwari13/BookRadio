import { Link, useSearchParams } from "react-router-dom";

const BookCard = ({ book }) => {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get('page') || '1';
  
  return (
    <Link 
      to={`/books/${book._id}?returnPage=${currentPage}`} 
      className="cursor-pointer"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        
        {/* Book Cover */}
        <img
          src={book.image || "/fallback-book.jpg"}
          alt={book.title}
          className="h-60 w-full object-cover"
        />
        
        {/* Book Info */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {book.title}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {book.author || "Unknown Author"}
          </p>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex justify-between">
            <span>{book.duration || "Unknown"}</span>
            <span>{book.language || "N/A"}</span>
          </div>
          
          {/* Tags */}
          {book.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;