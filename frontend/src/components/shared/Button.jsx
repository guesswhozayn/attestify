import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  href,
  target,
  rel,
  variant = 'white', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconClassName = '',
  rounded = '2xl', 
  noWrapper = false,

  ...props 
}) => {
  const baseStyles = 'tracking-wide transition-all duration-300 flex flex-row items-center justify-center gap-2.5 active:scale-95 disabled:cursor-not-allowed group overflow-hidden relative';
  
  const roundedStyles = {
    '2xl': 'rounded-2xl',
    'full': 'rounded-full',
    'none': 'rounded-none'
  };
  
  const variants = {
    primary: 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white border border-indigo-400/20 hover:from-indigo-500 hover:to-violet-600 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 backdrop-blur-sm disabled:opacity-50',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md shadow-inner disabled:opacity-50',
    white: 'bg-white text-black hover:bg-gray-100 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-inner hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:opacity-50',
    success: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border border-emerald-400/20 hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 backdrop-blur-sm disabled:opacity-50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 disabled:opacity-20',
    outline: 'bg-white/5 text-white border border-white/10 backdrop-blur-md hover:bg-white/10 disabled:opacity-20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs font-medium',
    md: 'px-6 py-2.5 text-sm font-medium',
    lg: 'px-8 py-3.5 text-base md:text-lg font-black',
    xl: 'px-10 py-5 text-xl font-black tracking-widest',
  };

  const variantStyles = variant && variants[variant] ? variants[variant] : '';
  const roundedClassName = roundedStyles[rounded] || roundedStyles['2xl'];
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizes[size]} ${roundedClassName} ${className}`;

  if (href) {
    return (
      <a 
        href={href} 
        target={target} 
        rel={rel} 
        className={combinedClassName}
        {...props}
      >
        {Icon && <Icon className={`w-4 h-4 ${iconClassName}`} />}
        {children && <span>{children}</span>}
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
        <Loader2 className={`w-5 h-5 animate-spin relative z-10 ${iconClassName}`} />
      ) : Icon ? (
        <Icon className={`w-4 h-4 relative z-10 ${iconClassName}`} />
      ) : null}
      {children && (
        noWrapper ? (
          children
        ) : (
          <span className="relative z-10 flex flex-row items-center gap-2">{children}</span>
        )
      )}
      
      {/* Premium Shimmer Effect */}
      {(variant === 'success' || variant === 'primary') && !disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      )}
    </button>
  );
};

export default React.memo(Button);
