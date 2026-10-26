import { CheckCircle, XCircle, ShieldAlert, Award, ExternalLink, Calendar, User, Activity, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationResult = ({ result }) => {
  if (!result) return null;

  const isSuccess = result.valid && !result.revoked;
  const isRevoked = result.revoked;

  const statusConfig = {
    success: {
      icon: CheckCircle,
      label: 'Document verified',
      subtext: 'Cryptographically valid credential',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBoxClass: 'bg-emerald-100/70 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600',
    },
    revoked: {
      icon: ShieldAlert,
      label: 'Credential revoked',
      subtext: 'No longer recognized as valid',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconBoxClass: 'bg-rose-100/70 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-600',
    },
    failed: {
      icon: XCircle,
      label: 'Verification failed',
      subtext: result.message || 'Document hash or record does not match',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconBoxClass: 'bg-rose-100/70 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-600',
    }
  };

  const config = isSuccess ? statusConfig.success : isRevoked ? statusConfig.revoked : statusConfig.failed;
  const StatusIcon = config.icon;

  return (
    <div className="w-full space-y-6 text-stone-900">
      {/* Status banner */}
      <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${config.iconBoxClass}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">{config.label}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                {isSuccess ? 'Verified' : isRevoked ? 'Revoked' : 'Invalid'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">{config.subtext}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center px-4 py-2 bg-stone-50 rounded-xl border border-stone-200/60">
          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Match score</span>
          <span className={`text-xl font-bold font-mono ${isSuccess ? 'text-emerald-700' : 'text-stone-500'}`}>
            {isSuccess ? '100%' : '0%'}
          </span>
        </div>
      </div>

      {result.credential ? (
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Credential details</h3>
            <span className="text-xs text-stone-400 font-mono">
              ID: {result.credential._id ? result.credential._id.slice(0, 8) : 'RECORD'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem
              icon={User}
              label="Recipient name"
              value={result.credential.studentName || 'Not specified'}
            />

            <InfoItem
              icon={Award}
              label="Issuing institution"
              value={result.credential.university || 'Attestify Issuer'}
            />

            <InfoItem
              icon={Calendar}
              label="Date issued"
              value={result.credential.issueDate ? new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            />

            <InfoItem
              icon={Activity}
              label="Credential status"
              value={result.credential.isRevoked ? 'Revoked' : 'Active and verified'}
              highlight={!result.credential.isRevoked}
            />

            <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-[#F2F4F7]">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
                <Hash className="w-3.5 h-3.5" />
                <span>Recipient wallet address</span>
              </div>
              <div className="p-3 bg-[#F8F9FA] border border-stone-200/80 rounded-xl font-mono text-xs text-stone-800 break-all select-all">
                {result.credential.studentWalletAddress}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.02)]">
          <p className="text-sm text-stone-500 font-medium">{result.message || 'No record found with this identifier.'}</p>
        </div>
      )}

      {isRevoked && result.credential && (
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Revocation summary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 pt-2 border-t border-rose-200/60">
            <div>
              <span className="text-stone-500 block mb-0.5">Date revoked</span>
              <span className="font-mono font-medium text-stone-900">
                {result.credential.revokedAt ? new Date(result.credential.revokedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block mb-0.5">Reason</span>
              <span className="font-medium text-stone-900">
                {result.credential.revocationReason || 'Canceled by issuer'}
              </span>
            </div>
          </div>
        </div>
      )}

      {result.credential?.transactionHash && (
        <div className="flex justify-center pt-2">
          <a
            href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EAECF0] hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span>View transaction on Sepolia Etherscan</span>
          </a>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, highlight = false }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
      <Icon className="w-3.5 h-3.5 text-stone-400" />
      <span>{label}</span>
    </div>
    <p className={`text-sm font-semibold pl-5 ${highlight ? 'text-emerald-700' : 'text-stone-900'}`}>
      {value}
    </p>
  </div>
);

export default VerificationResult;
