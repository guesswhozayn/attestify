import React from 'react';

const Input = ({
  label,
  error,
  icon: Icon,
  rightAction,
  required = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-stone-600 uppercase tracking-wider ml-1">
          {label} {required && <span className="text-rose-500 text-[10px] align-top">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-0 inset-y-0 w-11 flex items-center justify-center pointer-events-none z-10">
            <Icon
              data-input-icon
              className="w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors duration-150"
            />
          </div>
        )}
        <input
          id={inputId}
          data-input-field
          className={`w-full bg-white text-stone-900 py-2.5 rounded-xl border border-[#E8E4DC] text-sm placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-2xs ${
            Icon ? 'pl-11' : 'pl-4'
          } ${rightAction ? 'pr-11' : 'pr-4'} ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        />
        {rightAction && (
          <div className="absolute right-0 inset-y-0 w-11 flex items-center justify-center z-10">
            {rightAction}
          </div>
        )}
      </div>
      {error && <p className="text-rose-600 text-xs mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
};

export default React.memo(Input);
