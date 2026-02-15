import React from 'react';
import { 
    GraduationCap, 
    Award, 
    Calendar, 
    User, 
    ChevronRight, 
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CredentialRow = ({ credential, onClick }) => {
    const isTranscript = credential.type === 'TRANSCRIPT';
    const displayMetadata = isTranscript ? credential.transcriptData : credential.certificationData;
    const Icon = isTranscript ? GraduationCap : Award;
    const accentColor = isTranscript ? 'indigo' : 'emerald';
    const isRevoked = credential.isRevoked;

    return (
        <div 
            onClick={onClick}
            className="group grid grid-cols-12 gap-4 items-center p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-200 cursor-pointer"
        >
            {/* Type Icon */}
            <div className="col-span-1">
                <div className={`w-10 h-10 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${accentColor}-400`} />
                </div>
            </div>

            {/* Recipient */}
            <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {credential.studentImage ? (
                        <img src={credential.studentImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-4 h-4 text-white/40" />
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                        {credential.studentName}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">
                        {credential.studentWalletAddress.substring(0, 6)}...{credential.studentWalletAddress.substring(38)}
                    </span>
                </div>
            </div>

            {/* Credential Details */}
            <div className="col-span-4 flex flex-col min-w-0">
                <span className="text-sm text-zinc-300 font-medium truncate">
                    {displayMetadata?.program || displayMetadata?.title || 'Untitled Credential'}
                </span>
                <span className="text-xs text-zinc-500 truncate">
                    {isTranscript ? 'Academic Transcript' : 'Certification'} • {credential.university}
                </span>
            </div>

            {/* Date */}
            <div className="col-span-2 flex items-center gap-2 text-zinc-400 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(credential.issueDate).toLocaleDateString()}</span>
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center justify-end gap-3">
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5
                    ${isRevoked 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRevoked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    {isRevoked ? 'Revoked' : 'Active'}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
            </div>
        </div>
    );
};

const RecentActivityList = ({ credentials, onCredentialClick, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-zinc-500 text-sm font-medium">Loading activity...</div>
            </div>
        );
    }

    if (!credentials || credentials.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] rounded-3xl border border-white/[0.05] text-center">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-white font-medium mb-1">No Recent Activity</h3>
                <p className="text-zinc-500 text-sm">Issued credentials will appear here.</p>
             </div>
        );
    }

    return (
        <div className="space-y-1 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-white/[0.05] mb-2">
                <div className="col-span-1">Type</div>
                <div className="col-span-3">Recipient</div>
                <div className="col-span-4">Credential</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Status</div>
            </div>
            
            <div className="space-y-1">
                {credentials.map((cred) => (
                    <CredentialRow 
                        key={cred._id || cred.id} 
                        credential={cred} 
                        onClick={() => onCredentialClick(cred)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentActivityList;
