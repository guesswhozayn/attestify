import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import BrandLogo from '../components/shared/BrandLogo';
import ShieldLogo from '../components/shared/ShieldLogo';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative z-10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
                <ShieldLogo size="md" />
                <BrandLogo textSize="text-2xl" />
            </Link>
        </div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-12 h-12 text-red-400" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Your checkout process was cancelled. You are currently on the free Starter plan. You can upgrade at any time.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/dashboard')} variant="white" size="lg" className="w-full">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Dashboard
          </Button>
          <Button onClick={() => navigate('/pricing')} variant="ghost" size="lg" className="w-full">
            View Pricing Limits
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
