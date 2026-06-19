import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import RefreshButton from './RefreshButton';

const WelcomeHeroCard = ({
  badge,
  title,
  subtitle,
  avatar,
  onRefresh,
  refreshing = false,
  className = '',
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/8 shadow-none p-8 md:p-12 backdrop-blur-3xl group ${className}`}
    >

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`,
        }}
      />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700" />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <StatusBadge label={badge} className="cursor-default" />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none flex flex-col items-center md:flex-row md:items-center gap-4 md:gap-6"
          >
            {avatar && (
              <div className="shrink-0 rounded-full p-1.5 bg-linear-to-tr from-indigo-500 to-purple-500 shadow-2xl">
                {avatar}
              </div>
            )}
            <span className="drop-shadow-2xl">{title}</span>
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="text-gray-400 max-w-xl text-lg leading-relaxed"
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
            <RefreshButton onClick={onRefresh} loading={refreshing} title="Refresh Dashboard" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

WelcomeHeroCard.displayName = 'WelcomeHeroCard';
export default React.memo(WelcomeHeroCard);
