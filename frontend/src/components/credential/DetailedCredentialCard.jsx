import React from 'react';
import { Award, ShieldAlert, CheckCircle, GraduationCap, ChevronRight, Box, Activity, ExternalLink, Database } from 'lucide-react';

const DetailedCredentialCard = ({ credential, metadata, minimalist = false, onClick }) => {

    if (!credential) return null;

    const displayMetadata = metadata || (credential.type === 'TRANSCRIPT' ? credential.transcriptData : credential.certificationData);
    const formattedDate = new Date(credential.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const title = displayMetadata?.program || displayMetadata?.title || 'Credential Title';
    const recipient = displayMetadata?.studentName || credential.studentName;
    const issuer = displayMetadata?.university || credential.university;
    const isSBT = !!credential.tokenId;

    if (minimalist) {
        return (
            <div 
                onClick={onClick}
                className="group p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between backdrop-blur-md"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-indigo-400 group-hover:scale-110 transition-transform">
                        {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm mb-0.5 tracking-tight">{title}</h3>
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                            {recipient} <span className="mx-2 opacity-30">|</span> {formattedDate}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isSBT && (
                        <div className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest border bg-purple-500/10 text-purple-400 border-purple-500/20 mr-2">
                            SBT
                        </div>
                    )}
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border ${
                        credential.isRevoked 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                        {credential.isRevoked ? 'REVOKED' : 'VALID'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
            </div>
        );
    }

    return (
        <div 
            className="py-10"

        >
            <div
                onClick={onClick}
                className={`group relative w-full aspect-[1.6/1] bg-black/40 border rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
                    isSBT ? 'border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/5' : 'border-white/10 hover:border-white/20 hover:shadow-indigo-500/5'
                }`}
            >
                {/* HUD Grid Overlay - Static */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${isSBT ? 'from-purple-500/10 via-transparent to-indigo-500/5' : 'from-indigo-500/5 via-transparent to-purple-500/5'} opacity-50`}></div>
                
                {/* HUD Corner Accents */}
                <div className={`absolute top-10 left-10 w-6 h-6 border-t border-l border-white/20 rounded-tl-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-400' : 'group-hover:border-indigo-400'}`}></div>
                <div className={`absolute top-10 right-10 w-6 h-6 border-t border-r border-white/20 rounded-tr-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-400' : 'group-hover:border-indigo-400'}`}></div>
                <div className={`absolute bottom-10 left-10 w-6 h-6 border-b border-l border-white/20 rounded-bl-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-400' : 'group-hover:border-indigo-400'}`}></div>
                <div className={`absolute bottom-10 right-10 w-6 h-6 border-b border-r border-white/20 rounded-br-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-400' : 'group-hover:border-indigo-400'}`}></div>

                {/* Micro Metadata HUD Elements */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[8px] font-black tracking-[0.3em] text-white/20 uppercase pointer-events-none transition-all duration-500 group-hover:text-white/40 group-hover:gap-10">
                    <span>RECORD ID // 0X{credential.certificateHash?.substring(0, 8)}</span>
                    <div className={`w-1 h-1 rounded-full ${isSBT ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`}></div>
                    <span>STATUS // SECURE</span>
                </div>

                {/* Main Content Sections */}
                <div className="relative h-full p-12 md:p-16 flex flex-col justify-between z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl group-hover:bg-opacity-10 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-500/30 group-hover:bg-purple-500/10' : 'group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10'}`}>
                                    {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-6 h-6 text-white" /> : <Award className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <span className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isSBT ? 'text-purple-400' : 'text-indigo-400'}`}>Verified Credential</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">{credential.type} {isSBT ? 'SBT' : 'NFT'} 2.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-105 ${
                            credential.isRevoked 
                                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                : 'bg-white/5 border-white/10 text-white hover:border-indigo-500/30'
                        }`}>
                            {credential.isRevoked ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                            {credential.isRevoked ? 'STATUS: INVALID' : 'STATUS: VERIFIED'}
                        </div>
                    </div>

                    {/* Title & Core Details */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-4 drop-shadow-2xl">
                                {title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
                                    <div className="w-4 h-[1px] bg-white/20"></div>
                                    <span className="text-white/60">Institution</span>
                                    <span className="text-white">{issuer}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">
                                    <div className="w-4 h-[1px] bg-white/20"></div>
                                    <span className="text-white/60">Date Issued</span>
                                    <span className="text-white">{formattedDate.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recipient HUD Block */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                            <div className="space-y-1">
                                <label className="text-[9px] text-white/30 font-black uppercase tracking-widest block">Student Name</label>
                                <p className="text-lg text-white font-bold tracking-tight">{recipient}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-white/30 font-black uppercase tracking-widest block">Academic Grade</label>
                                <p className={`text-lg font-bold tracking-tight font-mono ${isSBT ? 'text-purple-400' : 'text-indigo-400'}`}>{displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 hidden md:block">
                                <label className="text-[9px] text-white/30 font-black uppercase tracking-widest block">Specialization</label>
                                <p className="text-lg text-white/80 font-bold tracking-tight">{displayMetadata?.major || displayMetadata?.department || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <label className="text-[9px] text-white/30 font-black uppercase tracking-widest block">Unique ID</label>
                                <p className="text-lg text-white font-mono opacity-40">#{credential.studentWalletAddress?.substring(2, 8).toUpperCase() || 'IDENTITY_000'}</p>
                            </div>
                        </div>

                        {/* On-Chain Identity Block (SBT Details) */}
                        {isSBT && (
                            <div className="pt-6 border-t border-purple-500/10 flex items-center justify-between gap-8">
                                <div className="flex items-center gap-4 bg-purple-500/5 border border-purple-500/10 px-4 py-3 rounded-2xl backdrop-blur-md">
                                    <div className="p-2 bg-purple-500/10 rounded-xl">
                                        <Database className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black text-purple-300/40 uppercase tracking-widest">On-Chain Asset ID</span>
                                        <span className="text-[11px] font-mono font-bold text-purple-200">TOKEN #{credential.tokenId} {"//"} SBT-LOCKED</span>
                                    </div>
                                </div>
                                <a 
                                    href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${credential.tokenId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 group/btn px-4 py-2 text-[9px] font-black uppercase tracking-widest text-purple-300 hover:text-white transition-colors"
                                >
                                    <span>Verify Ownership</span>
                                    <ExternalLink className="w-3 h-3 translate-y-[-1px] group-hover/btn:translate-x-1 group-hover/btn:translate-y-[-3px] transition-transform" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtle Surface Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${isSBT ? 'bg-purple-500/[0.03]' : 'bg-white/[0.02]'}`}></div>
            </div>

            {/* Bottom Technical Labels */}
            <div className="mt-8 flex justify-between items-center px-8 text-[9px] font-black tracking-[0.2em] text-white/20 uppercase">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><Box className="w-3 h-3" /> Security: Verified</span>
                    <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> Connectivity: Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hover:text-indigo-400 transition-colors cursor-help">About this Record</span>
                    <span className="hover:text-indigo-400 transition-colors cursor-help">How it Works</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(DetailedCredentialCard);
