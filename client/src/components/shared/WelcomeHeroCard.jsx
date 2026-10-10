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
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--card-mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--card-mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-white border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.03),0_10px_30px_-6px_rgba(28,25,23,0.04)] p-7 sm:p-9 md:p-11 group ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(600px circle at var(--card-mouse-x, 0px) var(--card-mouse-y, 0px), rgba(245, 238, 226, 0.6), transparent 80%)',
        }}
      />

      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-amber-100/25 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-amber-100/40 transition-colors duration-700" />

      {/* Subtle fine paper texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

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
