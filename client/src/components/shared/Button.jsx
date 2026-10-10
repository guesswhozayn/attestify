import React from 'react';
import { Loader2 } from 'lucide-react';

const roundedStyles = {
  'xl': 'rounded-xl',
  '2xl': 'rounded-2xl',
  'full': 'rounded-full',
  'none': 'rounded-none'
};

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/25 shadow-md shadow-indigo-950/60 hover:shadow-indigo-900/40 disabled:opacity-50',
  secondary: 'bg-white/[0.06] text-zinc-200 hover:text-white hover:bg-white/[0.1] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-50',
  white: 'bg-white text-zinc-950 hover:bg-zinc-100 font-semibold border border-white/20 shadow-sm disabled:opacity-50',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/25 shadow-md shadow-emerald-950/60 hover:shadow-emerald-900/40 disabled:opacity-50',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 disabled:opacity-30',
  outline: 'bg-transparent text-zinc-300 hover:text-white border border-white/15 hover:border-white/25 hover:bg-white/[0.04] disabled:opacity-30',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs font-medium',
  md: 'px-5 py-2.5 text-sm font-medium',
  lg: 'px-7 py-3 text-sm md:text-base font-semibold',
  xl: 'px-9 py-4 text-base md:text-lg font-bold',
};

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
  const baseStyles = 'tracking-normal transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090d] disabled:cursor-not-allowed group overflow-hidden relative select-none';
  const variantStyles = variants[variant] || '';
  const roundedClassName = roundedStyles[rounded] || roundedStyles['2xl'];
  const combinedClassName = `${baseStyles} ${variantStyles} ${sizes[size] || sizes.md} ${roundedClassName} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={combinedClassName} {...props}>
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClassName}`} />}
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
        <Loader2 className={`w-4 h-4 animate-spin shrink-0 relative z-10 ${iconClassName}`} />
      ) : Icon ? (
        <Icon className={`w-4 h-4 shrink-0 relative z-10 ${iconClassName}`} />
      ) : null}
      {children && (noWrapper ? children : <span className="relative z-10 flex flex-row items-center gap-2">{children}</span>)}
    </button>
  );
};

export default React.memo(Button);
