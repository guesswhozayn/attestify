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
        <label className="block text-gray-400 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        )}
        <input
          className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            Icon ? 'pl-12' : ''
          } ${error ? 'ring-2 ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
