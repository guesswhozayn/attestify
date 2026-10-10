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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
      isVisible ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-none pointer-events-none'
    }`}>
      <div data-modal-backdrop className="absolute inset-0 bg-black/75 transition-opacity duration-300" onClick={onClose} />
      <div data-modal-panel className={`bg-[#0e1017] border border-white/[0.08] rounded-2xl w-full max-h-[90vh] flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_25px_60px_-15px_rgba(0,0,0,0.85)] transform transition-all duration-300 ${sizes[size] || sizes.md} ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div data-modal-header className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07] shrink-0">
          <h2 data-modal-title className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            rounded="full"
            className="!p-2 text-zinc-400 hover:text-white group"
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
