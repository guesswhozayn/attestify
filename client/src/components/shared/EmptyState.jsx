import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, message, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="flex flex-col items-center justify-center py-16 px-8 bg-white border border-[#EAECF0] border-dashed rounded-2xl text-center shadow-[0_1px_3px_rgba(16,24,40,0.02)] group relative overflow-hidden"
  >
    <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mb-4 border border-stone-200/80 group-hover:scale-105 transition-all duration-200 relative z-10 text-stone-600 group-hover:text-stone-900 shadow-2xs">
      <Icon className="w-6 h-6" />
    </div>

    <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1.5 tracking-tight relative z-10">{title}</h3>
    <p className="text-stone-500 max-w-md mx-auto leading-relaxed text-xs relative z-10 mb-5 font-medium">
      {message}
    </p>

    {children && <div className="relative z-10">{children}</div>}
  </motion.div>
);

export default EmptyState;

