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
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition flex items-center justify-center space-x-2';
  
  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50',
    secondary: 'bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white disabled:opacity-50',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
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
