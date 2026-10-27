import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const getIconConfig = (isDark) => ({
  success: {
    icon: Check,
    bg: isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]',
    bar: isDark ? 'bg-emerald-400' : 'bg-[#25562C]'
  },
  error: {
    icon: AlertCircle,
    bg: isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' : 'bg-[#FDF0EE] border-[#F8D0CD] text-[#9E2D2D]',
    bar: isDark ? 'bg-rose-400' : 'bg-[#9E2D2D]'
  },
  warning: {
    icon: AlertTriangle,
    bg: isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' : 'bg-[#FEF7EC] border-[#FCE3B8] text-[#92540C]',
    bar: isDark ? 'bg-amber-400' : 'bg-[#92540C]'
  },
  info: {
    icon: Info,
    bg: isDark ? 'bg-stone-900 border-white/10 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-700',
    bar: isDark ? 'bg-stone-400' : 'bg-stone-800'
  },
});

const Notification = ({ id, message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, id, onClose]);

  const config = getIconConfig(isDark)[type] || getIconConfig(isDark).info;
  const Icon = config.icon;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`fixed top-5 right-5 z-[200] flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-300 ease-out transform ${
        isDark
          ? 'bg-[#121318] border-white/10 text-stone-100 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)]'
          : 'bg-white border-[#E8E4DC] text-stone-900 shadow-[0_16px_40px_-8px_rgba(28,25,23,0.14)]'
      } w-[calc(100vw-2.5rem)] sm:w-auto sm:max-w-md ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'
      }`}
      role="alert"
    >
      <div className={`p-2 rounded-xl border shrink-0 ${config.bg}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-[180px]">
        <p className={`font-semibold text-xs sm:text-sm leading-snug ${isDark ? 'text-white' : 'text-stone-900'}`}>{message}</p>
      </div>

      <button
        onClick={handleClose}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
          isDark
            ? 'text-stone-400 hover:text-white hover:bg-stone-800'
            : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
        }`}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div
        className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${config.bar} opacity-40 animate-shrink origin-left`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

export default React.memo(Notification);
