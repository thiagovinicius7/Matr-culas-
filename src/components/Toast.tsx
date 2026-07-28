import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-900/95 text-emerald-50 border-emerald-600/80',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-emerald-800/60 text-emerald-300'
        };
      case 'error':
        return {
          bg: 'bg-rose-900/95 text-rose-50 border-rose-600/80',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-rose-800/60 text-rose-300'
        };
      case 'warning':
        return {
          bg: 'bg-amber-900/95 text-amber-50 border-amber-600/80',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-amber-800/60 text-amber-300'
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 text-slate-50 border-slate-600/80',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
          badgeBg: 'bg-slate-800/60 text-sky-300'
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 ${style.bg}`}
    >
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="text-xs text-slate-200 leading-snug font-normal">
              {toast.description}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
        title="Fechar notificação"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};
