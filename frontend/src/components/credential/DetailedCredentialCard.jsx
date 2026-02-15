import React from 'react';
import { Award, Calendar, ShieldAlert, CheckCircle, GraduationCap, ChevronRight } from 'lucide-react';

const DetailedCredentialCard = ({ credential, metadata, minimalist = false, onClick }) => {
    if (!credential) return null;

    // Use metadata passed in, or derive it if missing (fallback logic)
    const displayMetadata = metadata || (credential.type === 'TRANSCRIPT' ? credential.transcriptData : credential.certificationData);

    const formattedDate = new Date(credential.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const title = displayMetadata?.program || displayMetadata?.title || 'Credential Title';
    const recipient = displayMetadata?.studentName || credential.studentName;
    const issuer = displayMetadata?.university || credential.university;

    if (minimalist) {
        return (
            <div 
                onClick={onClick}
                className="group p-5 bg-zinc-900 border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg border border-white/5 ${credential.type === 'TRANSCRIPT' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-base mb-0.5">{title}</h3>
                        <p className="text-sm text-zinc-500">
                            Issued to <span className="text-zinc-400">{recipient}</span> • {formattedDate}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                        credential.isRevoked 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                        {credential.isRevoked ? 'REVOKED' : 'VALID'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
            </div>
        );
    }

    const headerGradient = credential.type === 'TRANSCRIPT'
        ? 'from-indigo-600 via-purple-700 to-indigo-900'
        : 'from-emerald-600 via-teal-700 to-emerald-900';

    return (
        <div 
            onClick={onClick} 
            className="group relative bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5 hover:border-white/10 transition-all duration-700 cursor-pointer"
        >
            {/* Holographic Header / Banner */}
            <div className={`relative h-72 bg-gradient-to-br ${headerGradient} p-8 md:p-12 flex flex-col justify-between overflow-hidden`}>
                {/* Dynamic Lighting Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none group-hover:bg-white/15 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
                
                {/* Advanced Noise & Grain Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-150 contrast-125 mix-blend-overlay"></div>
                
                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer-slow pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-2xl shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-500">
                            {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-7 h-7 text-white" /> : <Award className="w-7 h-7 text-white" />}
                        </div>
                        <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Authentic</span>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[10px] font-black text-white tracking-widest uppercase text-center min-w-[80px]">
                                {credential.type}
                            </div>
                        </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-105 ${
                        credential.isRevoked 
                            ? 'bg-red-500/20 border-red-500/40 text-red-100' 
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100'
                    }`}>
                        {credential.isRevoked ? (
                            <><ShieldAlert className="w-4 h-4" /> SECURED: REVOKED</>
                        ) : (
                            <><CheckCircle className="w-4 h-4" /> SECURED: VERIFIED</>
                        )}
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:translate-x-1 transition-transform duration-500">
                        {title}
                    </h2>
                    <div className="flex items-center text-white/70 text-xs font-bold tracking-wider uppercase">
                        <Calendar className="w-4 h-4 mr-2 text-white/50" />
                        Date of Issue: <span className="text-white ml-2">{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* Premium Card Body */}
            <div className="p-10 md:p-14 bg-gradient-to-b from-[#0f0f0f] to-[#050505]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 pb-12 border-b border-white/5">
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Legal Recipient</label>
                        <p className="text-3xl text-white font-bold tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all duration-500">{recipient}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <p className="text-xs text-white/40 font-mono tracking-widest">{credential.studentWalletAddress?.substring(0, 16)}...</p>
                        </div>
                    </div>
                    
                    <div className="md:text-right space-y-3">
                        <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Attesting Institution</label>
                        <p className="text-2xl text-white font-bold tracking-tight">{issuer}</p>
                        <div className="flex md:justify-end">
                            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                                credential.type === 'TRANSCRIPT' 
                                    ? 'text-indigo-400 bg-indigo-400/5 border-indigo-400/20' 
                                    : 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20'
                            }`}>
                                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Verified Registry
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                    <div className="space-y-3">
                        <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Academic Standing</label>
                        <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${credential.type === 'TRANSCRIPT' ? 'from-indigo-400 to-purple-500' : 'from-emerald-400 to-teal-500'}`}>
                            {displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-3">
                        <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Specialization</label>
                        <p className="text-xl text-white font-bold leading-tight tracking-tight">{displayMetadata?.major || displayMetadata?.department || 'N/A'}</p>
                    </div>
                    {displayMetadata?.graduationYear && (
                        <div className="space-y-3">
                            <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Certification Class</label>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-white leading-none">'{displayMetadata?.graduationYear?.toString().slice(-2)}</span>
                                <span className="text-xs text-white/50 mb-1 font-bold uppercase">Series</span>
                            </div>
                        </div>
                    )}
                </div>

                {credential.isRevoked && (
                    <div className="mt-12 p-8 bg-red-950/20 border border-red-500/20 rounded-[2rem] flex gap-6 backdrop-blur-xl">
                        <div className="p-4 bg-red-500/10 rounded-2xl h-fit border border-red-500/20 shadow-lg shadow-red-500/10">
                            <ShieldAlert className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-red-400 font-black text-lg mb-2 tracking-tight uppercase group-hover:animate-pulse">Revocation Alert</h4>
                            <p className="text-sm text-red-200/60 leading-relaxed font-medium">
                                This cryptographic record has been invalidated by the issuer. It no longer represents a verified qualification in the Attestify network. Any associated rights or recognitions are null and void.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Bottom Glow */}
            <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${credential.type === 'TRANSCRIPT' ? 'from-indigo-500 to-purple-600' : 'from-emerald-500 to-teal-600'} opacity-30 shadow-[0_0_20px_rgba(99,102,241,0.5)]`}></div>
        </div>
    );
};

export default DetailedCredentialCard;
