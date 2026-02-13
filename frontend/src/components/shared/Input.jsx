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
    <div className="space-y-1.5 font-rajdhani">
      {label && (
        <label className="block text-cyan-500/80 text-sm font-semibold tracking-wide uppercase">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within:text-cyan-400 group-focus-within:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all duration-300" />
        )}
        <input
          className={`
            w-full bg-slate-900/50 text-cyan-100 
            px-4 py-3 rounded-none border border-cyan-900/50 
            font-mono text-sm placeholder-cyan-900/50
            focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
            ${Icon ? 'pl-11' : ''} 
            ${error ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''} 
            ${className}
          `}
          {...props}
        />
        {/* Corner accent for tech feel */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/30 group-focus-within:border-cyan-400 transition-colors pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/30 group-focus-within:border-cyan-400 transition-colors pointer-events-none" />
      </div>
      {error && <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1 font-mono">{error}</p>}
    </div>
  );
};

export default Input;
