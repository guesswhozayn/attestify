import React from 'react';

const Input = ({ 
  label, 
  error, 
  icon: Icon,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 tracking-wide">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
        )}
        <input
          className={`
            w-full bg-white/[0.04] text-gray-100 
            px-4 py-3 rounded-xl border border-white/10 
            text-sm placeholder-gray-600
            focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.06]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 backdrop-blur-md
            ${Icon ? 'pl-11' : ''} 
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} 
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
