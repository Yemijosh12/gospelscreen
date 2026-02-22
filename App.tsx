import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Player from './pages/Player';
import Profile from './pages/Profile';
import MyVideo from './pages/myvideo';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Membership from './pages/Membership';
import ChoosePath from './pages/ChoosePath';
import MemberDashboard from './pages/MemberDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OptInput from './pages/OptInput';
import HelpCenter from './pages/HelpCenter';
import TermsOfUse from './pages/TermsOfUse';
import Privacy from './pages/Privacy';
import { Movie, User } from './types';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from './services/authService';
// import { movieService } from './services/movieService';
import CreatorDashboard from './pages/CreatorDashboard';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Initialize App State
  useEffect(() => {
    // Load current user from database if email is stored
    const loadUser = async () => {
      const user = await authService.loadUserFromDB();
      setUser(user);
    };
    loadUser();

    // Fetch movies from backend
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/list-films');
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        setMovies([]);
      }
    };
    fetchMovies();

    // Simulate loading time for preloader
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMovieSelect = (movie: Movie) => {
    if (!user) {
      setSelectedMovie(movie);
      setShowPopup(true);
    } else {
      navigate(`/watch/${movie.id}`);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    authService.setCurrentUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const handleUpload = async (newMovie: Omit<Movie, 'id' | 'rating' | 'year'>) => {
    // After upload, re-fetch movies from backend to get the latest list
    try {
      const res = await fetch('http://localhost:8081/api/list-films');
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      // fallback: do nothing
    }
    navigate('/browse');
  };

  const handleDeleteMovie = async (movie: Movie) => {
    // Delete files from server
    const filesToDelete = [];
    if (movie.fullMovieUrl) {
      filesToDelete.push(movie.fullMovieUrl.replace('/Film/', ''));
    }
    if (movie.trailerUrl) {
      filesToDelete.push(movie.trailerUrl.replace('/Film/', ''));
    }
    if (movie.thumbnail && movie.thumbnail.startsWith('/Film/')) {
      filesToDelete.push(movie.thumbnail.replace('/Film/', ''));
    }

    for (const filename of filesToDelete) {
      try {
        await fetch('http://localhost:8081/api/delete-movie', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }),
        });
      } catch (e) {
        console.error('Error deleting file:', filename, e);
      }
    }

    // Delete from local storage
    const updatedMovies = movieService.deleteMovie(movie.id);
    setMovies(updatedMovies);
  };

  return (
    <GoogleOAuthProvider clientId="827713298702-790vomnn2hd4ppfph7ss4nemm11id4sj.apps.googleusercontent.com">
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#d4af37] selection:text-black">
      {isLoading ? (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
          <div className="text-center">
            <img 
              src="/gstv.png" 
              alt="GospelScreen TV Logo" 
              className="w-32 h-15 md:w-48 md:h-25 animate-pulse mb-4"
            />
           
          </div>
        </div>
      ) : (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Home movies={movies} onMovieSelect={handleMovieSelect} user={user} />} />
              <Route path="/browse" element={<Browse movies={movies} onMovieSelect={handleMovieSelect} />} />
              <Route path="/watch/:id" element={<Player movies={movies} onDeleteMovie={handleDeleteMovie} />} />
              <Route path="/profile/:email?" element={<Profile />} />
              <Route path="/myvideo" element={<MyVideo />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/auth" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/member-dashboard" element={<MemberDashboard />} />
              <Route path="/choose-path" element={<ChoosePath />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/otp" element={<OptInput />} />
              <Route path="/upload" element={<Upload user={user} onUpload={handleUpload} />} />
              <Route path="/creator-dashboard" element={<CreatorDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <CookieConsent />

          {/* Get Started Popup */}
          {showPopup && selectedMovie && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
                <div className="text-center">
                  <img
                    src={`http://localhost:8081${selectedMovie.thumbnail}`}
                    alt={selectedMovie.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-xl font-bold mb-2">Get Started with GospelScreen TV</h2>
                  <p className="text-gray-300 mb-6">
                    Create an account to watch "{selectedMovie.title}" and enjoy unlimited access to faith-based content.
                  </p>
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      navigate('/auth?signup=true');
                    }}
                    className="w-full bg-[#d4af37] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#d4af37]/80 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
       </div> </GoogleOAuthProvider>
  );
};

export default App;
