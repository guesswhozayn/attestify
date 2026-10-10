import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, subtext, gradient, iconBg, iconColor, delay = 0, variant = 'default' }) => {
    if (variant === 'mini') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay, ease: 'easeOut' }}
                className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col items-center justify-center text-center group hover:border-stone-300 transition-all duration-200"
            >
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="text-2xl font-bold text-stone-900 tabular-nums tracking-tight">{value}</span>
                {Icon && (
                    <div className="mt-2.5 p-1.5 bg-stone-100 rounded-lg border border-stone-200/60">
                        <Icon className="w-4 h-4 text-stone-700" />
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
            className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-[#E8E4DC] hover:border-stone-300 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_1px_3px_rgba(28,25,23,0.03),0_8px_20px_-4px_rgba(28,25,23,0.04)]"
        >
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200/80 text-stone-800 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                        {Icon && <Icon className="w-5 h-5 text-stone-800" />}
                    </div>
                    {subtext && (
                        <div className="flex items-center text-[10px] text-stone-600 font-semibold bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200/80">
                            <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-600" />
                            {subtext}
                        </div>
                    )}
                </div>

                <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.18em]">{label}</span>
                    <div className="text-3xl sm:text-4xl font-bold text-stone-900 mt-1 tracking-tight tabular-nums">
                        {value}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(StatCard);
