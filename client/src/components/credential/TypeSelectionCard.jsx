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
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group overflow-hidden active:scale-[0.98] cursor-pointer ${
                active
                    ? 'bg-white border-stone-900 shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E8E4DC] hover:border-stone-400'
            }`}
        >
            <div className="flex items-start justify-between mb-3 relative z-10 w-full">
                <div className={`p-2.5 rounded-xl transition-colors duration-200 ${
                    active ? 'bg-stone-900 text-white' : 'bg-white border border-[#E8E4DC] text-stone-700 group-hover:border-stone-400'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>
                {active && (
                    <div className="p-1 rounded-full text-stone-900">
                        <CheckCircle className="w-5 h-5 fill-stone-900 text-white" />
                    </div>
                )}
            </div>

            <h4 className="font-bold text-base mb-1 relative z-10 text-stone-900">
                {title}
            </h4>
            <p className="text-xs text-stone-500 relative z-10 font-normal leading-relaxed">
                {description}
            </p>
        </button>
    );
};

export default React.memo(TypeSelectionCard);
