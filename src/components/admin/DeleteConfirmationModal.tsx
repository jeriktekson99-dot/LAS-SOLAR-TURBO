import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
  type?: 'delete' | 'archive';
  confirmLabel?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
  type = 'delete',
  confirmLabel
}: DeleteConfirmationModalProps) {
  const isDanger = type === 'delete' || type === 'archive';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl relative z-10 max-w-md w-full overflow-hidden border border-slate-100"
          >
            <div className={`h-2 ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle size={24} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className={`flex-1 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg ${
                    isDanger 
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  } disabled:opacity-50`}
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      {confirmLabel || (type === 'delete' ? 'Delete' : 'Archive')}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-center pb-6 text-[10px] text-zinc-300 font-black uppercase tracking-widest">
              Las Solar Administrative Security Control
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
