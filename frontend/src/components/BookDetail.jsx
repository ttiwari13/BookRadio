// src/pages/BookDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, PlayCircle, Clock, Globe, Calendar, User, Headphones, Play, Pause } from "lucide-react";

const BookDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  
  // Get return page from URL params
  const returnPage = searchParams.get('returnPage') || '1';

  useEffect(() => {
    const root = document.documentElement;
    try {
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Theme not available:', error);
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        console.error("❌ Error fetching book details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleBack = () => {
    if (returnPage !== '1') {
      navigate(`/?page=${returnPage}`);
    } else {
      navigate('/');
    }
  };

  const togglePlay = (episodeIndex) => {
    setCurrentlyPlaying(currentlyPlaying === episodeIndex ? null : episodeIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D2ECC1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400 text-lg">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">📚</div>
          <div className="text-red-500 dark:text-red-400 text-xl">Book not found</div>
          <button onClick={handleBack} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 p-4">
        <button 
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#D2ECC1] dark:hover:text-[#D2ECC1] transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Books</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Book Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 transform hover:shadow-2xl transition-all duration-300">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 p-8 bg-gradient-to-br from-[#D2ECC1]/20 to-[#D2ECC1]/5 flex justify-center items-center">
              <img 
                src={book.image || "/fallback-book.jpg"} 
                alt={book.title} 
                className="h-80 w-60 object-cover rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
            
            {/* Book Info */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {book.title}
              </h1>
              
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-[#D2ECC1]" />
                <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                  {book.author || "Unknown Author"}
                </p>
              </div>

              {/* Book Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.duration || "Unknown"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <Globe className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Language</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.language || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.year || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {book.tags?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#D2ECC1]/20 text-[#D2ECC1] text-sm font-medium rounded-full border border-[#D2ECC1]/30 hover:bg-[#D2ECC1]/30 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        {book.description && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-[#D2ECC1] rounded-full mr-3"></span>
              About this Book
            </h2>
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: book.description }}
            />
          </div>
        )}

        {/* Episodes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Headphones className="w-7 h-7 text-[#D2ECC1] mr-3" />
            Episodes ({book.episodes?.length || 0})
          </h2>
          
          {book.episodes?.length > 0 ? (
            <div className="space-y-4">
              {book.episodes.map((ep, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => togglePlay(i)}
                        className="w-12 h-12 bg-[#D2ECC1] hover:bg-[#D2ECC1]/80 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                      >
                        {currentlyPlaying === i ? (
                          <Pause className="w-5 h-5 text-gray-800" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-800 ml-0.5" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                          Episode {i + 1}: {ep.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap ml-4">
                          {ep.duration}
                        </span>
                      </div>
                      
                      {ep.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {ep.description}
                        </p>
                      )}
                      
                      {ep.audioUrl ? (
                        <audio 
                          controls 
                          className="w-full mt-3 rounded-lg" 
                          src={ep.audioUrl}
                          style={{
                            filter: darkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none'
                          }}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-3 text-red-500 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">Audio not available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Headphones className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No episodes available for this book</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Check back later for updates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;