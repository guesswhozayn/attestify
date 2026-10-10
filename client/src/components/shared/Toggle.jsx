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
            className={`group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400/40 focus:ring-offset-2 focus:ring-offset-white ${
                disabled ? 'opacity-40 cursor-not-allowed' : ''
            } ${
                enabled
                    ? 'bg-stone-900'
                    : 'bg-stone-200 border border-stone-300'
            } ${className}`}
            role="switch"
            aria-checked={enabled}
        >
            <span className="sr-only">{label || 'Toggle setting'}</span>
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out pointer-events-none ${
                    enabled ? 'translate-x-8' : 'translate-x-1'
                }`}
            />
        </button>
    );
};

export default React.memo(Toggle);
