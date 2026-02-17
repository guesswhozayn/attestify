import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  href,
  target,
  rel,
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,

  ...props 
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:bg-indigo-600/20 disabled:text-indigo-400/50',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md shadow-inner disabled:bg-white/5 disabled:text-gray-600 disabled:border-white/5',
    white: 'bg-white text-black hover:bg-gray-100 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-inner hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:bg-white/10 disabled:text-gray-500',
    premium: 'bg-indigo-500 text-white hover:bg-indigo-400 border border-indigo-400/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] shadow-inner hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:bg-indigo-500/20 disabled:text-indigo-300/30',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:bg-emerald-600/20 disabled:text-emerald-400/50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 disabled:opacity-20',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5 disabled:opacity-20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base md:text-lg',
    xl: 'px-10 py-5 text-xl font-black uppercase tracking-[0.2em]',
  };

  const variantStyles = variant && variants[variant] ? variants[variant] : '';
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a 
        href={href} 
        target={target} 
        rel={rel} 
        className={combinedClassName}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default React.memo(Button);
