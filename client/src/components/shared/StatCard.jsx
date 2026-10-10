import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Info } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, subtext, delay = 0, variant = 'default', trend = null }) => {
    if (variant === 'mini') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay, ease: 'easeOut' }}
                className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col items-center justify-center text-center group hover:border-stone-300 transition-all duration-200"
            >
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="text-2xl font-bold text-stone-900 font-mono tracking-tight">{value}</span>
                {Icon && (
                    <div className="mt-2.5 w-7 h-7 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            className="group relative bg-white p-6 rounded-2xl border border-[#EAECF0] hover:border-stone-300 transition-all duration-200 shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <span className="text-xs font-semibold text-stone-600 tracking-tight">{label}</span>
                </div>
                <div className="text-stone-300 group-hover:text-stone-400 transition-colors">
                    <Info className="w-4 h-4" />
                </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
                <div className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {subtext && (
                    <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                        <span>{subtext}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(StatCard);

