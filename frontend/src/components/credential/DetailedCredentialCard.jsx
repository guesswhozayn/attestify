import React from 'react';
import { Award, ShieldAlert, CheckCircle, GraduationCap, ChevronRight, Box, Activity, ExternalLink, Database } from 'lucide-react';
import { getCredentialMeta } from '../../utils/credential';

const DetailedCredentialCard = ({ credential, metadata, minimalist = false, onClick }) => {

    if (!credential) return null;

    const meta = getCredentialMeta(credential);
    const displayMetadata = metadata || meta.metadata;
    const isTranscript = meta.isTranscript;
    const formattedDate = new Date(credential.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const title = displayMetadata?.program || displayMetadata?.title || 'Credential Title';
    const recipient = displayMetadata?.studentName || credential.studentName;
    const issuer = displayMetadata?.university || credential.university;
    const isSBT = !!credential.tokenId;

    if (minimalist) {
        return (
            <div
                onClick={onClick}
                className="group p-5 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between backdrop-blur-md shadow-sm dark:shadow-none"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-xs dark:shadow-none">
                        {isTranscript ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-0.5 tracking-tight">{title}</h3>
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
                className={`hidden md:block group relative w-full aspect-[1.6/1] bg-white/60 dark:bg-black/40 border rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-xl dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
                    isSBT ? 'border-purple-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/40 hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5'
                }`}
            >

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                <div className={`absolute inset-0 bg-linear-to-br ${isSBT ? 'from-purple-500/5 dark:from-purple-500/10 via-transparent to-indigo-500/5' : 'from-indigo-500/5 via-transparent to-purple-500/5'} opacity-50`}></div>

                <div className={`absolute top-10 left-10 w-6 h-6 border-t border-l border-slate-300 dark:border-white/20 rounded-tl-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-500 dark:group-hover:border-purple-400' : 'group-hover:border-indigo-500 dark:group-hover:border-indigo-400'}`}></div>
                <div className={`absolute top-10 right-10 w-6 h-6 border-t border-r border-slate-300 dark:border-white/20 rounded-tr-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-500 dark:group-hover:border-purple-400' : 'group-hover:border-indigo-500 dark:group-hover:border-indigo-400'}`}></div>
                <div className={`absolute bottom-10 left-10 w-6 h-6 border-b border-l border-slate-300 dark:border-white/20 rounded-bl-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-500 dark:group-hover:border-purple-400' : 'group-hover:border-indigo-500 dark:group-hover:border-indigo-400'}`}></div>
                <div className={`absolute bottom-10 right-10 w-6 h-6 border-b border-r border-slate-300 dark:border-white/20 rounded-br-sm pointer-events-none group-hover:w-8 group-hover:h-8 transition-all duration-500 ${isSBT ? 'group-hover:border-purple-500 dark:group-hover:border-purple-400' : 'group-hover:border-indigo-500 dark:group-hover:border-indigo-400'}`}></div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-white/20 uppercase pointer-events-none transition-all duration-500 group-hover:text-slate-600 dark:group-hover:text-white/40 group-hover:gap-10">
                    <span>RECORD ID // 0X{credential.certificateHash?.substring(0, 8)}</span>
                    <div className={`w-1 h-1 rounded-full ${isSBT ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`}></div>
                    <span>STATUS // SECURE</span>
                </div>

                <div className="relative h-full p-12 lg:p-16 flex flex-col justify-between z-10 w-full">

                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl group-hover:bg-opacity-10 transition-all duration-500 shadow-sm dark:shadow-none ${isSBT ? 'group-hover:border-purple-300 dark:group-hover:border-purple-500/30 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10' : 'group-hover:border-indigo-300 dark:group-hover:border-indigo-500/30 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10'}`}>
                                    {isTranscript ? <GraduationCap className="w-6 h-6 text-slate-700 dark:text-white" /> : <Award className="w-6 h-6 text-slate-700 dark:text-white" />}
                                </div>
                                <div>
                                    <span className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isSBT ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>Verified Credential</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-white/80 uppercase tracking-widest">{credential.type} {isSBT ? 'SBT' : 'NFT'} 2.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md dark:shadow-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-105 ${
                            credential.isRevoked
                                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500'
                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-500/30'
                        }`}>
                            {credential.isRevoked ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                            {credential.isRevoked ? 'STATUS: INVALID' : 'STATUS: VERIFIED'}
                        </div>
                    </div>

                    <div className="space-y-8 mt-auto w-full">
                        <div>
                            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight mb-4 drop-shadow-sm dark:drop-shadow-2xl break-words hyphens-auto max-w-[90%]">
                                {title}
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-[0.15em]">
                                    <div className="w-4 h-[1px] bg-slate-200 dark:bg-white/20"></div>
                                    <span className="text-slate-500 dark:text-white/60">Institution</span>
                                    <span className="text-slate-800 dark:text-white">{issuer}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-[0.15em]">
                                    <div className="w-4 h-[1px] bg-slate-200 dark:bg-white/20"></div>
                                    <span className="text-slate-500 dark:text-white/60">Date Issued</span>
                                    <span className="text-slate-800 dark:text-white">{formattedDate.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-8 pt-8 border-t border-slate-200 dark:border-white/5 w-full">
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest block">Student Name</label>
                                <p className="text-lg text-slate-900 dark:text-white font-bold tracking-tight break-words">{recipient}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest block">Academic Grade</label>
                                <p className={`text-lg font-bold tracking-tight font-mono break-all ${isSBT ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest block">Specialization</label>
                                <p className="text-lg text-slate-700 dark:text-white/80 font-bold tracking-tight truncate max-w-full" title={displayMetadata?.major || displayMetadata?.department || 'N/A'}>{displayMetadata?.major || displayMetadata?.department || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <label className="text-[9px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest block">Unique ID</label>
                                <p className="text-lg text-slate-500 dark:text-white font-mono dark:opacity-40">#{credential.studentWalletAddress?.substring(2, 8).toUpperCase() || 'IDENTITY_000'}</p>
                            </div>
                        </div>

                        {isSBT && (
                            <div className="pt-6 border-t border-purple-100 dark:border-purple-500/10 flex items-center justify-between gap-8 w-full">
                                <div className="flex items-center gap-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 px-4 py-3 rounded-2xl backdrop-blur-md">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-xl shrink-0">
                                        <Database className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <div className="truncate">
                                        <span className="block text-[8px] font-black text-purple-400 dark:text-purple-300/40 uppercase tracking-widest">Registry Reference ID</span>
                                        <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-200">RECORD #{credential.tokenId} {"//"} SECURED</span>
                                    </div>
                                </div>
                                <a
                                    href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${credential.tokenId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 group/btn px-4 py-2 text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white transition-colors"
                                >
                                    <span>Verification Receipt</span>
                                    <ExternalLink className="w-3 h-3 translate-y-[-1px] group-hover/btn:translate-x-1 group-hover/btn:translate-y-[-3px] transition-transform" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${isSBT ? 'bg-purple-500/[0.03]' : 'bg-slate-900/[0.01] dark:bg-white/[0.02]'}`}></div>
            </div>

            <div className="hidden md:flex mt-8 justify-between items-center px-8 text-[9px] font-black tracking-[0.2em] text-slate-400 dark:text-white/20 uppercase">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><Box className="w-3 h-3" /> Security: Verified</span>
                    <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> Connectivity: Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-help">About this Record</span>
                    <span className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-help">How it Works</span>
                </div>
            </div>

            <div
                onClick={onClick}
                className={`block md:hidden flex flex-col w-full bg-white/60 dark:bg-black/40 border rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-md dark:shadow-2xl cursor-pointer transition-all duration-300 ${
                    isSBT ? 'border-purple-200 dark:border-purple-500/20' : 'border-slate-200 dark:border-white/10'
                }`}
            >

                <div className={`w-full py-4 px-5 flex items-center justify-between border-b ${isSBT ? 'bg-linear-to-r from-purple-100 dark:from-purple-500/10 to-transparent border-purple-200 dark:border-purple-500/10' : 'bg-linear-to-r from-indigo-50 dark:from-indigo-500/10 to-transparent border-slate-200 dark:border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl backdrop-blur-md border ${isSBT ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                            {isTranscript ? <GraduationCap className="w-5 h-5 text-slate-700 dark:text-white" /> : <Award className="w-5 h-5 text-slate-700 dark:text-white" />}
                        </div>
                        <div>
                            <span className={`block text-[9px] font-black uppercase tracking-[0.2em] ${isSBT ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>Verified Record</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest">{credential.type} {isSBT ? 'SBT' : 'NFT'} 2.0</span>
                        </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border flex flex-col items-center justify-center ${
                        credential.isRevoked
                            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                        {credential.isRevoked ? <ShieldAlert className="w-3.5 h-3.5 mb-1 text-red-600 dark:text-red-500" /> : <CheckCircle className="w-3.5 h-3.5 mb-1 text-emerald-600 dark:text-emerald-400" />}
                        {credential.isRevoked ? 'INVALID' : 'VERIFIED'}
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-3 drop-shadow-md break-words hyphens-auto">
                            {title}
                        </h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                                <div className="w-2.5 h-[1px] bg-slate-300 dark:bg-white/20"></div>
                                <span className="text-slate-700 dark:text-white">{issuer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                                <div className="w-2.5 h-[1px] bg-slate-300 dark:bg-white/20"></div>
                                <span className="text-slate-700 dark:text-white">{formattedDate.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 py-4 border-y border-slate-200 dark:border-white/5">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest">Student</span>
                            <span className="text-sm text-slate-800 dark:text-white font-bold tracking-tight truncate max-w-[60%] text-right">{recipient}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest">Grade</span>
                            <span className={`text-sm font-bold tracking-tight font-mono ${isSBT ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest">Major</span>
                            <span className="text-xs text-slate-700 dark:text-white/80 font-bold tracking-tight truncate max-w-[50%] text-right" title={displayMetadata?.major || displayMetadata?.department || 'N/A'}>{displayMetadata?.major || displayMetadata?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                             <span className="text-[9px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest">Reference ID</span>
                             <span className="text-[10px] text-slate-400 dark:text-white font-mono dark:opacity-50 text-right">#{credential.studentWalletAddress?.substring(2, 8).toUpperCase() || 'ID_000'}</span>
                        </div>
                    </div>

                    {isSBT && (
                        <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/10 rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <div className="flex gap-2 items-center mb-1">
                                    <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                    <span className="text-[9px] font-black text-purple-500 dark:text-purple-300/60 uppercase tracking-widest">Registry Reference ID</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-purple-800 dark:text-purple-200 block">RECORD #{credential.tokenId}</span>
                            </div>
                            <a
                                href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${credential.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                            >
                                <span>Verify</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(DetailedCredentialCard);
