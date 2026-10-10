import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, message, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex flex-col items-center justify-center py-16 px-8 bg-white border border-[#E8E4DC] border-dashed rounded-3xl text-center shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)] group relative overflow-hidden"
  >
    <div className="w-14 h-14 bg-[#FAF8F5] rounded-2xl flex items-center justify-center mb-5 border border-[#E8E4DC] group-hover:scale-105 transition-all duration-300 relative z-10 text-stone-600 group-hover:text-stone-900">
      <Icon className="w-7 h-7" />
    </div>

    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2 tracking-tight relative z-10">{title}</h3>
    <p className="text-stone-500 max-w-md mx-auto leading-relaxed text-sm relative z-10 mb-6 font-normal">
      {message}
    </p>

    {children && <div className="relative z-10">{children}</div>}
  </motion.div>
);

export default EmptyState;
