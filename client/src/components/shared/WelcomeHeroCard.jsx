import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Button from './Button';

const WelcomeHeroCard = ({
  badge,
  title,
  subtitle,
  avatar,
  onRefresh,
  refreshing = false,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-white border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.03),0_10px_30px_-6px_rgba(28,25,23,0.04)] p-7 sm:p-9 md:p-11 ${className}`}
    >

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="space-y-4 md:space-y-5 flex flex-col items-center md:items-start text-center md:text-left">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  {badge}
                </span>
              </div>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight flex flex-col items-center md:flex-row md:items-center gap-4 md:gap-5"
          >
            {avatar && (
              <div className="shrink-0 rounded-2xl p-1 bg-stone-100 border border-stone-200/80 shadow-2xs">
                {avatar}
              </div>
            )}
            <span>{title}</span>
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="text-stone-600 max-w-xl text-base md:text-lg leading-relaxed font-normal"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {onRefresh && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center md:justify-end"
          >
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh dashboard"
              className="w-10 h-10 aspect-square rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 shadow-2xs flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-stone-900' : 'text-stone-600'}`} />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

WelcomeHeroCard.displayName = 'WelcomeHeroCard';
export default React.memo(WelcomeHeroCard);
