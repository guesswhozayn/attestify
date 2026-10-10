import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const RevokeCredentialModal = ({ isOpen, onClose, onSuccess, credential }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await credentialAPI.revoke(credential._id || credential.id, reason);
      showNotification('Credential revoked successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to revoke credential', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revoke credential" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="bg-[#FDF0EE] border border-[#F7D4CF] rounded-2xl p-4 flex items-start space-x-3.5">
          <div className="p-2 bg-white rounded-xl text-[#9E2D2D] border border-[#F7D4CF] shrink-0">
             <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <h4 className="font-bold text-[#9E2D2D] mb-1">Permanent cryptographic revocation</h4>
            <p className="text-[#9E2D2D]/80 leading-relaxed text-xs">
              This action cannot be undone. Once revoked, this credential will be permanently marked invalid across all verification endpoints.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
            Reason for revocation
          </label>
          <div className="relative">
             <textarea
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl p-3.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400 focus:bg-white transition h-32 resize-none text-sm"
               placeholder="e.g. Issued in error, administrative cancellation..."
               required
               disabled={loading}
             />
             <div className="absolute bottom-2.5 right-3 text-[11px] text-stone-400">
               {reason.length} chars
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full justify-center bg-white hover:bg-stone-50 text-stone-700 border-stone-200 rounded-xl font-semibold text-sm"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm shadow-xs cursor-pointer"
            disabled={loading || !reason.trim()}
            loading={loading}
            icon={ShieldAlert}
          >
            Revoke credential
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RevokeCredentialModal;
