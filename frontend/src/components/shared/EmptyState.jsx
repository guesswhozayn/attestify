import { motion } from 'framer-motion';

/**
 * EmptyState
 * A full-width dashed card shown when a list or data set is empty.
 *
 * Props:
 *   icon      {React.ComponentType}  Lucide icon component.
 *   title     {string}               Bold heading.
 *   message   {string}               Descriptive sub-text.
 *   children  {React.ReactNode}      Optional CTA button(s).
 */
const EmptyState = ({ icon: Icon, title, message, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="flex flex-col items-center justify-center py-24 px-8 bg-[#0a0a0a] border border-white/[0.06] border-dashed rounded-[2.5rem] text-center backdrop-blur-3xl group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />

    <div className="w-24 h-24 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
      <Icon className="w-10 h-10 text-gray-500 group-hover:text-indigo-400 transition-colors" />
    </div>

    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight relative z-10">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-lg font-medium relative z-10 mb-8">
      {message}
    </p>

    {children && <div className="relative z-10">{children}</div>}

    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mb-32 pointer-events-none transition-colors group-hover:bg-indigo-500/10" />
  </motion.div>
);

export default EmptyState;
