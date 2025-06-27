// components/BookDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Episode from "./Episode";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => setBook(res.data))
      .catch(err => console.error("Book fetch error:", err));
  }, [id]);

  if (!book) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <img src={book.coverUrl || "/placeholder.jpg"} alt={book.title} className="rounded-xl" />
      
      <div>
        <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
        <p className="text-gray-600">{book.author}</p>
        <p className="mt-4">{book.description}</p>

        <div className="flex gap-2 mt-4 flex-wrap">
          {book.genres?.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-200 rounded-full text-sm">{tag}</span>
          ))}
        </div>
      </div>

      <div className="col-span-full">
        <h2 className="text-xl font-semibold mt-6 mb-2">Episodes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {book.episodes?.map((ep, index) => (
            <Episode key={index} episode={ep} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
