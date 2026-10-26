import React from 'react';
import { Loader2 } from 'lucide-react';

const roundedStyles = {
  'xl': 'rounded-xl',
  '2xl': 'rounded-2xl',
  'full': 'rounded-full',
  'none': 'rounded-none'
};

const variants = {
  primary: 'bg-stone-900 hover:bg-stone-800 text-white border border-stone-800 shadow-xs disabled:opacity-50',
  secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200 shadow-2xs disabled:opacity-50',
  white: 'bg-white text-stone-900 hover:bg-stone-50 border border-stone-200 font-semibold shadow-xs disabled:opacity-50',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-xs disabled:opacity-50',
  danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs disabled:opacity-50',
  outline: 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-2xs disabled:opacity-50',
  ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-40',
};

const filterConflictingStyles = (variantStyle, customClassName) => {
  if (!customClassName) return variantStyle;
  const classes = variantStyle.split(' ');
  const hasCustomBg = customClassName.includes('bg-');
  const hasCustomText = customClassName.includes('text-');
  const hasCustomBorder = customClassName.includes('border-');
  const hasCustomShadow = customClassName.includes('shadow-');

  return classes.filter(cls => {
    if (hasCustomBg && (cls.startsWith('bg-') || cls.startsWith('hover:bg-'))) return false;
    if (hasCustomText && (cls.startsWith('text-') || cls.startsWith('hover:text-'))) return false;
    if (hasCustomBorder && (cls.startsWith('border-') || cls === 'border' || cls.startsWith('hover:border-'))) return false;
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
