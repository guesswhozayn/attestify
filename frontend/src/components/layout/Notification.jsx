import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger entry animation
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger exit animation
      setTimeout(onClose, 300); // Wait for animation to finish before unmounting
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-500/10 border-red-500/50 text-red-200',
    warning: 'bg-amber-500/10 border-amber-500/50 text-amber-200',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-200',
  };

  const iconStyles = {
     success: 'text-emerald-400 bg-emerald-500/20',
     error: 'text-red-400 bg-red-500/20',
     warning: 'text-amber-400 bg-amber-500/20',
     info: 'text-blue-400 bg-blue-500/20',
  };

  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 
        flex items-start space-x-3 
        p-4 rounded-xl border backdrop-blur-md shadow-2xl 
        max-w-md w-full md:w-auto transition-all duration-300 ease-in-out transform
        ${styles[type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${iconStyles[type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 pt-1 min-w-[200px]">
        <p className="font-medium text-sm leading-relaxed">
          {message}
        </p>
      </div>

      <button 
        onClick={() => {
           setIsVisible(false);
           setTimeout(onClose, 300);
        }} 
        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar (Optional, for visual duration indication) */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 w-full animate-shrink origin-left" style={{ animationDuration: `${duration}ms` }}></div>
    </div>
  );
};

export default Notification;
