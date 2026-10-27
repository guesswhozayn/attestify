import React from 'react';
import { Loader2 } from 'lucide-react';

const roundedStyles = {
  'xl': 'rounded-xl',
  '2xl': 'rounded-2xl',
  'full': 'rounded-full',
  'none': 'rounded-none'
};

const variants = {
  primary: 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900 border border-stone-900 dark:border-white/20 shadow-xs disabled:opacity-50',
  secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-stone-200 dark:border-white/15 backdrop-blur-md shadow-xs disabled:opacity-40',
  white: 'bg-white text-stone-900 hover:bg-stone-100 border border-stone-200 dark:border-white/20 font-semibold shadow-xs disabled:opacity-50',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-xs disabled:opacity-50',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 shadow-2xs disabled:opacity-50',
  outline: 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300 dark:bg-transparent dark:hover:bg-white/5 dark:text-stone-200 dark:hover:text-white dark:border-white/20 shadow-2xs disabled:opacity-40',
  ghost: 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-40',
};

const filterConflictingStyles = (variantStyle, customClassName) => {
  if (!customClassName) return variantStyle;
  const classes = variantStyle.split(' ');
  const hasCustomBg = customClassName.includes('bg-');
  const hasCustomText = customClassName.includes('text-');
  const hasCustomBorder = customClassName.includes('border-');
  const hasCustomShadow = customClassName.includes('shadow-');

  return classes.filter(cls => {
    if (hasCustomBg && (cls.startsWith('bg-') || cls.startsWith('hover:bg-') || cls.startsWith('dark:bg-') || cls.startsWith('dark:hover:bg-'))) return false;
    if (hasCustomText && (cls.startsWith('text-') || cls.startsWith('hover:text-') || cls.startsWith('dark:text-') || cls.startsWith('dark:hover:text-'))) return false;
    if (hasCustomBorder && (cls.startsWith('border-') || cls === 'border' || cls.startsWith('hover:border-') || cls.startsWith('dark:border-') || cls.startsWith('dark:hover:border-'))) return false;
    if (hasCustomShadow && (cls.startsWith('shadow-') || cls.startsWith('hover:shadow-'))) return false;
    return true;
  }).join(' ');
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
  rounded = 'xl',
  noWrapper = false,
  ...props
}) => {
  const baseStyles = 'tracking-normal transition-all duration-200 flex flex-row items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed group overflow-hidden relative select-none cursor-pointer';
  const cleanVariantStyles = filterConflictingStyles(variants[variant] || '', className);
  const roundedClassName = roundedStyles[rounded] || roundedStyles['xl'];
  const combinedClassName = `${baseStyles} ${cleanVariantStyles} ${sizes[size] || sizes.md} ${roundedClassName} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        data-button-variant={variant}
        className={combinedClassName}
        {...props}
      >
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClassName}`} />}
        {children && <span>{children}</span>}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-button-variant={variant}
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
