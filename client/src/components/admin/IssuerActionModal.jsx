import { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const IssuerActionModal = ({ isOpen, onClose, issuer, actionType, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!issuer) return null;

  const isReject = actionType === 'reject';
  const title = isReject ? 'Reject Issuer Application' : 'Suspend Issuer Account';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isReject
            ? isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-900'
            : isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {isReject ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-sm">
              {isReject ? 'Application Rejection' : 'Account Suspension'}
            </p>
            <p className="opacity-90 leading-relaxed">
              {isReject
                ? `You are rejecting the registration application for "${issuer.institutionName}". The institution will be notified and cannot issue credentials.`
                : `You are suspending "${issuer.institutionName}". This will disable account access and revoke their on-chain issuance authorization.`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="action-reason"
            className={`block text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
          >
            Reason for {isReject ? 'rejection' : 'suspension'} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="action-reason"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isReject
                ? 'State the reason (e.g. invalid accreditation documentation, unverified identity)...'
                : 'State the administrative reason for suspending this account...'
            }
            className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-colors resize-none ${
              isDark
                ? 'bg-stone-900/60 border-white/10 text-white placeholder-stone-500 focus:border-white/30'
                : 'bg-stone-50 border-[#EAECF0] text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:bg-white'
            }`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            loading={loading}
            disabled={loading || !reason.trim()}
          >
            {isReject ? 'Confirm Rejection' : 'Confirm Suspension'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IssuerActionModal;

