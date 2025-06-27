// components/BookCard.jsx
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition duration-300">
      <Link to={`/book/${book._id}`}>
        <img
          src={book.coverUrl || '/placeholder.jpg'}
          alt={book.title}
          className="h-48 w-full object-cover rounded"
        />
        <h2 className="text-lg font-semibold mt-2">{book.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{book.author}</p>
        <p className="text-sm text-gray-500">{book.totalDuration || 'Unknown'} hours</p>
        <p className="text-sm text-gray-500">{book.language || 'Language Unknown'}</p>
      </Link>
    </div>
  );
};

export default BookCard;
