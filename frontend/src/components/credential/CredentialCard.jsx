import React from 'react';
import { FileText, Calendar, ShieldAlert, CheckCircle, GraduationCap, Award, Shield, User, ChevronRight } from 'lucide-react';

const CredentialCard = ({ credential, onClick }) => {
  const displayMetadata = credential.type === 'TRANSCRIPT' ? credential.transcriptData : credential.certificationData;
  const isTranscript = credential.type === 'TRANSCRIPT';
  const isSBT = !!credential.tokenId;
  const isRevoked = credential.isRevoked;

  // Base gradients
  const bgGradient = isTranscript 
    ? 'from-indigo-600/15 via-purple-600/10 to-indigo-900/10' 
    : 'from-emerald-600/15 via-teal-600/10 to-emerald-900/10';

  const accentColor = isTranscript ? 'indigo' : 'emerald';
  const Icon = isTranscript ? GraduationCap : Award;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2
        ${isSBT ? 'hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]' : `hover:shadow-[0_0_40px_-10px_rgba(${isTranscript ? '99,102,241' : '16,185,129'},0.3)]`}
      `}
    >
      {/* Dynamic Border Gradient */}
      <div className={`absolute inset-0 p-[1px] rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent 
        ${isSBT ? 'group-hover:from-purple-500/50 group-hover:via-indigo-500/30' : `group-hover:from-${accentColor}-500/50 group-hover:via-${accentColor}-500/30`}
        transition-all duration-500
      `}></div>

      {/* Main Card Content */}
      <div className={`relative h-full bg-black/40 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between overflow-hidden
        border border-white/5 group-hover:border-white/10 transition-all duration-300
      `}>
        
        {/* Background Effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
        {isSBT && <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500"></div>}

        {/* Header Section */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner
              ${isTranscript ? 'text-indigo-400' : 'text-emerald-400'}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            {/* Issuer Badge (Simulated or Real) */}
            <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-0.5">Issuer</span>
               <div className="flex items-center gap-1.5">
                 {credential.issuedBy?.issuerDetails?.branding?.logo ? (
                   <img src={credential.issuedBy.issuerDetails.branding.logo} alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover" />
                 ) : (
                   <div className={`w-3.5 h-3.5 rounded-full bg-${accentColor}-500/20 flex items-center justify-center`}>
                     <CheckCircle className={`w-2.5 h-2.5 text-${accentColor}-400`} />
                   </div>
                 )}
                 <span className="text-xs font-medium text-white/90 truncate max-w-[120px]">
                   {credential.university || credential.issuedBy?.name || 'Unknown Issuer'}
                 </span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm flex items-center gap-1.5
              ${isRevoked 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${isRevoked ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
              {isRevoked ? 'Revoked' : 'Valid'}
            </div>
            
            {/* SBT Badge */}
            {isSBT && (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_-3px_rgba(168,85,247,0.3)]">
                Soulbound
              </div>
            )}
          </div>
        </div>

        {/* Body Section */}
        <div className="relative z-10 flex-grow">
          <h3 className="text-xl font-bold text-white leading-snug mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300 line-clamp-2">
            {displayMetadata?.program || displayMetadata?.title || 'Credential Title'}
          </h3>
          
          <div className="flex items-center gap-2 mt-4">
             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {credential.studentImage ? (
                  <img src={credential.studentImage} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white/50" />
                )}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Recipient</span>
                <span className="text-xs text-white/90 font-medium truncate max-w-[150px]">
                  {displayMetadata?.studentName || credential.studentName}
                </span>
             </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium font-mono">
            <Calendar className="w-3 h-3" />
            <span>{new Date(credential.issueDate).toLocaleDateString()}</span>
          </div>

          <div className={`flex items-center gap-1 text-xs font-bold transition-all duration-300 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0
            ${isTranscript ? 'text-indigo-400' : 'text-emerald-400'}
          `}>
            Details <ChevronRight className="w-3 h-3" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CredentialCard;
