import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Video, Check, X } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { PaystackButton } from 'react-paystack';

const ChoosePath: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showPaystack, setShowPaystack] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'member' | 'creator'>('member');

  useEffect(() => {
    // Try to get the current user from memory or DB
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
    } else if (authService.loadUserFromDB) {
      (authService.loadUserFromDB as any)().then(setUser);
    }
  }, []);

  const paystackConfig = {
    email: user?.email || 'gospelscreentv@gmail.com',
    amount: 2000000, // 500 Naira in kobo
    publicKey: 'pk_test_2688c949815725156559249feb369cefde3892bf',
    text: 'Accept our Creator Terms & Pay',
    metadata: {
      custom_fields: [
        {
          display_name: 'Creator',
          variable_name: 'creator_type',
          value: 'Content Creator',
        },
      ],
    },
    onSuccess: () => {
      setShowPaystack(false);
      navigate('/creator-dashboard');
    },
    onClose: () => setShowPaystack(false),
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Cinematic background image, same as Profile */}
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

      <Navbar user={user} onLogout={() => { authService.logout(); setUser(null); }} />

      {/* Removed X/back button for a cleaner, centralized layout */}
      <div className="w-full flex flex-col items-center justify-center z-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose Your Path</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Select an option below to get started.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-white/10 rounded-full flex p-1 w-fit">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${selectedPath === 'member' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setSelectedPath('member')}
            >
              Member
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedPath === 'creator' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setSelectedPath('creator')}
            >
              Creator
            </button>
          </div>
        </div>
      
        <div className="flex justify-center items-center w-full max-w-sm">
          {selectedPath === 'member' && (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between w-full">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Users size={32} className="text-[#d4af37]" />
                </div>
                <h3 className="text-xl font-bold">GospelScreen Member</h3>
                <p className="text-base text-gray-300 mb-4">Watch & Support</p>
              </div>
              <hr className="my-4 border-white/10" />
              <ul className="space-y-3 mb-6 text-base text-gray-200">
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Unlimited Access to Movies</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Exclusive Member Content</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Support Christian Filmmakers</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch GFN live</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch on Any Device</li>
              </ul>
              <button onClick={() => navigate('/membership')} className="w-full bg-[#d4af37] text-black py-3 rounded-lg text-base font-bold">Activate Your Membership</button>
            </div>
          )}
          {selectedPath === 'creator' && (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between w-full">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Video size={32} className="text-[#f97316]" />
                </div>
                <h3 className="text-xl font-bold">Content Creator</h3>
                <p className="text-base text-gray-300 mb-4">Share & Earn</p>
              </div>
              <hr className="my-4 border-white/10" />
              <ul className="space-y-3 mb-6 text-base text-gray-200">
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Upload Your Films</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Earn Money Per Views</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Access Creator Dashboard</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Get your movie sponsored</li>
                <li className="flex items-center gap-3"><Check className="text-green-500" /> Reach a Faith-Based Audience</li>
              </ul>
              <button
                onClick={() => setShowPaystack(true)}
                className="w-full bg-[#d4af37] text-black py-3 rounded-lg text-base font-bold"
              >
                Apply as a Creator
              </button>
              {showPaystack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="bg-white rounded-lg p-6 max-w-md w-90 flex flex-col items-center">
                    <PaystackButton {...paystackConfig} className="w-80 bg-[#d4af37] text-black 
                    py-3 rounded-lg text-base font-bold" />
                    <button onClick={() => setShowPaystack(false)} className="mt-4 text-sm text-gray-600 hover:text-black">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoosePath;
