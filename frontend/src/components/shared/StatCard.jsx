import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, subtext, gradient, iconBg, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
        className="group relative overflow-hidden bg-gray-900/40 p-6 rounded-3xl border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                     <div className="text-4xl font-bold text-white mt-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">{value}</div>
                </div>
                <div className={`p-3.5 ${iconBg} rounded-2xl border border-white/5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            
            {subtext && (
                <div className="flex items-center text-xs text-gray-400 font-medium bg-white/5 w-fit px-2 py-1 rounded-lg border border-white/5">
                    <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-400" />
                    {subtext}
                </div>
            )}
        </div>
    </motion.div>
);

export default StatCard;
