import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

/**
 * StatCard
 *
 * variant="default" (default) — the large dashboard stat card used in IssuerDashboard top row.
 * variant="mini"              — compact centred tile used for Today/Weekly/Revoked etc.
 */
const StatCard = ({ label, value, icon: Icon, subtext, gradient, iconBg, iconColor, delay = 0, variant = 'default' }) => {
    if (variant === 'mini') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay, ease: 'easeOut' }}
                className="bg-[#0c0c0c] p-5 rounded-[2rem] border border-white/[0.05] flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors"
            >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="text-2xl font-black text-white">{value}</span>
                {Icon && (
                    <div className={`mt-2 p-1.5 ${iconBg} rounded-lg`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
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
            className="group relative overflow-hidden bg-[#0c0c0c] p-7 rounded-[2.5rem] border border-white/[0.06] backdrop-blur-3xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none`} />

            {/* Decorative corner light */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] group-hover:bg-white/[0.05] transition-colors duration-700" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-8">
                    <div className={`p-3.5 ${iconBg} rounded-2xl border border-white/5 backdrop-blur-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-black/20`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {subtext && (
                        <div className="flex items-center text-[10px] text-gray-400 font-bold bg-white/[0.03] px-2.5 py-1.5 rounded-full border border-white/[0.05] group-hover:border-white/10 transition-colors">
                            <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-400" />
                            {subtext}
                        </div>
                    )}
                </div>

                <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</span>
                    <div className="text-4xl font-black text-white mt-1 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-500">
                        {value}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(StatCard);
