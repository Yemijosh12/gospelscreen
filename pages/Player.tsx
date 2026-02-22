
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Maximize2, Calendar, Star, Share2, MessageSquare, Send, Radio, User, Clapperboard, Info, Eye, X, Camera, Trash2 } from 'lucide-react';
import { Movie, Comment } from '../types';
import { movieService } from '../services/movieService';
import { authService } from '../services/authService';

const VIEWS_KEY = 'gospelscreen_views_db';
const USER_VIEWS_KEY = 'gospelscreen_user_views_db';

interface PlayerProps {
  movies: Movie[];
  onDeleteMovie?: (movie: Movie) => void;
}

const Player: React.FC<PlayerProps> = ({ movies, onDeleteMovie }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie, ] = useState<Movie | null>(null);
  const [comments, setComments, ] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [views, setViews] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [hasUserViewed, setHasUserViewed] = useState(false);
  const [viewTimer, setViewTimer] = useState<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear any existing timer when movie changes
    if (viewTimer) {
      clearTimeout(viewTimer);
      setViewTimer(null);
    }
    
    const found = movies.find(m => m.id === id);
    if (found) {
      setMovie(found);
      const savedComments = movieService.getComments(found.id);
      setComments(savedComments);
      
      // Load total views (unique viewers count)
      const viewsData = JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
      const currentViews = viewsData[found.id] || 0;
      setViews(currentViews);
      
      // Check if current user has viewed this movie
      const currentUser = authService.getCurrentUser();
      let userHasViewed = false;
      if (currentUser) {
        const userViewsData = JSON.parse(localStorage.getItem(USER_VIEWS_KEY) || '{}');
        userHasViewed = userViewsData[currentUser.email]?.[found.id] || false;
      }
      setHasUserViewed(userHasViewed);
      setHasIncrementedViews(false); // Reset for new movie
      
      // Load user rating
      if (currentUser) {
        setUserRating(authService.getUserRating(currentUser.email, found.id));
      }
      
      // Calculate total stars
      const saved = localStorage.getItem('gospelscreen_user_ratings_db');
      if (saved) {
        const allRatings = JSON.parse(saved);
        let count = 0;
        Object.values(allRatings).forEach((userRatings: any) => {
          if (userRatings[found.id] && userRatings[found.id] > 0) {
            count++;
          }
        });
        setTotalStars(count);
      }
    }
    setCurrentUser(authService.getCurrentUser());
    setIsPlayingTrailer(false);
  }, [id, movies]);

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (viewTimer) {
        clearTimeout(viewTimer);
      }
    };
  }, [viewTimer]);



  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      setDuration(vid.duration || 0);
      setCurrentTime(vid.currentTime || 0);
      vid.volume = volume;
      vid.playbackRate = playbackRate;
    };

    const onTime = () => setCurrentTime(vid.currentTime || 0);
    const onPlay = () => {
      setIsPlaying(true);
      // Start view timer if user hasn't viewed before and timer not already running
      if (!hasUserViewed && !viewTimer && movie && currentUser) {
        const timer = setTimeout(() => {
          // Increment views after 30 seconds of continuous play
          const viewsData = JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
          const currentViews = viewsData[movie.id] || 0;
          const newViews = currentViews + 1;
          viewsData[movie.id] = newViews;
          localStorage.setItem(VIEWS_KEY, JSON.stringify(viewsData));
          setViews(newViews);
          setHasIncrementedViews(true);
          
          // Mark user as having viewed this movie
          const userViewsData = JSON.parse(localStorage.getItem(USER_VIEWS_KEY) || '{}');
          if (!userViewsData[currentUser.email]) {
            userViewsData[currentUser.email] = {};
          }
          userViewsData[currentUser.email][movie.id] = true;
          localStorage.setItem(USER_VIEWS_KEY, JSON.stringify(userViewsData));
          setHasUserViewed(true);
          setViewTimer(null);
        }, 30000); // 30 seconds
        setViewTimer(timer);
      }
    };
    
    const onPause = () => {
      setIsPlaying(false);
      // Clear view timer if user pauses before 30 seconds
      if (viewTimer) {
        clearTimeout(viewTimer);
        setViewTimer(null);
      }
    };

    vid.addEventListener('loadedmetadata', onLoaded);
    vid.addEventListener('timeupdate', onTime);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);

    const onFullChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onFullChange);

    return () => {
      try {
        vid.removeEventListener('loadedmetadata', onLoaded);
        vid.removeEventListener('timeupdate', onTime);
        vid.removeEventListener('play', onPlay);
        vid.removeEventListener('pause', onPause);
      } catch (e) {
        // ignore if vid changed
      }
      document.removeEventListener('fullscreenchange', onFullChange);
    };
  }, [volume, playbackRate, movie?.fullMovieUrl, movie?.trailerUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !movie) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      movieId: movie.id,
      userName: currentUser.name,
      text: newComment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarUrl: currentUser.avatar,
    };

    const updatedComments = movieService.addComment(comment);
    setComments(updatedComments.reverse());
    setNewComment('');
  };

  const playFullMovie = async () => {
    setIsPlayingTrailer(false);
    if (videoRef.current) {
      videoRef.current.load();
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Play failed', e);
      }
    }
  };

  // Ensure when trailer/full toggles, the video element loads the updated src
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // allow React to update the `src` on the <video> before calling load
    const id = window.setTimeout(() => {
      try {
        vid.load();
        // Do not auto-play, let user click play button
      } catch (e) {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [isPlayingTrailer, movie?.trailerUrl, movie?.fullMovieUrl]);

  // If navigated here with ?autoplayTrailer=true and the movie has a trailer, set trailer mode but don't auto-play
  useEffect(() => {
    if (!movie) return;
    const params = new URLSearchParams(location.search);
    const auto = params.get('autoplayTrailer');
    if (auto === 'true' && movie.trailerUrl) {
      setIsPlayingTrailer(true);
      // Do not auto-play, let user click play button
    }
  }, [location.search, movie]);

  const togglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      if (vid.paused) {
        await vid.play();
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('Play failed', e);
    }
  };

  const seek = (time: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.min(Math.max(0, time), vid.duration || 0);
  };

  const skip = (seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    seek((vid.currentTime || 0) + seconds);
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const vid = videoRef.current;
    const dur = vid?.duration || duration || 0;
    const newTime = dur * percent;
    seek(newTime);
  };

  const toggleMute = () => setMuted((m) => !m);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };



  const handleRating = (rating: number) => {
    if (!currentUser || !movie) return;
    
    authService.setUserRating(currentUser.email, movie.id, rating);
    setUserRating(rating);
    
    // Recalculate total stars
    const saved = localStorage.getItem('gospelscreen_user_ratings_db');
    if (saved) {
      const allRatings = JSON.parse(saved);
      let count = 0;
      Object.values(allRatings).forEach((userRatings: any) => {
        if (userRatings[movie.id] && userRatings[movie.id] > 0) {
          count++;
        }
      });
      setTotalStars(count);
    }
  };

  const deleteMovie = () => {
    if (!movie || !currentUser) return;
    
    if (window.confirm(`Are you sure you want to delete "${movie.title}"? This action cannot be undone.`)) {
      if (onDeleteMovie) {
        onDeleteMovie(movie);
      }
      // Navigate back to browse page
      navigate('/browse');
    }
  };

  const getLevelInfo = (views: number) => {
    if (views >= 500000) return { level: 5, color: "#d4af37", name: "Level 5" };
    if (views >= 100000) return { level: 4, color: "#ffff00", name: "Level 4" };
    if (views >= 1000) return { level: 3, color: "#0000ff", name: "Level 3" };
    if (views >= 500) return { level: 2, color: "#00ff00", name: "Level 2" };
    if (views >= 200) return { level: 1, color: "#ffffff", name: "Level 1" };
    return null;
  };

  if (!movie) return <div className="pt-24 text-center">Loading Content...</div>;

  const levelInfo = getLevelInfo(views);

  const currentSource = isPlayingTrailer && movie.trailerUrl
    ? `http://localhost:8081${movie.trailerUrl}`
    : movie.fullMovieUrl ? `http://localhost:8081${movie.fullMovieUrl}` : "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="pt-20 px-4 md:px-16 space-y-8 animate-in fade-in duration-500">
      {/* Video Player Section */}
      <div ref={containerRef} className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden group border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Actual Video Element */}
        <video 
          ref={videoRef}
          poster={movie.thumbnail}
          className="w-full h-full object-cover"
          controls={false}
          preload="metadata"
          playsInline
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            setDuration(vid.duration || 0);
            setCurrentTime(vid.currentTime || 0);
            vid.volume = volume;
            vid.playbackRate = playbackRate;
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
          onPlay={() => {
            setIsPlaying(true);
            // Start view timer if user hasn't viewed before and timer not already running
            if (!hasUserViewed && !viewTimer && movie && currentUser) {
              const timer = setTimeout(() => {
                // Increment views after 30 minutes of continuous play
                const viewsData = JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
                const currentViews = viewsData[movie.id] || 0;
                const newViews = currentViews + 1;
                viewsData[movie.id] = newViews;
                localStorage.setItem(VIEWS_KEY, JSON.stringify(viewsData));
                setViews(newViews);
                setHasIncrementedViews(true);
                // Mark user as having viewed this movie
                const userViewsData = JSON.parse(localStorage.getItem(USER_VIEWS_KEY) || '{}');
                if (!userViewsData[currentUser.email]) {
                  userViewsData[currentUser.email] = {};
                }
                userViewsData[currentUser.email][movie.id] = true;
                localStorage.setItem(USER_VIEWS_KEY, JSON.stringify(userViewsData));
                setHasUserViewed(true);
                setViewTimer(null);
              }, 1800000); // 30 minutes
              setViewTimer(timer);
            }
          }}
          onPause={() => {
            setIsPlaying(false);
            // Clear view timer if user pauses before 30 seconds
            if (viewTimer) {
              clearTimeout(viewTimer);
              setViewTimer(null);
            }
          }}
        >
          {/* Support for MP4 and MKV files */}
          <source src={currentSource} type="video/mp4" />
          <source src={currentSource.replace(/\.mp4$/i, '.mkv')} type="video/x-matroska" />
          {/* Fallback for browsers that do not support <source> */}
          Your browser does not support the video tag.
        </video>
        
        {/* Cinematic Overlays */}
        {isPlayingTrailer && (
          <div className="absolute top-6 left-6 z-20">
            <span className="bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              Trailer Mode
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Custom Controls Bar */}
        {/* YouTube-style Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent px-0 pb-2 pt-10 opacity-100 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress Bar with Fullscreen at end */}
          <div className="flex items-center w-full">
            <div onClick={onProgressClick} className="flex-1 h-0.5 relative overflow-hidden cursor-pointer bg-[#222]">
              <div className="absolute top-0 left-0 h-full bg-[#d4af37]" style={{ width: `${Math.max(0, Math.min(100, duration ? (currentTime / duration) * 100 : 0))}%` }} />
            </div>
            <button onClick={toggleFullscreen} className="ml-3 text-gray-400 hover:text-white transition-colors" style={{height: '24px'}}><Maximize2 size={18} /></button>
          </div>
        </div>
        {/* Large Center Play/Pause Button Overlay (YouTube style) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          style={{ pointerEvents: 'none' }}
        >
          {/* Always show play/pause overlay until movie is playing */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="transition-all"
              style={{ pointerEvents: 'auto', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <Play fill="white" size={40} />
            </button>
          )}
          {/* Optionally, show pause button only on hover if desired */}
          {isPlaying && containerRef.current && containerRef.current.matches(':hover') && (
            <button
              onClick={togglePlay}
              className="transition-all"
              style={{ pointerEvents: 'auto', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <Pause fill="white" size={40} />
            </button>
          )}
        </div>
      </div>

      {/* Info & Trailer Actions */}
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2 md:mb-0">
                  <span className="block md:hidden">{movie.title}</span>
                  <span className="hidden md:block">{movie.title}</span>
                </h1>
                <div className="flex items-center gap-4 text-[#d4af37]">
                  {levelInfo && (
                       <>
                         <div className="flex gap-1">
                           <Star size={14} style={{ fill: levelInfo.color }} />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20">
                           {levelInfo.name}
                         </span>
                       </>
                     )}
                </div>
              </div>
              
              <div className="flex gap-4">
                {/* Buttons under player for mobile only, original for desktop */}
                <div>
                  {/* Desktop: original button row */}
                  <div className="hidden md:flex gap-4 items-center">
                    {/* ...existing code for all buttons, unchanged... */}
                    <button
                      onClick={async () => {
                        if (!movie) return;
                        if (!movie.trailerUrl) {
                          fileInputRef.current?.click();
                          return;
                        }
                        setIsPlayingTrailer(!isPlayingTrailer);
                        if (videoRef.current) {
                          videoRef.current.load();
                          try {
                            await videoRef.current.play();
                            setIsPlaying(true);
                          } catch (e) {
                            console.warn('Play failed', e);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${isPlayingTrailer ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-white hover:border-[#d4af37]/50 hover:text-[#d4af37]'}`}
                    >
                      <Clapperboard size={18} />
                      {isPlayingTrailer ? 'Trailer' : (movie?.trailerUrl ? 'Trailer' : 'Trailer')}
                    </button>
                    <button
                      onClick={playFullMovie}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all bg-[#d4af37] text-black border-0 hover:bg-[#c49f27]"
                    >
                      <Play size={18} />
                      Watch
                    </button>
                  
                    <button
                      onClick={() => handleRating(userRating > 0 ? 0 : 5)}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                      title={userRating > 0 ? 'Remove rating' : 'Rate 5 stars'}
                    >
                      <Star 
                        size={20} 
                        fill={userRating > 0 ? '#d4af37' : 'none'} 
                        className={userRating > 0 ? 'text-[#d4af37]' : 'text-gray-400'} 
                      />
                    </button>
                    {currentUser && movie.uploader === currentUser.name && (
                      <button 
                        onClick={deleteMovie}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete movie"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button onClick={() => setShowShareDialog(true)} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                  {/* Mobile: buttons under player */}
                  <div className="flex flex-wrap gap-2 mt-4 md:hidden w-full justify-center items-center">
                    <button
                      onClick={async () => {
                        if (!movie) return;
                        if (!movie.trailerUrl) {
                          fileInputRef.current?.click();
                          return;
                        }
                        setIsPlayingTrailer(!isPlayingTrailer);
                        if (videoRef.current) {
                          videoRef.current.load();
                          try {
                            await videoRef.current.play();
                            setIsPlaying(true);
                          } catch (e) {
                            console.warn('Play failed', e);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${isPlayingTrailer ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-white hover:border-[#d4af37]/50 hover:text-[#d4af37]'}`}
                    >
                      <Clapperboard size={16} />
                      {isPlayingTrailer ? 'Trailer' : (movie?.trailerUrl ? 'Trailer' : 'Trailer')}
                    </button>
                    <button
                      onClick={playFullMovie}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all bg-[#d4af37] text-black border-0 hover:bg-[#c49f27]"
                    >
                      <Play size={16} />
                      Watch
                    </button>
                    {/* Language Dropdown (Mobile) */}
                    <button
                      onClick={() => handleRating(userRating > 0 ? 0 : 5)}
                      className="p-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                      title={userRating > 0 ? 'Remove rating' : 'Rate 5 stars'}
                    >
                      <Star 
                        size={18} 
                        className={userRating > 0 ? 'text-[#d4af37]' : 'text-gray-400'} 
                        fill={userRating > 0 ? '#d4af37' : 'none'} 
                      />
                    </button>
                    {currentUser && movie.uploader === currentUser.name && (
                      <button 
                        onClick={deleteMovie}
                        className="p-2 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete movie"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button onClick={() => setShowShareDialog(true)} className="p-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-[#d4af37]" />
                {movie.year} Production
              </span>
              
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-0.5 rounded-lg text-[10px] font-bold border border-[#d4af37]/20">
                {movie.category}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-2">
                <User size={14} className="text-[#d4af37]" />
                Movie by {movie.uploader}
              </span>
              
            </div>

            <div className="space-y-4">
               <h3 className="text-lg md:text-2xl font-serif font-bold text-gray-100 flex items-center gap-3">
                 <Info size={18} className="text-[#d4af37]" />
                 Production Synopsis
               </h3>
               <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light italic border-l-2 border-[#d4af37]/30 pl-4 md:pl-6 py-2 text-justify md:text-left" style={{ textJustify: 'inter-word' }}>
                 <span className="block max-w-[92vw] md:max-w-2xl mx-auto md:mx-0 break-words whitespace-pre-line">{movie.description}</span>
               </p>
            </div>
          </div>
        </div>

        {/* Unified Community Feed */}
        <div className="space-y-6">
          {/* Views Section */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye size={18} className="text-[#d4af37]" />
                Views
              </h3>
              <span className="text-2xl font-bold text-[#d4af37]">{views.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">People who have watched this movie</p>
          </div>

          {/* Stars Section */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star size={18} className="text-[#d4af37]" />
                Stars
              </h3>
              <span className="text-2xl font-bold text-[#d4af37]">{totalStars.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">People who liked this movie</p>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Radio size={18} className="text-red-500 animate-pulse" />
              Community Discussion
            </h3>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-3xl h-[500px] flex flex-col overflow-hidden shadow-inner">
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <MessageSquare size={48} className="mb-4 text-[#d4af37]" />
                  <p className="text-sm font-medium">Join the faithful conversation.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex w-full items-center mb-1 px-1">
                      <User size={16} className="text-[#d4af37] mr-2" />
                      <span className="font-semibold text-gray-200 mr-2">{comment.userName}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 ml-8 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 bg-black/40 border-t border-white/5">
              {currentUser ? (
                <form onSubmit={handleSendComment} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your testimony..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-black bg-[#d4af37] rounded-xl hover:bg-[#c49f27] transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
              ) : (
                <Link
                  to="/auth"
                  className="w-full block bg-[#d4af37] text-black text-center py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c49f27] transition-all"
                >
                  Sign in to Discuss
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share this movie</h3>
              <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied!');
                  }}
                  className="px-3 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-lg hover:bg-[#c49f27]"
                >
                  Copy
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="flex items-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  <span className="text-sm font-bold">Facebook</span>
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this movie: ${movie?.title}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="flex items-center gap-2 p-3 bg-white-400 text-white rounded-xl hover:bg-black-500 transition-all"
                >
                  <span className="text-sm font-bold">X</span>
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=Check out this movie: ${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="flex items-center gap-2 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  <span className="text-sm font-bold">WhatsApp</span>
                </button>
                <button
                  onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                  className="flex items-center gap-2 p-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all"
                >
                  <Camera size={16} />
                  <span className="text-sm font-bold">Instagram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
