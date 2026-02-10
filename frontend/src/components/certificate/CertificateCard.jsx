import React from 'react';
import { FileText, Calendar, ShieldAlert, CheckCircle, GraduationCap, Award } from 'lucide-react';

const CertificateCard = ({ certificate, onClick }) => {
  const displayMetadata = certificate.type === 'TRANSCRIPT' ? certificate.transcriptData : certificate.certificationData;

  return (
    <div
      onClick={onClick}
      className="group relative bg-gray-900 rounded-3xl overflow-hidden cursor-pointer border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
    >
      <div className={`h-48 bg-gradient-to-br ${
        certificate.type === 'TRANSCRIPT' 
          ? 'from-indigo-900 via-purple-900 to-gray-900' 
          : 'from-emerald-900 via-teal-900 to-gray-900'
      } flex flex-col justify-between p-5 relative overflow-hidden`}>
        
        {/* Background Noise/Gradient */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${
             certificate.type === 'TRANSCRIPT' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'
        }`}></div>
        
        {/* Header Top Row */}
        <div className="relative z-10 flex justify-between items-start">
             <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
                {certificate.type === 'TRANSCRIPT' ? (
                    <GraduationCap className="w-5 h-5 text-white" />
                ) : (
                    <Award className="w-5 h-5 text-white" />
                )}
             </div>

             <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                certificate.isRevoked 
                  ? 'bg-red-500/20 border-red-500/30 text-red-200' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
             }`}>
                {certificate.isRevoked ? (
                   <><ShieldAlert className="w-3 h-3" /> Revoked</>
                ) : (
                   <><CheckCircle className="w-3 h-3" /> Valid</>
                )}
             </div>
        </div>

        {/* Header Bottom (Title) */}
        <div className="relative z-10 mt-auto pt-4">
             <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
               {displayMetadata?.program || displayMetadata?.title || 'Credential Title'}
             </h3>
             <div className="flex items-center text-white/70 text-xs font-medium mt-1">
                <Calendar className="w-3 h-3 mr-1.5" />
                Issued {new Date(certificate.issueDate).toLocaleDateString()}
             </div>
        </div>
      </div>
      
      <div className="p-5 bg-gray-900">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
             <div className="space-y-0.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Recipient</label>
                <div className="font-semibold text-gray-200 text-sm truncate max-w-[150px]">
                    {displayMetadata?.studentName || certificate.studentName}
                </div>
             </div>
             <div className="text-right space-y-0.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Issuer</label>
                <div className="font-medium text-emerald-400 text-xs flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{displayMetadata?.university || certificate.university}</span>
                </div>
             </div>
        </div>
        
        <div className="flex items-center justify-between">
           <div>
               <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">Type</label>
               <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                  {certificate.type}
               </span>
           </div>
           
           {(displayMetadata?.cgpa || displayMetadata?.score) && (
               <div className="text-right">
                   <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-0.5">Score</label>
                   <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                       {displayMetadata?.cgpa || displayMetadata.score}
                   </span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
