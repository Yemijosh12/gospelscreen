import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>('');
  const [waitingForEmail, setWaitingForEmail] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (!tokenParam || !emailParam) {
      setWaitingForEmail(true);
      return;
    }
    setToken(tokenParam);
    // store email in state via hidden input or closure
    // we will send emailParam with the reset request
    // keep it in a ref-like closure by setting to a stable var
    (window as any).__resetEmail = emailParam;
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!newPassword) throw new Error("New password is required.");
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");

      const emailParam = (window as any).__resetEmail || searchParams.get('email');
      const response = await fetch('http://localhost:8081/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailParam, token, newPassword }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">

          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {waitingForEmail ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className="text-gray-500 text-sm">
              {waitingForEmail ? "We've sent a reset link to your email. Click the link to reset your password." : 'Enter your new password below.'}
            </p>
          </div>

          {!waitingForEmail && (
            <>
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(waitingForEmail ? '/forgot-password' : '/auth')}
              className="text-[#d4af37] hover:underline text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              {waitingForEmail ? 'Back to Forgot Password' : 'Back to Sign In'}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
            <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
              Secure Password Reset for all GospelScreen users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;