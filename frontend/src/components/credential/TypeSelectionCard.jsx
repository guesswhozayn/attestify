import React from 'react';
import { CheckCircle } from 'lucide-react';

const TypeSelectionCard = ({
    active,
    onClick,
    icon: Icon,
    title,
    description,
    variant = 'emerald'
}) => {
    const activeStyles = {
        emerald: 'bg-gradient-to-br from-emerald-900/50 via-teal-900/40 to-gray-900/50 border-emerald-500/50 shadow-emerald-500/10',
        indigo: 'bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-gray-900/50 border-indigo-500/50 shadow-indigo-500/10'
    };

    const iconBgStyles = {
        emerald: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 text-emerald-400 group-hover:bg-white/20',
        indigo: active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/10 text-indigo-400 group-hover:bg-white/20'
    };

    const glowStyles = {
        emerald: 'bg-emerald-500/20',
        indigo: 'bg-indigo-500/20'
    };

    const checkStyles = {
        emerald: 'bg-emerald-500/20 text-emerald-400',
        indigo: 'bg-indigo-500/20 text-indigo-400'
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex flex-col items-start p-5 rounded-3xl border transition-all duration-300 text-left group overflow-hidden active:scale-95 ${
                active ? activeStyles[variant] : 'bg-white/[0.03] border-white/10 hover:border-white/20'
            }`}
        >
            <div className="flex items-start justify-between mb-3 relative z-10 w-full">
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${iconBgStyles[variant]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {active && (
                    <div className={`p-1 rounded-full ${checkStyles[variant]}`}>
                        <CheckCircle className="w-5 h-5" />
                    </div>
                )}
            </div>

            <h4 className={`font-bold text-lg mb-1 relative z-10 transition-colors ${
                active ? 'text-white' : 'text-gray-300 group-hover:text-white'
            }`}>
                {title}
            </h4>
            <p className="text-xs text-gray-500 group-hover:text-gray-400 relative z-10 font-medium leading-relaxed">
                {description}
            </p>

            {active && (
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-2xl rounded-full ${glowStyles[variant]}`}></div>
            )}
        </button>
    );
};

export default React.memo(TypeSelectionCard);
