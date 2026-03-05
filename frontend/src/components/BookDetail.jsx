import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Clock, Globe, Tag, Play, BookOpen,
  Star, SkipForward, SkipBack, Pause, Heart, Share2, Download, Volume2
} from 'lucide-react';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useHistory } from '../context/HistoryContext';
import Layout from './Layout';

const BookDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();

  const returnPage = searchParams.get('returnPage') || '1';

  const [book, setBook] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState('');
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(50);

  const audioRef = useRef();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/books/${id}`);
        setBook(res.data);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get(`/api/books/${id}/episodes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEpisodes(res.data || []);
      } catch (err) {
        console.error('Error loading episodes', err);
        setEpisodes([]);
      }
    };
    if (id) fetchEpisodes();
  }, [id]);

  const formatDuration = (duration) => {
    if (!duration) return "Unknown";
    if (typeof duration === "number") {
      const mins = Math.floor(duration);
      const secs = Math.round((duration - mins) * 60);
      return `${mins}m ${secs}s`;
    }
    return duration;
  };

  const handlePlayEpisode = (ep) => {
    setCurrentEpisodeId(ep._id);
    setCurrentAudioUrl(ep.audioUrl);
    setCurrentEpisodeTitle(ep.title || `Episode ${ep.episodeNumber}`);
    setIsPlaying(true);
    setAudioProgress(0);
    setTimeout(() => { audioRef.current?.play(); }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const jump = (secs) => {
    if (audioRef.current) audioRef.current.currentTime += secs;
  };

  const onTimeUpdate = () => {
    if (audioRef.current?.duration) {
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  if (loading) {
    return (
      <Layout showSearch={false}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-2xl font-semibold text-white animate-pulse">Loading your book...</div>
            <div className="flex space-x-1 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: `${i * 0.2}s`}}></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">

        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative container mx-auto px-4 py-6 z-10">
          <div className="grid lg:grid-cols-5 gap-8 mb-12">

            {/* Book Cover */}
            <div className="lg:col-span-2 group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-105">
                <img
                  src={book.cover || book.image || book.coverImage}
                  alt={book.title}
                  className="w-full h-auto transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <button
                    onClick={() => toggleFavorite(id)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                      isFavorite(id) ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-red-500/60'
                    }`}
                  >
                    <Heart size={18} className={isFavorite(id) ? 'fill-current' : ''} />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-blue-500/60 transition-all duration-300 transform hover:scale-110">
                    <Share2 size={18} />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-green-500/60 transition-all duration-300 transform hover:scale-110">
                    <Download size={18} />
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out"></div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {book.title}
                </h1>
                <p className="text-2xl text-gray-300">
                  by <span className="text-purple-400 font-semibold">{book.author}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Globe, label: book.language, color: 'text-blue-400' },
                  { icon: Tag, label: book.genre, color: 'text-purple-400' },
                  { icon: Clock, label: formatDuration(book.duration), color: 'text-teal-400' },
                  { icon: BookOpen, label: `${episodes.length} Episodes`, color: 'text-orange-400' }
                ].map(({ icon: Icon, label, color }, index) => (
                  <div key={index} className="group p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600 hover:border-purple-400 transition-all duration-500 transform hover:scale-105">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />
                      <span className="text-gray-200 font-medium">{label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (episodes[0]) {
                      handlePlayEpisode(episodes[0]);
                      addToHistory(id);
                    }
                  }}
                  className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
                >
                  <Play size={24} />
                  Start Listening
                </button>

                <button
                  onClick={() => toggleFavorite(id)}
                  className={`px-8 py-4 border-2 transition-all duration-500 transform hover:scale-105 hover:shadow-xl font-semibold rounded-xl text-white ${
                    isFavorite(id)
                      ? 'border-red-400 bg-red-500/20 hover:bg-red-500/30'
                      : 'border-slate-600 hover:border-purple-400 hover:bg-slate-800/50'
                  }`}
                >
                  {isFavorite(id) ? '❤️ Saved' : 'Add to Library'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-700 mb-8">
            <div className="flex gap-8">
              {['overview', 'episodes', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`group relative pb-4 font-semibold text-lg transition-all duration-500 ${
                    activeTab === tab ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ${
                    activeTab === tab ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          <div>
            {activeTab === 'overview' && (
              <div
                className="text-gray-300 leading-relaxed space-y-4 p-6 bg-gradient-to-br from-slate-800/30 to-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600"
                dangerouslySetInnerHTML={{ __html: book.description || '<p>No description available.</p>' }}
              />
            )}

            {activeTab === 'episodes' && (
              <div className="space-y-4">
                {episodes.map((ep, i) => (
                  <div
                    key={ep._id}
                    className="group p-6 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm text-white transition-all duration-500 hover:border-purple-400 hover:shadow-2xl transform hover:scale-[1.02]"
                  >
                    <div onClick={() => handlePlayEpisode(ep)} className="flex justify-between items-center cursor-pointer">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg group-hover:text-purple-300 transition-colors duration-300">
                          {ep.title || `Episode ${ep.episodeNumber || i + 1}`}
                        </h4>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock size={14} />
                          {formatDuration(ep.duration)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-600/20 hover:bg-purple-600/40 rounded-full transition-all duration-300 transform group-hover:scale-110">
                        <Play size={20} />
                      </div>
                    </div>

                    {currentEpisodeId === ep._id && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-purple-300 truncate font-medium">
                              Now Playing: {currentEpisodeTitle}
                            </p>
                          </div>
                          <div className="flex gap-3 items-center">
                            <button onClick={() => jump(-10)} className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110">
                              <SkipBack size={18} />
                            </button>
                            <button onClick={togglePlayPause} className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg">
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button onClick={() => jump(10)} className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110">
                              <SkipForward size={18} />
                            </button>
                            <div className="relative">
                              <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110">
                                <Volume2 size={18} />
                              </button>
                              {showVolumeSlider && (
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 rounded-lg border border-slate-600">
                                  <input
                                    type="range" min="0" max="100" value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-slate-600 rounded-lg appearance-none slider"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="relative w-full h-3 bg-slate-700 rounded-full cursor-pointer overflow-hidden" onClick={handleSeek}>
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full"></div>
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 relative overflow-hidden"
                            style={{ width: `${audioProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                          </div>
                          <div
                            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                            style={{ left: `calc(${audioProgress}% - 8px)` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-20">
                <div className="space-y-6">
                  <div className="relative">
                    <Star size={64} className="mx-auto text-yellow-500 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star size={48} className="text-yellow-400 animate-ping" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">No reviews yet</h3>
                    <p className="text-gray-400">Be the first to share your thoughts!</p>
                  </div>
                  <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl transition-all duration-500 transform hover:scale-105 font-semibold">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentAudioUrl}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
          .slider::-webkit-slider-thumb {
            appearance: none; width: 16px; height: 16px;
            background: linear-gradient(45deg, #8b5cf6, #3b82f6);
            border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .slider::-moz-range-thumb {
            width: 16px; height: 16px;
            background: linear-gradient(45deg, #8b5cf6, #3b82f6);
            border-radius: 50%; cursor: pointer; border: none;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BookDetail;