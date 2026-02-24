import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Building, Globe, Shield } from 'lucide-react';

const PILOT_MODULES = [
  {
    id: 'genesis',
    label: 'Genesis',
    title: 'Instant Network Integration',
    desc: 'We bridge the gap between traditional databases and Ethereum. Go live with tamper-proof issuance in under 72 hours.',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-indigo-400 to-indigo-600',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-40 h-40 bg-indigo-500/20 rounded-full animate-pulse blur-xl"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.2, 
                repeat: Infinity 
              }}
              className="w-3 h-3 bg-indigo-400 rounded-full"
            />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'prestige',
    label: 'Identity',
    title: 'Sovereign Digital Identity',
    desc: 'Protect your institutional legacy. Every credential is an immutable asset uniquely bound to your official signature.',
    icon: <Building className="w-5 h-5" />,
    color: 'from-purple-400 to-purple-600',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border-2 border-dashed border-purple-500/30 rounded-full flex items-center justify-center"
        >
          <Shield className="w-16 h-16 text-purple-400/50" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-purple-500/10 rounded-2xl backdrop-blur-md border border-white/10 rotate-12"></div>
        </div>
      </div>
    )
  },
  {
    id: 'scale',
    label: 'Scale',
    title: 'Industrial Scale Issuance',
    desc: 'Zero-latency batch processing for thousands of graduates. Our Layer 2 optimized engine handles the heavy lifting.',
    icon: <Globe className="w-5 h-5" />,
    color: 'from-emerald-400 to-emerald-600',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 100, opacity: [0, 1, 0] }}
            transition={{ 
              duration: 3, 
              delay: i * 0.6, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute h-8 w-24 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center px-2 space-x-2"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <div className="h-1 w-12 bg-white/10 rounded-full"></div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 'advantage',
    label: 'Advantage',
    title: 'The Pioneer Advantage',
    desc: 'Join as a pioneer partner and enjoy full platform access completely free for the first year, with priority support and feature requests.',
    icon: <Shield className="w-5 h-5" />,
    color: 'from-blue-400 to-blue-600',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="flex items-end space-x-2">
          {[40, 70, 50, 90, 60, 100].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ 
                duration: 1, 
                delay: i * 0.1, 
                type: "spring" 
              }}
              className="w-4 bg-linear-to-t from-blue-600 to-blue-400 rounded-t-sm"
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20"></div>
      </div>
    )
  }
];

const PilotIntegrationHub = () => {
  const [activeTab, setActiveTab] = useState(PILOT_MODULES[0].id);
  const activeModule = PILOT_MODULES.find(m => m.id === activeTab);

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
      {/* Stage: Centered Card */}
      <div className="w-full relative min-h-[400px] lg:min-h-[480px] rounded-3xl lg:rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-white/2 bg-size-[20px_20px]"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 p-8 lg:p-16 flex flex-col justify-between"
          >
            <div className="relative z-10 text-center lg:text-left">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 bg-linear-to-r ${activeModule.color} text-white shadow-lg`}>
                {activeModule.label}
              </span>
              <h3 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tighter">
                {activeModule.title}
              </h3>
              <p className="text-gray-400 text-base lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {activeModule.desc}
              </p>
            </div>

            <div className="relative flex-1 mt-6 lg:mt-0 flex items-center justify-center">
              <div className="w-full max-w-md h-full">
                {activeModule.visual}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-48 h-48 bg-linear-to-br ${activeModule.color} opacity-10 blur-[60px] transition-all duration-700`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr ${activeModule.color} opacity-5 blur-[60px] transition-all duration-700`}></div>
      </div>

      {/* Selectors: Compact Pills Below */}
      <div className="inline-flex bg-black/40 backdrop-blur-md rounded-2xl lg:rounded-full p-1.5 border border-white/10 shadow-xl overflow-x-auto no-scrollbar max-w-full">
        <div className="flex items-center gap-1 lg:gap-2">
          {PILOT_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveTab(module.id)}
              className={`relative px-4 lg:px-6 py-2.5 rounded-xl lg:rounded-full transition-all duration-300 group flex items-center gap-2.5 whitespace-nowrap ${
                activeTab === module.id ? 'active:scale-95' : 'hover:bg-white/5'
              }`}
            >
              {activeTab === module.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white shadow-[0_4px_15px_rgba(255,255,255,0.3)] rounded-xl lg:rounded-full"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className={`transition-colors duration-300 ${
                  activeTab === module.id ? 'text-black' : 'text-gray-500 group-hover:text-white'
                }`}>
                  {React.cloneElement(module.icon, { className: 'w-4 h-4' })}
                </div>
                <span className={`text-xs lg:text-sm font-bold transition-colors duration-300 ${
                  activeTab === module.id ? 'text-black' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {module.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PilotIntegrationHub;
