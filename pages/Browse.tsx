
import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { CATEGORIES } from '../data/mockData';
import { Movie } from '../types';
import { Search, Sparkles } from 'lucide-react';
import { getAIsuggestions } from '../geminiService';
import { useNavigate } from 'react-router-dom';


const Browse: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8081/api/list-films');
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        setMovies([]);
      }
      setLoading(false);
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchAiRecommendation = async () => {
      setLoadingAi(true);
      const tip = await getAIsuggestions(activeCategory === 'All' ? 'Christian movies' : activeCategory);
      setAiTip(tip || '');
      setLoadingAi(false);
    };
    fetchAiRecommendation();
  }, [activeCategory]);

  const filteredMovies = movies.filter(m => {
    const matchesCat = activeCategory === 'All' || m.category === activeCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-24 px-8 md:px-16 space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold font-serif">Explore Movies</h1>
        
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-full md:w-64"
            />
          </div>
        </div>
      </header>

      {/* AI Box */}
      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-4 rounded-lg flex items-start gap-3">
        <div className="mt-1">
          <Sparkles className="text-[#d4af37]" size={20} />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest">Gospel Screen Discovery</span>
          <p className="text-sm text-gray-300 italic">
            {loadingAi ? "Thinking..." : aiTip}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading movies...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={() => navigate(`/watch/${movie.id}`)} />
            ))}
          </div>
          {filteredMovies.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              <p>No movies found matching your criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
