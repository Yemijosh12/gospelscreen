
import React, { useEffect, useRef, useState } from 'react';
import { Play, Upload, UserPlus, Home, Tv, User as UserIcon, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface HeroProps {
  user: User | null;
}

const Hero: React.FC<HeroProps> = ({ user }) => {
  const [showNav, setShowNav] = useState(false);
  const lastScrollY = useRef(window.scrollY);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth > 768) {
        setShowNav(false);
        return;
      }
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nav items config
  const navItems = [
    { label: 'Home', icon: <Home size={26} />, path: '/' },
    { label: 'Browse', icon: <Video size={26} />, path: '/browse' },
    { label: 'Live', icon: <Tv size={26} />, path: '/live' },
    { label: 'You', icon: <UserIcon size={26} />, path: '/profile' },
  ];

  return (
    <>
      <section className="relative min-h-[50vh] w-full flex items-start px-8 md:px-16 pt-32 md:pt-32 pb-20 overflow-hidden">
      {/* Background with cinematic overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage:
           `url('image21.png')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-[2px] w-12 bg-[#d4af37]"></span>
            <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.4em]">
              WELCOME TO GOSPEL SCREEN TV</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold leading-[1] tracking-tighter">
            Gospel Filled<br />
            <span className="text-[#d4af37] font-serif"> Stories.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-xl leading-relaxed font-light">
            Watch Inspiring Unlimited Christian Movies Anytime. Experience stories of hope, 
            redemption, and divine transformation.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 pt-4">
          <Link 
            to="/browse"
            className="px-12 py-5 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#c49f27] transition-all flex items-center gap-3 transform hover:scale-105 shadow-2xl shadow-[#d4af37]/30"
          >
            <Play fill="black" size={24} />
            Get Started
          </Link>
          {user && (
            <Link 
              to="https://discord.gg/68TPYr3b"
              className="px-12 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 shadow-xl"
            >
              <UserPlus size={24} />
              Join Community
            </Link>
          )}
        </div>

        <div className="mt-20 flex items-center gap-8 group cursor-pointer max-w-lg p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-[#d4af37]/30 transition-all">
          <div className="h-16 w-16 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300">
            <Play fill="white" size={24} className="ml-1 group-hover:fill-[#d4af37] transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-wider">Hot Now</span>
              <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#d4af37] transition-colors">ÀBÈJÒYÈ 9</h3>
            </div>
            <p className="text-gray-400 text-xs italic tracking-wide font-light">"The Victorious" — Streaming Exclusively on GospelScreen.</p>
          </div>
        </div>
      </div>
      </section>
      {/* Floating Mobile Nav Bar */}
      <nav
        className={`fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-[#181818] border-t border-[#222]/60 py-2 md:hidden transition-all duration-300
        ${showNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.18)' }}
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center px-2 focus:outline-none group"
            style={{ background: 'none', border: 'none' }}
            aria-label={item.label}
          >
            <span className="mb-0.5 group-hover:text-[#d4af37] text-white transition-colors">{item.icon}</span>
            <span className="text-xs text-white group-hover:text-[#d4af37] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

    </>
  );
}

export default Hero;
