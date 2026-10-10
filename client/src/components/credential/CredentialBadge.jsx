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
                scale: 1.02,
                y: -2
            }}
            onClick={onClick}
            className="relative group cursor-pointer"
        >
            <div className="relative overflow-hidden bg-white border border-[#E8E4DC] rounded-3xl p-6 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:border-stone-400 group-hover:shadow-[0_8px_24px_-6px_rgba(28,25,23,0.06)] shadow-[0_1px_3px_rgba(28,25,23,0.02)] active:scale-[0.98]">

                <div className="absolute top-3 right-3 text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Shield className="w-4 h-4 fill-emerald-500/10" />
                </div>

                <div className="relative mb-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-2xs">
                         {isSBT ? (
                             <Cpu className="w-7 h-7 text-stone-800" />
                         ) : (
                             <Award className="w-7 h-7 text-stone-800" />
                         )}
                    </div>
                </div>

                <h3 className="text-stone-900 font-bold text-base leading-snug mb-1 line-clamp-2 group-hover:text-stone-700 transition-colors">
                    {credential.courseName || credential.abbreviation || "Credential"}
                </h3>

                <p className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-4 line-clamp-1">
                    {credential.university || credential.issuedBy?.name || "Unknown institution"}
                </p>

                <div className="mt-auto w-full pt-4 border-t border-[#ECE7DE] flex items-center justify-between text-xs text-stone-500 font-mono">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(credential.issuanceDate).getFullYear()}
                    </span>

                    {isSBT && (
                        <span className="text-[11px] font-semibold text-stone-600">
                            Permanent
                        </span>
                    )}
                </div>

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </div>
            </div>
        </motion.div>
    );
};

export default CredentialBadge;
