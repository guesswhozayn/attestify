import { CheckCircle, XCircle, ShieldAlert, Award, ExternalLink, Calendar, User, Activity, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';

const VerificationResult = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.valid && !result.revoked;
  const isRevoked = result.revoked;

  const statusConfig = {
    success: {
      icon: CheckCircle,
      label: 'Document verified',
      subtext: 'Valid credential',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/5',
      shadowColor: 'shadow-emerald-500/20',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-500',
      gradientVia: 'via-emerald-500'
    },
    revoked: {
      icon: ShieldAlert,
      label: 'Credential revoked',
      subtext: 'No longer valid',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5',
      shadowColor: 'shadow-red-500/20',
      textColor: 'text-red-400',
      dotColor: 'bg-red-500',
      gradientVia: 'via-red-500'
    },
    failed: {
      icon: XCircle,
      label: 'Verification failed',
      subtext: result.message || 'Document details do not match',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5',
      shadowColor: 'shadow-red-500/20',
      textColor: 'text-red-400',
      dotColor: 'bg-red-500',
      gradientVia: 'via-red-500'
    }
  };

  const config = isSuccess ? statusConfig.success : isRevoked ? statusConfig.revoked : statusConfig.failed;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto relative group"
    >

      <motion.div
        initial={{ top: 0, opacity: 0 }}
        animate={{ top: "100%", opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, ease: "linear" }}
        className={`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent ${config.gradientVia} to-transparent z-20 pointer-events-none`}
      />

      <div className={`relative overflow-hidden rounded-2xl border ${config.borderColor} bg-[#0e1017]/90 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_50px_-15px_rgba(0,0,0,0.7)]`}>

        <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${config.borderColor} rounded-tl-xl`} />
        <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${config.borderColor} rounded-tr-xl`} />
        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${config.borderColor} rounded-bl-xl`} />
        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${config.borderColor} rounded-br-xl`} />

        <div className={`p-8 border-b border-white/5 relative overflow-hidden`}>
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} shadow-[0_0_20px_rgba(0,0,0,0.2)]`}
                 >
                    <StatusIcon className={`w-8 h-8 ${config.textColor}`} />
                 </motion.div>

                 <div>
                    <motion.h2
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`text-2xl font-bold tracking-tight text-white mb-1`}
                    >
                      {config.label}
                    </motion.h2>
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2"
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
                       <span className={`text-xs font-mono uppercase tracking-widest ${config.textColor}`}>
                          {config.subtext}
                       </span>
                    </motion.div>
                 </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden sm:flex flex-col items-end"
              >
                 <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Match accuracy</span>
                 <div className="flex items-end gap-1">
                    <span className={`text-3xl font-black ${config.textColor} leading-none`}>
                       {isSuccess ? '100' : '0'}
                    </span>
                    <span className="text-xs text-gray-500 mb-1">%</span>
                 </div>
              </motion.div>
           </div>
        </div>

        <div className="p-8 space-y-8">
           {result.credential ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                 <InfoGroup
                    icon={User}
                    label="Recipient name"
                    value={result.credential.studentName}
                    delay={0.6}
                  />

                 <InfoGroup
                    icon={Award}
                    label="Issuing institution"
                    value={result.credential.university}
                    delay={0.7}
                  />

                 <InfoGroup
                    icon={Calendar}
                    label="Date issued"
                    value={new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    delay={0.8}
                  />

                 <div className="md:col-span-2">
                    <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.9 }}
                       className="space-y-2"
                    >
                       <div className="flex items-center gap-2 text-gray-500">
                          <Hash className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">Recipient wallet address</span>
                       </div>
                       <div className="bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs text-indigo-300 break-all hover:bg-white/5 transition-colors cursor-text select-all">
                          {result.credential.studentWalletAddress}
                       </div>
                    </motion.div>
                 </div>
              </div>
           ) : (
             <div className="text-center py-8">
                <p className="text-gray-400 font-mono text-sm">{result.message}</p>
             </div>
           )}

           {isRevoked && result.credential && (
              <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 transition={{ delay: 0.5 }}
                 className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ShieldAlert className="w-24 h-24 text-red-500" />
                  </div>

                  <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                     <Activity className="w-4 h-4" />
                     Revocation details
                  </h3>

                  <div className="space-y-3 relative z-10">
                     <div className="flex justify-between items-center text-sm border-b border-red-500/10 pb-2">
                        <span className="text-gray-500">Date revoked</span>
                        <span className="text-white font-mono">
                           {result.credential.revokedAt ? new Date(result.credential.revokedAt).toLocaleString() : 'N/A'}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Reason</span>
                        <span className="text-white font-medium">{result.credential.revocationReason || 'Canceled by issuer'}</span>
                     </div>
                  </div>
              </motion.div>
           )}

           {result.credential?.transactionHash && (
              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.0 }}
                 className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center"
              >
                 <Button
                    href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto font-mono text-xs uppercase hover:bg-white/10"
                    icon={ExternalLink}
                 >
                    View on Etherscan
                 </Button>
              </motion.div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

const InfoGroup = ({ icon: Icon, label, value, delay }) => (
  <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay }}
     className="group/item"
  >
     <div className="flex items-center gap-2 mb-2 text-gray-500 group-hover/item:text-indigo-400 transition-colors">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
     </div>
     <div className="text-white font-medium text-sm pl-5.5 border-l border-white/10 group-hover/item:border-indigo-500/50 transition-colors pl-3">
        {value}
     </div>
  </motion.div>
);

export default VerificationResult;
