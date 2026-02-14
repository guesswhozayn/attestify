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

    return (
        <div onClick={onClick} className="group relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer">
            
            {/* Card Header / Banner */}
            <div className="relative h-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-8 md:p-10 flex flex-col justify-between overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/10">
                        {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-6 h-6 text-white" /> : <Award className="w-6 h-6 text-white" />}
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white tracking-wider uppercase">
                        {credential.type}
                    </div>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm border ${
                    credential.isRevoked 
                        ? 'bg-red-500/20 border-red-500/50 text-red-200' 
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                }`}>
                    {credential.isRevoked ? (
                        <><ShieldAlert className="w-3.5 h-3.5" /> REVOKED</>
                    ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> VERIFIED</>
                    )}
                </div>
                </div>

                <div className="relative z-10 mt-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                    {title}
                </h2>
                <div className="flex items-center text-indigo-200/80 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Issued on {formattedDate}
                </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-8 md:p-10 bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-10 border-b border-gray-800">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Recipient</label>
                    <p className="text-2xl text-white font-semibold tracking-tight">{recipient}</p>
                    <p className="text-sm text-gray-400 font-mono">{credential.studentWalletAddress?.substring(0,10)}...</p>
                </div>
                <div className="md:text-right space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Issued By</label>
                    <p className="text-xl text-white font-medium">{issuer}</p>
                    <div className="flex md:justify-end">
                        <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                            <CheckCircle className="w-3 h-3 mr-1" /> trusted issuer
                        </span>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">GPA/Score</label>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Major / Field</label>
                    <p className="text-white font-medium text-lg leading-snug">{displayMetadata?.major || displayMetadata?.department || 'N/A'}</p>
                </div>
                {displayMetadata?.admissionYear && (
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Class Of</label>
                        <p className="text-white font-medium text-lg">{displayMetadata?.graduationYear || 'N/A'}</p>
                    </div>
                )}
                </div>

                {credential.isRevoked && (
                <div className="mt-8 p-6 bg-red-950/30 border border-red-500/20 rounded-2xl flex gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full h-fit">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-red-400 font-bold mb-2">Revocation Notice</h4>
                        <p className="text-sm text-red-300/80 leading-relaxed">
                            This credential has been officially revoked by the issuing authority. It is no longer considered valid proof of qualification. Please contact the institution for more details.
                        </p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default DetailedCredentialCard;
