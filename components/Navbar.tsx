
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Star, User, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
}


const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const baseLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse', path: '/browse' }
  ];

  const userLinks = user ? [
    { name: 'Profile', path: '/profile' }
  ] : [];

  // Fetch avatar when user changes
  useEffect(() => {
    if (user?.email && (!user.avatar || !user.avatar.startsWith('data:') || !user.avatar.startsWith('http'))) {
      console.log('Fetching avatar for navbar:', user.email);
      fetch(`http://localhost:8081/api/upload-avatar/${user.email}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`Avatar fetch failed with status ${response.status}`);
        })
        .then(data => {
          console.log('Avatar data received for navbar:', data);
          setAvatarUrl(data.avatar);
        })
        .catch((error) => {
          console.log('Avatar fetch error for navbar:', error);
          setAvatarUrl(user.avatar || null);
        });
    } else {
      setAvatarUrl(user?.avatar || null);
    }
  }, [user]);

  const navLinks = [...baseLinks, ...userLinks];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[4px] px-6 md:px-16 py-5 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-[#d4af37] text-2xl font-bold tracking-tighter font-serif flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#d4af37] to-[#f4cf67] bg-clip-text text-transparent">GospelScreen TV</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#d4af37] ${
                location.pathname === link.path ? 'text-[#d4af37]' : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-gray-400">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/browse" className="hover:text-[#d4af37] transition-colors p-1" title="Search Movies">
            <Search size={20} className="md:w-[18px] md:h-[18px]" />
          </Link>
        </div>
        
        {/* Desktop / large view user area */}
        
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex flex-col items-end hidden sm:flex">
                <p> member</p>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </div>
              <Link to="/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="md:w-[20px] md:h-[20px] text-[#d4af37]" />
                )}
              </Link>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#d4af37] text-black text-[10px] md:text-xs font-bold rounded-full hover:bg-[#c49f27] transition-all">
              SIGN IN
            </Link>
          )}
        </div>

        {/* Mobile toggle button */}
        <div className="md:hidden">
          <button onClick={() => setOpen(o => !o)} className="p-2 rounded-md bg-black/5">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="absolute top-full right-4 mt-3 w-64 bg-[#0b0b0b] border border-white/5 rounded-xl p-4 shadow-lg z-50 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.filter(link => link.name !== 'Profile').map(link => (
                <Link key={link.path} to={link.path} onClick={() => setOpen(false)} className={`px-3 py-2 rounded-md ${location.pathname === link.path ? 'bg-white/5 text-[#d4af37]' : 'text-gray-300 hover:bg-white/5'}`}>
                  {link.name}
                </Link>
              ))}

              <hr className="border-white/5 my-2" />

              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : <User size={18} className="text-gray-300" />}
                    </div>
                    <div className="text-sm">{user.name}</div>
                  </Link>
                  <button onClick={() => { setOpen(false); onLogout(); }} className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-white/5">Logout</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
