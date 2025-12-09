import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClass = "w-5 h-5";
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-emerald-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-amber-500`} />;
    case 'info':
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
  isDark: boolean;
}> = ({ toast, onRemove, isDark }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const duration = toast.duration || 4000;
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const bgColors = {
    success: isDark ? 'bg-emerald-900/90 border-emerald-700' : 'bg-emerald-50 border-emerald-200',
    error: isDark ? 'bg-red-900/90 border-red-700' : 'bg-red-50 border-red-200',
    warning: isDark ? 'bg-amber-900/90 border-amber-700' : 'bg-amber-50 border-amber-200',
    info: isDark ? 'bg-blue-900/90 border-blue-700' : 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: isDark ? 'text-emerald-100' : 'text-emerald-800',
    error: isDark ? 'text-red-100' : 'text-red-800',
    warning: isDark ? 'text-amber-100' : 'text-amber-800',
    info: isDark ? 'text-blue-100' : 'text-blue-800',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ${
        bgColors[toast.type]
      } ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      <ToastIcon type={toast.type} />
      <span className={`text-sm font-medium flex-1 ${textColors[toast.type]}`}>
        {toast.message}
      </span>
      <button
        onClick={handleClose}
        className={`p-1 rounded hover:bg-black/10 transition-colors ${textColors[toast.type]}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDark, setIsDark] = useState(true);

  // Check theme from localStorage
  useEffect(() => {
    const checkTheme = () => {
      const mode = localStorage.getItem('theme-mode');
      setIsDark(mode !== 'light');
    };
    checkTheme();
    window.addEventListener('storage', checkTheme);
    // Also listen for manual theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('storage', checkTheme);
      observer.disconnect();
    };
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
            isDark={isDark}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
