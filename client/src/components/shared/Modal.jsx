import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-7xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(isOpen);

  if (isOpen && !mounted) {
    setMounted(true);
  }

  if (!isOpen && isVisible) {
    setIsVisible(false);
  }

  useEffect(() => {
    let timer;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      timer = setTimeout(() => setIsVisible(true), 20);
    } else if (mounted) {
      timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = 'unset';
      }, 300);
    }
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mounted]);

  if (!mounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
    }`}>
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" onClick={onClose} />
      <div className={`bg-gray-900 border border-white/10 rounded-3xl w-full max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 ${sizes[size] || sizes.md} ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            rounded="full"
            className="!p-2 text-gray-400 hover:text-white group"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Modal);
