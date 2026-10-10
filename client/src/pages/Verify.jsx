import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../components/shared/BackButton';
import VerificationPortal from '../components/verification/VerificationPortal';

const VerifyPage = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090d] text-white selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-hidden">
      <BackButton />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/[0.08] rounded-full blur-[150px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[120px] mix-blend-screen opacity-40" />
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent z-10"
        />
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.05), transparent 80%)',
          }}
        />
      </div>

      <main className="flex-grow relative z-[1] flex flex-col justify-center min-h-screen">
        <VerificationPortal />
      </main>
    </div>
  );
};

export default VerifyPage;
