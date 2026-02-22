import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const CreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const userName = user?.name || 'Creator';
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [monetized, setMonetized] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const dbUser = await authService.loadUserFromDB();
      if (dbUser) {
        setUser(dbUser);
        // Check if avatar is a valid URL or data string
        if (dbUser.avatar && (dbUser.avatar.startsWith('data:') || dbUser.avatar.startsWith('http'))) {
          setAvatarUrl(dbUser.avatar);
        } else if (dbUser.email) {
          // Fetch avatar from server if not valid
          try {
            const response = await fetch(`http://localhost:8081/api/upload-avatar/${dbUser.email}`);
            if (response.ok) {
              const data = await response.json();
              setAvatarUrl(data.avatar);
            } else {
              setAvatarUrl(dbUser.avatar || null);
            }
          } catch {
            setAvatarUrl(dbUser.avatar || null);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    };
    const fetchViews = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`http://localhost:8081/api/user-movie-views/${user.email}`);
          if (response.ok) {
            const data = await response.json();
            setTotalViews(data.totalViews || 0);
          } else {
            setTotalViews(0);
          }
        } catch {
          setTotalViews(0);
        }
      } else {
        setTotalViews(0);
      }
    };
    fetchUser();
    fetchViews();
  }, [user?.email]);

  // Simulate payment completion
  const handlePaymentComplete = () => {
    // After payment, navigate to dashboard
    navigate('/creator-dashboard');
  };

  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const NAIRA_PER_1000_VIEWS = 100 * 1000; // $100 per 1000 views, assuming 1 USD = 1000 NGN
  const earnings = Math.floor((totalViews / 1000) * NAIRA_PER_1000_VIEWS);
  const progressPercent = Math.min((totalViews / 1000) * 100, 100);

  return (

    <div className="min-h-screen relative overflow-hidden text-white flex items-center justify-center pt-10 pb-10">
      {/* Cinematic background image, same as Edit Profile */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('image21.png')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <main className="w-full max-w-4xl p-6 z-20">
         <br/><br/><br/>
        <div className="bg-[#121212] rounded-2xl w-full p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Creator Dashboard</h2>
              <p className="text-gray-400">Welcome, {userName}!</p>
            </div>
            <div className="text-gray-400 font-medium">{today}</div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover border border-white" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-xl text-gray-700 font-bold">
                  {userName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg text-white">{userName}</span>
            </div>
            <button
              className={`ml-4 px-4 py-2 bg-yellow-600 text-white rounded font-semibold shadow hover:bg-yellow-700 transition flex items-center justify-center ${loading ? 'opacity-70 cursor-wait' : ''}`}
              onClick={async () => {
                setLoading(true);
                await new Promise(res => setTimeout(res, 1200));
                setLoading(false);
                navigate('/upload');
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Upload New Movie'}
            </button>
          </div>
          <p className="text-gray-400 mb-6">Upload full-length Christian films securely</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="text-gray-400 font-medium mb-2">Total Views</div>
              <div className="text-3xl font-bold text-white">{totalViews}</div>
            </div>
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="text-gray-400 font-medium mb-2">Total Earnings</div>
              <div className="text-3xl font-bold text-green-400">₦{earnings.toLocaleString()}</div>
              
              <div className="text-xs text-gray-500">₦100 per 1 views</div>
            </div>
            <div className="bg-[#181818] rounded-lg p-6 shadow">
              <div className="text-gray-400 font-medium mb-2">Payout Balance</div>
              <div className="text-3xl font-bold text-gray-400">₦0</div>
              <div className="text-xs text-gray-500">Payouts are processed monthly</div>
            </div>
          </div>
          <div className="bg-[#181818] rounded-lg p-6 shadow mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-white">Monetization</span>
              
              <button
              className={`px-4 py-2 rounded font-semibold transition-colors ${!monetized && totalViews >= 1000 ? 'bg-[#d4af37] text-black hover:bg-[#c9a32b] cursor-pointer' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
              disabled={monetized || totalViews < 1000}
              onClick={() => {
                if (!monetized && totalViews >= 1000) {
                  window.location.href =
                    'mailto:gospelscreentv@gmail.com?subject=Have just been monetized&body=I will like to know next steps to receive my earnings.';
                  setMonetized(true);
                }
              }}
            >
              Enable Monetization
            </button>

            </div>
            <div className="text-gray-400 mb-2">Enable payouts once you reach 1,000 total views</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="text-gray-400 text-sm">{totalViews} / 1,000 views </div>
            <div className="text-xs text-gray-500 mt-1">1,000 Views Required</div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end mt-6">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-[#d4af37] text-black rounded-lg font-semibold shadow hover:bg-[#c9a32b] transition-colors text-sm sm:text-base"
              onClick={() => navigate('/profile')}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;
