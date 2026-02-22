
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, CheckCircle2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { GoogleLogin } from '@react-oauth/google';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const editMode = searchParams.get('edit') === 'true';
  const initialIsLogin = editMode ? false : !(searchParams.get('signup') === 'true' || searchParams.get('tab') === 'signup' || searchParams.get('mode') === 'signup');
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isEditMode] = useState(editMode);
  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profession, setProfession] = useState('');
  const [description, setDescription] = useState('');
  const avatarRef = React.useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode) {
        console.log('Edit mode - form data:', { formData, phone, profession, description });
        const updated = await authService.updateUser({
          name: formData.name,
          password: formData.password,
          phone: phone || undefined,
          avatar: undefined, // Keep existing avatar, don't update unless new file uploaded
          description: description || undefined,
          profession: profession || undefined,
        }, originalEmail || undefined);
        console.log('User updated:', updated);

        // Upload avatar if selected
        if (avatarFile) {
          console.log('Uploading new avatar file');
          const newAvatarUrl = await uploadAvatar(formData.email);
          // Update the current user with the new avatar URL
          if (newAvatarUrl) {
            const current = authService.getCurrentUser();
            if (current) {
              const updatedUser = { ...current, avatar: newAvatarUrl };
              authService.setCurrentUser(updatedUser);
            }
          }
        } else {
          authService.setCurrentUser(updated);
        }

        setSuccess('Profile updated successfully!');
        navigate('/profile');
        return;
      }
      if (isLogin) {
        const user = await authService.login({
          email: formData.email,
          password: formData.password
        });
        // show a success toast then redirect via onAuthSuccess
        setSuccess('Signed in successfully! Redirecting...');
        // Keep the existing delay before handing control to parent
        setTimeout(() => {
          onAuthSuccess(user);
        }, 3000);
      } else {
        if (!formData.name) throw new Error("Full Name is required.");
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: phone || undefined,
          avatar: undefined, // Will be uploaded separately
          description: description || undefined,
          profession: profession || undefined,
        });
        // Upload avatar if selected
        if (avatarFile) {
          await uploadAvatar(formData.email);
        }
        // Switch to sign-in mode
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
        setPhone('');
        setProfession('');
        setDescription('');
        setAvatarFile(null);
        setAvatarPreview(null);
        setError(null);
        setSuccess('Account created successfully! Please sign in with your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide floating success toast after a few seconds
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (isEditMode) {
      const u = authService.getCurrentUser();
      if (!u) {
        navigate('/auth');
        return;
      }
      setFormData({ name: u.name || '', email: u.email || '', password: '' });
      setPhone(u.phone || '');
      setOriginalEmail(u.email);
      setProfession(u.profession || '');
      setDescription(u.description || '');
      // Load avatar from server if exists
      if (u.email && (!u.avatar || !u.avatar.startsWith('data:') || !u.avatar.startsWith('http'))) {
        console.log('Fetching avatar for edit mode:', u.email);
        fetch(`http://localhost:8081/api/upload-avatar/${u.email}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(`Avatar fetch failed with status ${response.status}`);
          })
          .then(data => {
            console.log('Avatar data received for edit mode:', data);
            setAvatarPreview(data.avatar);
          })
          .catch((error) => {
            console.log('Avatar fetch error for edit mode:', error);
            setAvatarPreview(u.avatar || null);
          });
      } else {
        setAvatarPreview(u.avatar || null);
      }
    }
  }, [isEditMode, navigate]);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const uploadAvatar = async (email: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('email', email);
    
    try {
      const response = await fetch('http://localhost:8081/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // If backend returned the file path, update stored current user
      if (data.avatar) {
        const current = authService.getCurrentUser();
        if (current) {
          const updatedUser = { ...current, avatar: data.avatar };
          authService.setCurrentUser(updatedUser);
        }
        setAvatarPreview(data.avatar);
        return data.avatar;
      }
      return null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Continue with registration/update even if avatar upload fails
      return null;
    }
  };

  return (
    

    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Cinematic background image, same as Hero, but fixed and 100vw/100vh */}
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

      <div className="max-w-md w-full z-20">
        <div className="bg-[#121212]/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {isEditMode ? 'Edit Account' : (isLogin ? 'Sign In' : 'Sign up to start your membership')}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEditMode ? 'Update your account details.' : (isLogin ? 'Sign in to continue your spiritual journey.' : 'Just a few more steps and you are done.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <p>{success}</p>
            </div>
          )}

          

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    required={!isLogin}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                    placeholder="E.g. Yemi joshua"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    placeholder="e.g. +1234567890"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Profession</label>
                  <input
                    name="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    placeholder="e.g. Filmmaker"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  required
                  disabled={isEditMode}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No Image</div>
                    )}
                  </div>
                  <div>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    <button type="button" onClick={() => avatarRef.current?.click()} className="text-[#d4af37] font-bold">Upload Image</button>
                  </div>
                </div>
              </div>
            )}

            {!isEditMode && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <div className="text-[10px] text-gray-400">Use both letters and numbers (e.g. Abc123)</div>
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] text-[#d4af37] hover:underline uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={11}
                  type={showPassword ? 'text' : 'password'} 
                  required={!isEditMode}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Short Bio / Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all" placeholder="e.g. Filmmaker, pastor, worship leader..." />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4cf67] text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In Now' : (isEditMode ? 'Save Changes' : 'Create Account')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* GoogleLogin removed as requested */}
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">
              {isLogin ? "New to GSTV?" : "Already have an account?"}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[#d4af37] font-bold hover:underline"
            >
              {isLogin ? 'Sign Up now.' : 'Login'}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
            <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
              Safe & Secure Authentication for all GospelScreen users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
