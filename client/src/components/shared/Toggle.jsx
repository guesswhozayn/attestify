import React from 'react';

const Toggle = ({
    enabled,
    onChange,
    disabled = false,
    label = '',
    className = ''
}) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`group relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-black ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${
                enabled
                    ? 'bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-800 border border-white/10 hover:border-white/20'
            } ${className}`}
            role="switch"
            aria-checked={enabled}
        >
            <span className="sr-only">{label || 'Toggle setting'}</span>
            <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out pointer-events-none ${
                    enabled ? 'translate-x-9' : 'translate-x-1'
                }`}
            />
        </button>
    );
};

export default React.memo(Toggle);
