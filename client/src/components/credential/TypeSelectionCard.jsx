import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TypeSelectionCard = ({
    active,
    onClick,
    icon: Icon,
    title,
    description,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={onClick}
            data-type-card-active={active ? "true" : "false"}
            className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group overflow-hidden active:scale-[0.98] cursor-pointer ${
                active
                    ? isDark
                        ? 'bg-white/[0.06] border-white shadow-sm'
                        : 'bg-white border-stone-900 shadow-sm'
                    : isDark
                        ? 'bg-stone-900/40 border-white/[0.08] hover:border-white/20'
                        : 'bg-[#FAF8F5] border-[#E8E4DC] hover:border-stone-400'
            }`}
        >
            <div className="flex items-start justify-between mb-3 relative z-10 w-full">
                <div className={`p-2.5 rounded-xl transition-colors duration-200 ${
                    active
                        ? isDark ? 'bg-white text-stone-950' : 'bg-stone-900 text-white'
                        : isDark ? 'bg-[#181920] border border-white/[0.08] text-stone-300' : 'bg-white border border-[#E8E4DC] text-stone-700 group-hover:border-stone-400'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>
                {active && (
                    <div className={`p-1 rounded-full ${isDark ? 'text-white' : 'text-stone-900'}`}>
                        <CheckCircle className={`w-5 h-5 ${isDark ? 'fill-white text-stone-950' : 'fill-stone-900 text-white'}`} />
                    </div>
                )}
            </div>

            <h4 className={`font-bold text-base mb-1 relative z-10 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                {title}
            </h4>
            <p className={`text-xs relative z-10 font-normal leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                {description}
            </p>
        </button>
    );
};

export default React.memo(TypeSelectionCard);
