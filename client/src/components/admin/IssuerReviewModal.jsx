import Modal from '../shared/Modal';
import Button from '../shared/Button';
import {
  Building,
  Hash,
  Mail,
  Wallet,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

const IssuerReviewModal = ({
  isOpen,
  onClose,
  issuer,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onSyncBlockchain,
  loading
}) => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const isDark = theme === 'dark';

  if (!issuer) return null;

  const wallet = issuer.authorizedWalletAddress || issuer.walletAddress;

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification(`${label} copied to clipboard`, 'success');
  };

  const getStatusBadge = () => {
    switch (issuer.status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <XCircle className="w-3.5 h-3.5 text-amber-600" />
            Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issuer Details" size="lg">
      <div className="space-y-6">
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDark ? 'bg-stone-900/50 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border ${
              isDark ? 'bg-[#181920] border-white/10 text-white' : 'bg-white border-[#EAECF0] text-stone-900 shadow-2xs'
            }`}>
              {issuer.institutionName?.charAt(0) || <Building className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                {issuer.institutionName}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                {issuer.university || 'Institution'}
              </p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              Registration Number
            </span>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-stone-400" />
              <span className={`text-sm font-mono font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {issuer.registrationNumber}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              Email
            </span>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-400" />
              <span className={`text-sm truncate font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {issuer.email}
              </span>
            </div>
          </div>

          <div className={`sm:col-span-2 p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              Wallet
            </span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Wallet className="w-4 h-4 text-stone-400 shrink-0" />
                <span className={`text-xs font-mono truncate select-all ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  {wallet || 'None'}
                </span>
              </div>
              {wallet && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(wallet, 'Wallet address')}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isDark ? 'border-white/10 hover:bg-stone-800 text-stone-300' : 'border-stone-200 hover:bg-stone-200 text-stone-600'
                    }`}
                    title="Copy wallet address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://sepolia.etherscan.io/address/${wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isDark ? 'border-white/10 hover:bg-stone-800 text-stone-300' : 'border-stone-200 hover:bg-stone-200 text-stone-600'
                    }`}
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              Contract Status
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${issuer.onChainAuthorized || issuer.onChainAuthorizationTx ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className={`text-xs font-semibold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                {issuer.onChainAuthorized
                  ? 'Authorized'
                  : issuer.onChainAuthorizationTx
                  ? 'Confirmed'
                  : 'Pending sync'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              Credentials Issued
            </span>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-stone-400" />
              <span className={`text-sm font-bold tabular-nums ${isDark ? 'text-white' : 'text-stone-900'}`}>
                {issuer.totalCredentialsIssued}
              </span>
            </div>
          </div>
        </div>

        {issuer.rejectionReason && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <span className="font-bold block uppercase tracking-wider text-[10px]">Rejection Reason</span>
            <p>{issuer.rejectionReason}</p>
          </div>
        )}

        {issuer.suspensionReason && (
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className="font-bold block uppercase tracking-wider text-[10px]">Suspension Reason</span>
            <p>{issuer.suspensionReason}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAECF0]">
          <div>
            {wallet && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSyncBlockchain(issuer.id)}
                disabled={loading}
              >
                Sync Contract
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {issuer.status === 'PENDING' && (
              <>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onReject(issuer)}
                  disabled={loading}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  onClick={() => onApprove(issuer.id)}
                  disabled={loading}
                >
                  Approve
                </Button>
              </>
            )}

            {issuer.status === 'VERIFIED' && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onSuspend(issuer)}
                disabled={loading}
              >
                Suspend
              </Button>
            )}

            {issuer.status === 'SUSPENDED' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={loading}
                onClick={() => onReactivate(issuer.id)}
                disabled={loading}
              >
                Reactivate
              </Button>
            )}

            {issuer.status === 'REJECTED' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={loading}
                onClick={() => onApprove(issuer.id)}
                disabled={loading}
              >
                Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IssuerReviewModal;
