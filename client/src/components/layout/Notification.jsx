import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const iconConfig = {
  success: { icon: Check, bg: 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]', bar: 'bg-[#25562C]' },
  error: { icon: AlertCircle, bg: 'bg-[#FDF0EE] border-[#F8D0CD] text-[#9E2D2D]', bar: 'bg-[#9E2D2D]' },
  warning: { icon: AlertTriangle, bg: 'bg-[#FEF7EC] border-[#FCE3B8] text-[#92540C]', bar: 'bg-[#92540C]' },
  info: { icon: Info, bg: 'bg-stone-100 border-stone-200 text-stone-700', bar: 'bg-stone-800' },
};

const Notification = ({ id, message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  const config = iconConfig[type] || iconConfig.info;
  const Icon = config.icon;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`fixed top-5 right-5 z-[200] flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl bg-white border border-[#E8E4DC] text-stone-900 shadow-[0_16px_40px_-8px_rgba(28,25,23,0.14)] w-[calc(100vw-2.5rem)] sm:w-auto sm:max-w-md transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'
      }`}
      role="alert"
    >
      <div className={`p-2 rounded-xl border shrink-0 ${config.bg}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-[180px]">
        <p className="font-semibold text-xs sm:text-sm text-stone-900 leading-snug">{message}</p>
      </div>

      <button
        onClick={handleClose}
        className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
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
