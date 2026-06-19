import React from 'react';
import {
    GraduationCap,
    Award,
    Calendar,
    User,
    ChevronRight
} from 'lucide-react';

const CredentialRow = ({ credential, onClick }) => {
    const isTranscript = credential.type === 'TRANSCRIPT';
    const displayMetadata = isTranscript ? credential.transcriptData : credential.certificationData;
    const Icon = isTranscript ? GraduationCap : Award;
    const accentColor = isTranscript ? 'indigo' : 'emerald';
    const isRevoked = credential.isRevoked;

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-4xl bg-white/1 hover:bg-white/4 border border-white/4 hover:border-white/10 transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.99] mb-4"
        >

            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${accentColor}-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>

            <div className="flex items-center gap-4 shrink-0">
                <div className={`w-14 h-14 rounded-2xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl`}>
                    <Icon className={`w-7 h-7 text-${accentColor}-400`} />
                </div>
                <div className="md:hidden flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                        {isTranscript ? 'Academic Ledger' : 'Certification'}
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {credential.studentName}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col min-w-0">
                    <span className="hidden md:block text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">
                        Credential Subject
                    </span>
                    <h4 className="text-base font-black text-white truncate leading-tight group-hover:translate-x-1 transition-transform">
                        {displayMetadata?.program || displayMetadata?.title || 'Untitled Record'}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="hidden md:block text-[10px] text-zinc-500 font-medium truncate flex-1">
                           Authority: {credential.issuedBy?.name || 'Authorized Institutional Body'}
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex flex-col min-w-0">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">
                        Recipient Identity
                    </span>
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-linear-to-tr from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:border-indigo-500/30 transition-colors">
                            {credential.studentImage ? (
                                <img src={credential.studentImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-white/20" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-zinc-200 truncate">
                                {credential.studentName}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">
                                {credential.studentWalletAddress ? `${credential.studentWalletAddress.substring(0, 10)}...${credential.studentWalletAddress.substring(34)}` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
                <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(credential.issueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 shadow-lg backdrop-blur-md
                    ${isRevoked
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRevoked ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                    {isRevoked ? 'Revoked' : 'Verified'}
                </div>
            </div>

            <div className="hidden md:flex w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0 shadow-2xl">
                <ChevronRight className="w-5 h-5 text-indigo-400" />
            </div>
        </div>
    );
};

export default React.memo(CredentialRow);
