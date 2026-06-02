import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate session on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // In Supabase, clicking the password reset email auto-authenticates the user
      // with a recovery session. If no session is present, they shouldn't navigate here directly.
      if (!session) {
        // Fallback or warning, but let them proceed if they have recovery parameters in URL hash
        const hasHash = window.location.hash && (
          window.location.hash.includes('access_token=') || 
          window.location.hash.includes('error=')
        );
        if (!hasHash) {
          setError('No active password recovery session detected. Please request a new link.');
        }
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setSuccess('Password successfully updated (Simulated)! Redirecting to login...');
        setLoading(false);
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }, 1000);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Log out to ensure session is completely refreshed and updated
      await supabase.auth.signOut();

      setSuccess('Password successfully updated! Redirecting to login page...');
      setLoading(false);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2500);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Error updating password. The recovery link may be expired.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      {/* Exit Button */}
      <Link 
        to="/admin/login" 
        className="absolute top-6 left-6 lg:left-auto lg:right-8 lg:top-8 z-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors bg-white/85 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
      >
        <ArrowLeft size={14} />
        Back to Login
      </Link>

      {/* Left Column - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center text-center p-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-app-purple/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-app-purple/10 rounded-full blur-[120px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <span className="text-app-purple font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Security Console</span>
          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none mb-6">
            Reset <span className="text-app-purple">Password</span>
          </h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Please enter your new administrator credentials below. Make sure to choose a strong password to ensure system integrity.
          </p>
        </motion.div>
      </div>

      {/* Right Column - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-50/50 min-h-screen lg:min-h-0 lg:h-screen lg:overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md my-auto py-4 mt-20 lg:mt-0"
        >
          <div className="flex flex-col items-start mb-6 lg:mb-8">
            <h1 className="text-2xl font-display font-black text-black uppercase tracking-tight">Update Password</h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">Secure Credentials Update</p>
          </div>

          <div className="py-2">
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 text-[10px] font-bold py-2.5 px-4 rounded-xl border border-red-100 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 text-[10px] font-bold py-2.5 px-4 rounded-xl border border-green-100 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {success}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black/5 focus:outline-none transition-all placeholder:text-slate-300"
                    required
                    disabled={loading || !!success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black/5 focus:outline-none transition-all placeholder:text-slate-300"
                    required
                    disabled={loading || !!success}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-black/10 mt-6 group flex items-center justify-center gap-3 disabled:opacity-70"
                disabled={loading || !!success}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save New Password'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
