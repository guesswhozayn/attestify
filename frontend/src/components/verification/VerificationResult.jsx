import React from 'react';
import { CheckCircle, XCircle, ShieldAlert, Award, FileText, ExternalLink, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationResult = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.valid && !result.revoked;
  const isRevoked = result.revoked;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Result Card */}
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 transition-all duration-500 ${
        isSuccess 
          ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]' 
          : isRevoked 
            ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]'
            : 'bg-red-500/10 border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]'
      }`}>
        
        {/* Animated Background Pulse */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-20 animate-pulse ${
            isSuccess ? 'bg-emerald-500' : 'bg-red-500'
        }`}></div>

        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className={`p-3 rounded-full border shadow-lg ${
            isSuccess 
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            {isSuccess ? <CheckCircle className="w-8 h-8" /> : isRevoked ? <ShieldAlert className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div>
            <h3 className={`text-2xl font-bold tracking-tight mb-1 ${
              isSuccess ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {isSuccess ? 'Verified Authentic' : isRevoked ? 'Certificate Revoked' : 'Verification Failed'}
            </h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
              {result.message}
            </p>
          </div>
        </div>

        {/* Revocation Details */}
        {isRevoked && result.credential && (
             <div className="mt-6 pt-6 border-t border-red-500/20 space-y-3 bg-red-500/5 -mx-6 px-6 pb-2">
                <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                    <ShieldAlert className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Revocation Notice</span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center border-b border-red-500/10 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">Date</span>
                        <span className="text-white font-mono text-xs">
                            {result.credential.revokedAt ? new Date(result.credential.revokedAt).toLocaleString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">Reason</span>
                        <span className="text-white font-medium text-xs text-right max-w-[200px]">{result.credential.revocationReason || 'Administrative Action'}</span>
                    </div>
                </div>
             </div>
        )}

        {/* Credential Mini-Summary */}
        {result.credential && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 gap-4">
            
            <div className="flex items-center justify-between group">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Student</span>
                    <p className="text-white font-bold text-sm">{result.credential.studentName}</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between group">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Issuer</span>
                    <p className="text-white font-bold text-sm">{result.credential.university}</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between group">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Issued</span>
                    <p className="text-white font-bold text-sm">
                        {new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 text-center">Credential ID</span>
                <div className="bg-black/40 rounded-lg p-2 font-mono text-[10px] text-gray-400 break-all text-center border border-white/5 selectable">
                    {result.credential.studentWalletAddress}
                </div>
            </div>
            
          </div>
        )}

        {/* Blockchain proof link */}
        {result.credential?.transactionHash && (
             <div className="mt-6 text-center">
                <a 
                    href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 transition-all hover:text-white group"
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Onchain Receipt</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
             </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationResult;
