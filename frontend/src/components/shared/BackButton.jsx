import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = ({ fallbackPath = '/', text = "Back to Home", force = false }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (!force && window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-8 left-8 z-50"
        >
            <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-inner shadow-2xl"
            >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                {text}
            </button>
        </motion.div>
    );
};

export default BackButton;
