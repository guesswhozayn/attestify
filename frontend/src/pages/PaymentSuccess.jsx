import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import BrandLogo from '../components/shared/BrandLogo';
import ShieldLogo from '../components/shared/ShieldLogo';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

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
          className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Welcome to the Pro plan. Your limits have been expanded and priority processing is active.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/dashboard')} variant="white" size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

import { Link } from 'react-router-dom';
export default PaymentSuccess;
