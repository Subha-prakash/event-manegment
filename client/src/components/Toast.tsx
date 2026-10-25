import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-slate-900 text-white';
        let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-950/95 text-emerald-100 border border-emerald-500/30';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950/95 text-rose-100 border border-rose-500/30';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else {
          bg = 'bg-slate-900/95 text-slate-100 border border-indigo-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${bg}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
