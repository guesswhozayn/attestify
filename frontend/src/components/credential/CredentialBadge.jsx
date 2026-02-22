import { motion } from 'framer-motion';
import { Shield, Award, Calendar, ExternalLink, Cpu } from 'lucide-react';

const CredentialBadge = ({ credential, onClick, index = 0 }) => {
    const isSBT = !!credential.tokenId;

    const item = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        show: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { 
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: index * 0.1 
            }
        }
    };

    return (
        <motion.div
            variants={item}
            whileHover={{ 
                scale: 1.05, 
                rotateX: 5, 
                rotateY: 5,
                boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)" 
            }}
            onClick={onClick}
            className="relative group cursor-pointer perspective-1000"
        >
            <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:border-indigo-500/50 group-hover:bg-indigo-900/10 active:scale-95">
                
                {/* Holographic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Top Badge Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                {/* Verification Seal */}
                <div className="absolute top-3 right-3 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Shield className="w-4 h-4 fill-emerald-400/10" />
                </div>

                {/* Main Icon / Logo */}
                <div className="relative mb-4 mt-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(79,70,229,0.3)]">
                         {isSBT ? (
                             <Cpu className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                         ) : (
                             <Award className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                         )}
                    </div>
                    {/* Glow effect behind icon */}
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    {credential.courseName || credential.abbreviation || "Credential"}
                </h3>

                {/* Issuer */}
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 line-clamp-1">
                    {credential.university || credential.issuedBy?.name || "Unknown Issuer"}
                </p>

                {/* Footer Info */}
                <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(credential.issuanceDate).getFullYear()}
                    </span>
                    
                    {isSBT && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            SBT
                        </span>
                    )}
                </div>

                {/* Hover Action Indicator */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ExternalLink className="w-3 h-3 text-white/50" />
                </div>
            </div>
        </motion.div>
    );
};

export default CredentialBadge;
