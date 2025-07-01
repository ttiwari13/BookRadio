import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Clock, Globe, Tag, Play, BookOpen,
  Star, SkipForward, SkipBack, Pause, Heart, Share2, Download, Volume2
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Layout from './Layout';

const BookDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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
  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(50);

  const audioRef = useRef();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
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
        const res = await axios.get(`http://localhost:5000/api/books/${id}/episodes`);
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

  const handleBackClick = () => {
    const from = searchParams.get('from') || 'explore';
    navigate(`/${from}?page=${returnPage}`);
  };

  const handlePlayEpisode = (ep) => {
    setCurrentEpisodeId(ep._id);
    setCurrentAudioUrl(ep.audioUrl);
    setCurrentEpisodeTitle(ep.title || `Episode ${ep.episodeNumber}`);
    setIsPlaying(true);
    setAudioProgress(0);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const jump = (secs) => {
    if (audioRef.current) {
      audioRef.current.currentTime += secs;
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current?.duration) {
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
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
                <div key={i} className={`w-2 h-2 bg-purple-500 rounded-full animate-bounce`} style={{animationDelay: `${i * 0.2}s`}}></div>
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
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative container mx-auto px-4 py-6 z-10">
          {/* Hero Section */}
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
                
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${isLiked ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-red-500/60'}`}
                  >
                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-blue-500/60 transition-all duration-300 transform hover:scale-110">
                    <Share2 size={18} />
                  </button>
                  <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-green-500/60 transition-all duration-300 transform hover:scale-110">
                    <Download size={18} />
                  </button>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out"></div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
                  {book.title}
                </h1>
                <p className="text-2xl text-gray-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
                  by <span className="text-purple-400 font-semibold">{book.author}</span>
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
                {[
                  { icon: Globe, label: book.language, color: 'text-blue-400' },
                  { icon: Tag, label: book.genre, color: 'text-purple-400' },
                  { icon: Clock, label: formatDuration(book.duration), color: 'text-teal-400' },
                  { icon: BookOpen, label: `${episodes.length} Episodes`, color: 'text-orange-400' }
                ].map(({ icon: Icon, label, color }, index) => (
                  <div 
                    key={index}
                    className="group p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600 hover:border-purple-400 transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />
                      <span className="text-gray-200 font-medium">{label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <button 
                  onClick={() => handlePlayEpisode(episodes[0])} 
                  className="group flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl font-semibold text-lg"
                >
                  <Play size={24} className="transition-transform duration-300 group-hover:scale-110" /> 
                  Start Reading
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500"></div>
                </button>
                <button className="px-8 py-4 border-2 border-slate-600 hover:border-purple-400 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:bg-slate-800/50 font-semibold">
                  Add to Library
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="border-b border-slate-700 mb-8">
            <div className="flex gap-8">
              {['overview', 'episodes', 'reviews'].map((tab, index) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`group relative pb-4 font-semibold text-lg transition-all duration-500 transform hover:scale-105 ${
                    activeTab === tab 
                      ? 'text-purple-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ${
                    activeTab === tab ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}></div>
                  {activeTab !== tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-50 scale-x-0 group-hover:scale-x-100 transition-all duration-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="prose prose-lg prose-invert max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed space-y-4 p-6 bg-gradient-to-br from-slate-800/30 to-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600"
                  dangerouslySetInnerHTML={{ __html: book.description || '<p>No description available.</p>' }}
                />
              </div>
            )}

            {activeTab === 'episodes' && (
              <div className="space-y-4">
                {episodes.map((ep, i) => (
                  <div 
                    key={ep._id} 
                    className="group p-6 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm text-white transition-all duration-500 hover:border-purple-400 hover:shadow-2xl transform hover:scale-[1.02]"
                    style={{animationDelay: `${i * 0.1}s`}}
                  >
                    <div 
                      onClick={() => handlePlayEpisode(ep)} 
                      className="flex justify-between items-center cursor-pointer"
                    >
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

                    {/* Enhanced Audio Player */}
                    {currentEpisodeId === ep._id && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-purple-300 truncate font-medium">
                              Now Playing: {currentEpisodeTitle}
                            </p>
                          </div>
                          <div className="flex gap-3 items-center">
                            <button 
                              onClick={() => jump(-10)}
                              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110"
                            >
                              <SkipBack size={18} />
                            </button>
                            <button 
                              onClick={togglePlayPause}
                              className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                            >
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button 
                              onClick={() => jump(10)}
                              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110"
                            >
                              <SkipForward size={18} />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110"
                              >
                                <Volume2 size={18} />
                              </button>
                              {showVolumeSlider && (
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 rounded-lg border border-slate-600 animate-fade-in">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-slate-600 rounded-lg appearance-none slider"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="relative w-full h-3 bg-slate-700 rounded-full cursor-pointer overflow-hidden" onClick={handleSeek}>
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full"></div>
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 relative overflow-hidden" 
                            style={{ width: `${audioProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                          </div>
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300" 
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
                <div className="space-y-6 animate-fade-in">
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
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: linear-gradient(45deg, #8b5cf6, #3b82f6);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: linear-gradient(45deg, #8b5cf6, #3b82f6);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BookDetail;