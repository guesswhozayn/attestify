import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  glow = false,
  ...props 
}) => {
  const baseStyles = 'font-bold rounded-full transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95';
  
  const variants = {
    primary: `bg-white text-black hover:bg-gray-200 border-0 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)] disabled:opacity-50 disabled:shadow-none`,
    secondary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 disabled:opacity-50',
    outline: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md disabled:opacity-50',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base md:text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
