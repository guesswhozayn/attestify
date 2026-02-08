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
    <div className="space-y-1.5">
      {label && (
        <label className="block text-gray-400 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
        )}
        <input
          className={`w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-600 ${
            Icon ? 'pl-11' : ''
          } ${error ? 'ring-2 ring-red-500 border-transparent' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1">{error}</p>}
    </div>
  );
};

export default Input;
