import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Clock, Globe, Tag, Play, BookOpen,
  Star, SkipForward, SkipBack, Pause, Heart, Share2, Download, Volume2, VolumeX
} from 'lucide-react';
import API from '../api/axios';
import { useFavorites } from '../context/FavoritesContext';
import { useHistory } from '../context/HistoryContext';
import Layout from './Layout';

// ─────────────────────────────────────────────────────────────────
// EpisodePlayer
// ─────────────────────────────────────────────────────────────────
const EpisodePlayer = ({ audioRef, title, isPlaying, onTogglePlay, onJump }) => {
  const seekRef  = useRef(null);
  const rafRef   = useRef(null);
  const dragging = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [volume,      setVolume]      = useState(100);
  const [muted,       setMuted]       = useState(false);

  const fmt = (t) => {
    if (!isFinite(t) || t < 0) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const tick = () => {
      const a = audioRef.current;
      const s = seekRef.current;
      if (a && s && !dragging.current && a.duration > 0) {
        const pct = (a.currentTime / a.duration) * 100;
        s.value = a.currentTime;
        s.style.setProperty('--pct', `${pct}%`);
        setCurrentTime(a.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [audioRef]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => {
      const dur = a.duration || 0;
      setDuration(dur);
      setCurrentTime(0);
      if (seekRef.current) {
        seekRef.current.max   = dur || 1;
        seekRef.current.value = 0;
        seekRef.current.style.setProperty('--pct', '0%');
      }
    };
    if (a.readyState >= 1) onMeta();
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange',  onMeta);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange',  onMeta);
    };
  }, [audioRef]);

  useEffect(() => {
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mouseup',  onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mouseup',  onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const onSeekInput = useCallback((e) => {
    const v   = parseFloat(e.target.value);
    const max = parseFloat(e.target.max) || 1;
    e.target.style.setProperty('--pct', `${(v / max) * 100}%`);
    setCurrentTime(v);
    if (audioRef.current) audioRef.current.currentTime = v;
  }, [audioRef]);

  const onVolChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) { audioRef.current.volume = v / 100; audioRef.current.muted = v === 0; }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  return (
    <div className="mt-4 p-4 rounded-xl border backdrop-blur-sm"
      style={{ background: 'rgba(210,236,193,0.08)', borderColor: 'rgba(210,236,193,0.2)' }}>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: '#D2ECC1' }} />
          <p className="text-sm truncate font-medium" style={{ color: '#D2ECC1' }}>{title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onJump(-10)}
            className="p-2 rounded-full transition-all hover:scale-110"
            style={{ color: '#D2ECC1' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(210,236,193,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <SkipBack size={17} />
          </button>
          <button onClick={onTogglePlay}
            className="p-3 rounded-full transition-all hover:scale-110 shadow-lg mx-1"
            style={{ background: '#D2ECC1', color: '#1a2e14' }}
            onMouseEnter={e => e.currentTarget.style.background='#bde0a8'}
            onMouseLeave={e => e.currentTarget.style.background='#D2ECC1'}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => onJump(10)}
            className="p-2 rounded-full transition-all hover:scale-110"
            style={{ color: '#D2ECC1' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(210,236,193,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <SkipForward size={17} />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={toggleMute}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{ color: '#D2ECC1' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(210,236,193,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={100} value={muted ? 0 : volume}
              onChange={onVolChange} className="vol-slider" />
          </div>
        </div>
      </div>

      <input
        ref={seekRef}
        type="range"
        className="seek-slider"
        min={0}
        max={duration || 1}
        step={1}
        defaultValue={0}
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
        onInput={onSeekInput}
      />
      <div className="flex justify-between text-xs tabular-nums mt-1 px-0.5" style={{ color: 'rgba(210,236,193,0.6)' }}>
        <span>{fmt(currentTime)}</span>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  );
};

const BookDetail = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();

  const [book,                setBook]                = useState(null);
  const [episodes,            setEpisodes]            = useState([]);
  const [activeTab,           setActiveTab]           = useState('overview');
  const [currentAudioUrl,     setCurrentAudioUrl]     = useState(null);
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState('');
  const [currentEpisodeId,    setCurrentEpisodeId]    = useState(null);
  const [isPlaying,           setIsPlaying]           = useState(false);
  const [loading,             setLoading]             = useState(true);

  const audioRef = useRef(null);

  useEffect(() => {
    const fetch_ = async () => {
      try { setLoading(true); const res = await API.get(`/api/books/${id}`); setBook(res.data); }
      finally { setLoading(false); }
    };
    if (id) fetch_();
  }, [id]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get(`/api/books/${id}/episodes`, { headers: { Authorization: `Bearer ${token}` } });
        setEpisodes(res.data || []);
      } catch { setEpisodes([]); }
    };
    if (id) fetch_();
  }, [id]);

  const formatDuration = (d) => {
    if (!d) return 'Unknown';
    if (typeof d === 'number') { const m = Math.floor(d); const s = Math.round((d - m) * 60); return `${m}m ${s}s`; }
    return d;
  };

  const handlePlayEpisode = (ep) => {
    const newUrl = ep.audioUrl;
    setCurrentEpisodeId(ep._id);
    setCurrentEpisodeTitle(ep.title || `Episode ${ep.episodeNumber}`);
    setIsPlaying(true);
    if (currentAudioUrl === newUrl && audioRef.current) { audioRef.current.play().catch(() => {}); return; }
    setCurrentAudioUrl(newUrl);
    setTimeout(() => { if (audioRef.current) { audioRef.current.load(); audioRef.current.play().catch(() => {}); } }, 50);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else           { audioRef.current.play();  setIsPlaying(true);  }
  };

  const jump = (secs) => { if (audioRef.current) audioRef.current.currentTime += secs; };

  if (loading) return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(210,236,193,0.2)', borderTopColor: '#D2ECC1' }} />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping" style={{ borderRightColor: '#D2ECC1' }} />
          </div>
          <div className="text-2xl font-semibold text-white animate-pulse">Loading your book...</div>
          <div className="flex space-x-1 justify-center">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#D2ECC1', animationDelay: `${i*0.2}s` }} />)}
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout showSearch={false}>
      <style>{`
        /* ── Seek slider ── */
        .seek-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; background: transparent;
          cursor: pointer; outline: none; border: none;
          display: block; padding: 10px 0; margin: 0; --pct: 0%;
        }
        .seek-slider::-webkit-slider-runnable-track {
          height: 4px; border-radius: 99px;
          background: linear-gradient(to right, #D2ECC1 var(--pct), rgba(210,236,193,0.2) var(--pct));
          transition: height 0.15s;
        }
        .seek-slider:hover::-webkit-slider-runnable-track { height: 6px; }
        .seek-slider::-moz-range-track    { height: 4px; border-radius: 99px; background: rgba(210,236,193,0.2); }
        .seek-slider::-moz-range-progress { height: 4px; border-radius: 99px; background: #D2ECC1; }
        .seek-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 0; height: 0; border-radius: 50%;
          background: #D2ECC1; margin-top: -4px;
          transition: width 0.12s, height 0.12s, margin-top 0.12s;
        }
        .seek-slider:hover::-webkit-slider-thumb,
        .seek-slider:active::-webkit-slider-thumb { width: 14px; height: 14px; margin-top: -5px; }
        .seek-slider::-moz-range-thumb { width: 0; height: 0; border: none; background: #D2ECC1; transition: width 0.12s, height 0.12s; }
        .seek-slider:hover::-moz-range-thumb,
        .seek-slider:active::-moz-range-thumb { width: 14px; height: 14px; }
        @media (hover: none) {
          .seek-slider::-webkit-slider-thumb { width: 18px !important; height: 18px !important; margin-top: -7px !important; }
          .seek-slider::-moz-range-thumb     { width: 18px !important; height: 18px !important; }
        }

        /* ── Volume slider ── */
        .vol-slider {
          -webkit-appearance: none; appearance: none;
          width: 70px; height: 3px; border-radius: 99px;
          background: rgba(210,236,193,0.25); cursor: pointer; outline: none; border: none; padding: 6px 0;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 11px; height: 11px;
          border-radius: 50%; background: #D2ECC1; cursor: pointer; margin-top: -4px;
        }
        .vol-slider::-moz-range-thumb { width: 11px; height: 11px; border-radius: 50%; background: #D2ECC1; border: none; }

        .tabs-row { scrollbar-width: none; }
        .tabs-row::-webkit-scrollbar { display: none; }
      `}</style>

      <audio ref={audioRef} src={currentAudioUrl} onEnded={() => setIsPlaying(false)} />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: 'rgba(210,236,193,0.06)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: 'rgba(210,236,193,0.04)', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ background: 'rgba(210,236,193,0.03)', animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-6 lg:py-10">

          <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 mb-10">
            <div className="xl:sticky xl:top-8 xl:self-start w-full xl:w-80 2xl:w-96 shrink-0">
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl max-w-sm mx-auto xl:max-w-none transition-all duration-700 hover:scale-[1.02]"
                style={{ boxShadow: '0 8px 40px rgba(210,236,193,0.1)' }}>
                <img
                  src={book.cover || book.image || book.coverImage}
                  alt={book.title}
                  className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => toggleFavorite(id)}
                    className="p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110"
                    style={{ background: isFavorite(id) ? 'rgba(220,50,50,0.8)' : 'rgba(210,236,193,0.2)', color: '#fff' }}>
                    <Heart size={18} className={isFavorite(id) ? 'fill-current' : ''} />
                  </button>
                  <button className="p-3 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(210,236,193,0.2)', color: '#fff' }}><Share2 size={18} /></button>
                  <button className="p-3 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(210,236,193,0.2)', color: '#fff' }}><Download size={18} /></button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
              </div>
              <div className="hidden xl:grid grid-cols-2 gap-3 mt-5">
                {[
                  { icon: Globe,    label: book.language,                color: '#D2ECC1' },
                  { icon: Tag,      label: book.genre,                   color: '#D2ECC1' },
                  { icon: Clock,    label: formatDuration(book.duration), color: '#D2ECC1' },
                  { icon: BookOpen, label: `${episodes.length} Episodes`, color: '#D2ECC1' },
                ].map(({ icon: Icon, label, color }, i) => (
                  <div key={i} className="p-3 rounded-xl border transition-all duration-300 hover:scale-[1.03]"
                    style={{ background: 'rgba(210,236,193,0.05)', borderColor: 'rgba(210,236,193,0.12)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-2">
                      <Icon size={15} style={{ color, flexShrink: 0 }} />
                      <span className="text-xs font-medium truncate text-gray-300">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0">

              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold leading-tight mb-2 text-white">
                  {book.title}
                </h1>
                <p className="text-lg sm:text-xl mb-5 text-gray-300">
                  by <span className="font-semibold" style={{ color: '#D2ECC1' }}>{book.author}</span>
                </p>

                <div className="xl:hidden grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Globe,    label: book.language                },
                    { icon: Tag,      label: book.genre                   },
                    { icon: Clock,    label: formatDuration(book.duration) },
                    { icon: BookOpen, label: `${episodes.length} Episodes` },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="p-3 sm:p-4 rounded-xl border transition-all duration-300 hover:scale-[1.03]"
                      style={{ background: 'rgba(210,236,193,0.05)', borderColor: 'rgba(210,236,193,0.12)', backdropFilter: 'blur(8px)' }}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} style={{ color: '#D2ECC1', flexShrink: 0 }} />
                        <span className="text-xs sm:text-sm font-medium truncate text-gray-300">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { if (episodes[0]) { handlePlayEpisode(episodes[0]); addToHistory(id); } }}
                    className="flex-1 sm:flex-none sm:min-w-[200px] px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 font-semibold text-base transition-all duration-300 hover:scale-105"
                    style={{ background: '#D2ECC1', color: '#1a2e14', boxShadow: '0 4px 20px rgba(210,236,193,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#bde0a8'; e.currentTarget.style.boxShadow='0 6px 28px rgba(210,236,193,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#D2ECC1'; e.currentTarget.style.boxShadow='0 4px 20px rgba(210,236,193,0.25)'; }}
                  >
                    <Play size={20} /> Start Listening
                  </button>
                  <button
                    onClick={() => toggleFavorite(id)}
                    className="flex-1 sm:flex-none sm:min-w-[160px] px-8 py-3.5 border-2 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 text-white"
                    style={isFavorite(id)
                      ? { borderColor: '#ef4444', background: 'rgba(239,68,68,0.15)' }
                      : { borderColor: 'rgba(210,236,193,0.3)', background: 'transparent' }}
                    onMouseEnter={e => { if (!isFavorite(id)) e.currentTarget.style.borderColor='rgba(210,236,193,0.6)'; }}
                    onMouseLeave={e => { if (!isFavorite(id)) e.currentTarget.style.borderColor='rgba(210,236,193,0.3)'; }}
                  >
                    {isFavorite(id) ? '❤️ Saved' : 'Add to Library'}
                  </button>
                </div>
              </div>


              <div className="mb-6" style={{ borderBottom: '1px solid rgba(210,236,193,0.15)' }}>
                <div className="flex gap-6 sm:gap-10 overflow-x-auto tabs-row">
                  {['overview', 'episodes', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="relative pb-3 font-semibold text-base sm:text-lg whitespace-nowrap transition-all duration-300 shrink-0"
                      style={{ color: activeTab === tab ? '#D2ECC1' : 'rgba(255,255,255,0.4)' }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                        style={{
                          background: '#D2ECC1',
                          opacity: activeTab === tab ? 1 : 0,
                          transform: activeTab === tab ? 'scaleX(1)' : 'scaleX(0)',
                        }} />
                    </button>
                  ))}
                </div>
              </div>
              {activeTab === 'overview' && (
                <div
                  className="leading-relaxed text-sm sm:text-base p-5 sm:p-6 rounded-xl border text-gray-300"
                  style={{ background: 'rgba(210,236,193,0.04)', borderColor: 'rgba(210,236,193,0.1)', backdropFilter: 'blur(8px)' }}
                  dangerouslySetInnerHTML={{ __html: book.description || '<p>No description available.</p>' }}
                />
              )}
              {activeTab === 'episodes' && (
                <div className="space-y-3">
                  {episodes.map((ep, i) => (
                    <div
                      key={ep._id}
                      className="rounded-2xl border transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(210,236,193,0.12)', backdropFilter: 'blur(8px)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(210,236,193,0.3)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(210,236,193,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(210,236,193,0.12)'; e.currentTarget.style.boxShadow='none'; }}
                    >
                      <div onClick={() => handlePlayEpisode(ep)} className="flex justify-between items-center cursor-pointer p-4 sm:p-5">
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                              style={{ background: 'rgba(210,236,193,0.1)', border: '1px solid rgba(210,236,193,0.2)', color: '#D2ECC1' }}>
                              {ep.episodeNumber || i + 1}
                            </span>
                            <h4 className="font-semibold text-sm sm:text-base truncate text-white transition-colors duration-200">
                              {ep.title || `Episode ${ep.episodeNumber || i + 1}`}
                            </h4>
                          </div>
                          <p className="text-xs flex items-center gap-1.5 pl-10 text-gray-400">
                            <Clock size={12} className="shrink-0" />
                            {formatDuration(ep.duration)}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-full transition-all duration-200 shrink-0"
                          style={currentEpisodeId === ep._id
                            ? { background: '#D2ECC1', color: '#1a2e14' }
                            : { background: 'rgba(210,236,193,0.1)', color: '#D2ECC1' }}>
                          {currentEpisodeId === ep._id && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </div>
                      </div>

                      {currentEpisodeId === ep._id && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                          <EpisodePlayer
                            audioRef={audioRef}
                            title={currentEpisodeTitle}
                            isPlaying={isPlaying}
                            onTogglePlay={togglePlayPause}
                            onJump={jump}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-16">
                  <div className="space-y-5">
                    <div className="relative inline-block">
                      <Star size={56} className="animate-pulse" style={{ color: '#D2ECC1' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Star size={40} className="animate-ping" style={{ color: '#D2ECC1' }} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-1">No reviews yet</h3>
                      <p className="text-sm sm:text-base text-gray-400">Be the first to share your thoughts!</p>
                    </div>
                    <button
                      className="px-7 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105"
                      style={{ background: '#D2ECC1', color: '#1a2e14', boxShadow: '0 4px 16px rgba(210,236,193,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background='#bde0a8'}
                      onMouseLeave={e => e.currentTarget.style.background='#D2ECC1'}
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;