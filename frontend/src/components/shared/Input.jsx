const Input = ({
  label,
  error,
  icon: Icon,
  rightAction,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider">
          {label} {required && <span className="text-red-500/70 text-[10px] align-top">*</span>}
        </label>
      )}
      <div className="relative group overflow-hidden">
        {Icon && (
          <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center pointer-events-none z-10">
            <Icon className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
          </div>
        )}
        <input
          className={`
            w-full bg-black/40 text-gray-100
            py-3.5 rounded-xl border border-white/10
            text-sm placeholder-gray-600
            focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-black/60
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 backdrop-blur-md
            ${Icon ? 'pl-12' : 'pl-5'}
            ${rightAction ? 'pr-12' : 'pr-5'}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {rightAction && (
          <div className="absolute right-0 inset-y-0 w-12 flex items-center justify-center z-10">
            {rightAction}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1 ml-4">{error}</p>}
    </div>
  );
};

export default Input;
