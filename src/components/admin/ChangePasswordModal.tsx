import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
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
        setSuccess('🎯 Password successfully updated (Simulated inside offline demo mode)!');
        setLoading(false);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      }, 800);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess('🎯 Password successfully updated!');
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Change profile password error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-8 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl text-app-purple">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">Update Password</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pattern 1: Secure Credentials Change</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
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
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-105 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black/5 focus:outline-none transition-all placeholder:text-slate-300"
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
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-105 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black/5 focus:outline-none transition-all placeholder:text-slate-300"
                    required
                    disabled={loading || !!success}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-slate-800 py-3.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-colors shrink-0 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  disabled={loading || !!success}
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
