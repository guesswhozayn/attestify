import React from 'react';
import { 
    ShieldAlert, 
    ExternalLink, 
    FileText, 
    Award,
    Calendar,
    User,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../shared/Button';

const CredentialTableRow = ({ cred, idx, onView, onRevoke }) => {
    const isRevoked = cred.isRevoked;
    const isSBT = !!cred.tokenId;
    const isTranscript = cred.type === 'TRANSCRIPT';
    const Icon = isTranscript ? FileText : Award;
    const accentColor = isTranscript ? 'indigo' : 'emerald';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            onClick={() => onView(cred)}
            className="group relative bg-[#0b0b0b] border border-white/[0.04] hover:border-white/10 rounded-[2rem] p-5 lg:p-6 transition-all duration-500 cursor-pointer overflow-hidden mb-4 active:scale-[0.99] shadow-lg hover:shadow-2xl"
        >
            {/* Background Accent */}
            <div className={`absolute -right-24 -top-24 w-80 h-80 bg-${accentColor}-500/[0.03] blur-[120px] pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity`}></div>

            {/* Desktop Row Layout (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:flex-row lg:items-center gap-8 relative z-10">
                {/* Section 1: Credential Identification */}
                <div className="lg:w-[35%] flex items-center gap-5">
                    <div className={`p-4 rounded-[1.5rem] bg-${accentColor}-500/10 border border-${accentColor}-500/20 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500`}>
                        <Icon className={`w-8 h-8 text-${accentColor}-400`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Subject Title</span>
                        <h3 className="text-lg font-black text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">
                            {cred.transcriptData?.program || cred.certificationData?.title || cred.courseName || cred.degreeName || 'Untitled Record'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                             <div className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-zinc-500">
                                {cred._id ? `#${cred._id.substring(cred._id.length - 8)}` : 'ID-SYSTEM'}
                             </div>
                             {isSBT ? (
                                <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold">SBT</span>
                             ) : (
                                <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">Standard NFT</span>
                             )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Recipient Data */}
                <div className="lg:w-[25%] flex items-center gap-4 border-l lg:border-white/5 lg:pl-8">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:border-indigo-500/20 transition-colors">
                        {cred.studentImage ? (
                            <img src={cred.studentImage} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-zinc-700" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Authenticated Recipient</span>
                        <span className="text-sm font-bold text-zinc-200 truncate">{cred.studentName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-tighter mt-0.5">
                            {cred.studentWalletAddress ? `${cred.studentWalletAddress.substring(0, 10)}...${cred.studentWalletAddress.substring(34)}` : 'ANONYMOUS-WALLET'}
                        </span>
                    </div>
                </div>

                {/* Section 3: Ledger Data */}
                <div className="lg:w-[20%] flex flex-col items-center justify-center border-l lg:border-white/5 lg:pl-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1.5">Registry Entry</span>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(cred.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Section 4: Status & Controls */}
                <div className="lg:w-[20%] flex items-center justify-end gap-6 lg:pl-8 border-l lg:border-white/5">
                    <div className={`px-4 py-2 rounded-xl text-[11px] font-bold border flex items-center gap-2.5 shadow-inner backdrop-blur-md
                        ${isRevoked 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}
                    `}>
                        <div className={`w-2 h-2 rounded-full ${isRevoked ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse'}`}></div>
                        {isRevoked ? 'Revoked' : 'Active'}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                        {cred.transactionHash && (
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-3 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all border border-transparent hover:border-indigo-500/20 active:scale-90"
                                title="Ledger Explorer"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}

                        {!cred.isRevoked && (
                            <Button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRevoke(cred);
                                }}
                                variant="ghost"
                                rounded="2xl"
                                className="!p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/20"
                                title="Invalidate Record"
                            >
                                <ShieldAlert className="w-5 h-5" />
                            </Button>
                        )}
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Stacked Card Layout (< lg) */}
            <div className="flex flex-col lg:hidden relative z-10 space-y-4">
                
                {/* Mobile Header: Icon, Title, Status */}
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.04] pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 shrink-0`}>
                            <Icon className={`w-5 h-5 text-${accentColor}-400`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Subject Title</span>
                            <h3 className="text-base font-black text-white truncate leading-tight mt-0.5">
                                {cred.transcriptData?.program || cred.certificationData?.title || cred.courseName || cred.degreeName || 'Untitled Record'}
                            </h3>
                        </div>
                    </div>
                    {/* Compact Status Pill */}
                    <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-2 shrink-0
                        ${isRevoked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}
                    `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isRevoked ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                        {isRevoked ? 'Invalid' : 'Active'}
                    </div>
                </div>

                {/* Mobile Identity Block */}
                <div className="flex items-center justify-between bg-white/[0.01] rounded-xl border border-white/[0.02] p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                            {cred.studentImage ? (
                                <img src={cred.studentImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-zinc-500" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-zinc-200 truncate">{cred.studentName}</span>
                            <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">
                                {cred.studentWalletAddress ? `${cred.studentWalletAddress.substring(0, 8)}...${cred.studentWalletAddress.substring(36)}` : 'ANONYMOUS'}
                            </span>
                        </div>
                    </div>
                    {/* Asset Type Tags */}
                    <div className="flex flex-col items-end gap-1">
                        {isSBT ? (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider">SBT Token</span>
                        ) : (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">NFT Token</span>
                        )}
                         <div className="px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-500">
                            {cred._id ? `#${cred._id.substring(cred._id.length - 6)}` : 'ID'}
                         </div>
                    </div>
                </div>

                {/* Mobile Bottom Bar: Date & Actions */}
                <div className="pt-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] tracking-wider uppercase">
                        <Calendar className="w-3 h-3" />
                         {new Date(cred.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="flex items-center gap-1">
                         {cred.transactionHash && (
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors border border-transparent hover:border-indigo-500/20"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        {!cred.isRevoked && (
                            <Button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRevoke(cred);
                                }}
                                variant="ghost"
                                rounded="xl"
                                className="!p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/20"
                            >
                                <ShieldAlert className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

const CredentialTable = ({ credentials, onView, onRevoke, loading }) => {
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-black/20 rounded-[3rem] border border-white/[0.04] border-dashed">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute top-0 w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8 animate-pulse">Syncing Chain State</div>
            </div>
        );
    }

    if (credentials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-[#0a0a0a] rounded-[3rem] border border-dashed border-white/[0.06] shadow-2xl group transition-all">
                <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center mb-8 border border-white/[0.05] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                    <FileText className="w-10 h-10 text-zinc-800 group-hover:text-indigo-500/40 transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">No Records Identified</h3>
                <p className="text-zinc-500 max-w-sm mx-auto font-medium">
                    The institutional registry is currently empty based on your active filters.
                </p>
                <div className="mt-10 flex items-center gap-3 px-6 py-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] font-bold text-indigo-400/60">
                    <Search className="w-3.5 h-3.5" />
                    Archive Scanned
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <AnimatePresence mode="popLayout">
                {credentials.map((cred, idx) => (
                    <CredentialTableRow 
                        key={cred._id || idx}
                        cred={cred}
                        idx={idx}
                        onView={onView}
                        onRevoke={onRevoke}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(CredentialTable);
