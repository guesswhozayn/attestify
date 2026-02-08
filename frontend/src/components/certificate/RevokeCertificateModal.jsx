import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const RevokeCertificateModal = ({ isOpen, onClose, onSuccess, certificate }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await credentialAPI.revoke(certificate._id || certificate.id, reason);
      showNotification('Certificate revoked successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to revoke certificate', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revoke Credential" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start space-x-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500 shrink-0">
             <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-sm">
            <h4 className="font-bold text-red-300 mb-1">Permanent Action</h4>
            <p className="text-red-200/70 leading-relaxed">
              You are about to revoke a blockchain-verified credential. This action is 
              <span className="font-semibold text-red-300"> irreversible </span> 
              and will be permanently recorded in the public ledger.
            </p>
          </div>
        </div>

        {/* Reason Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Reason for Revocation
          </label>
          <div className="relative">
             <textarea
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition h-36 resize-none"
               placeholder="e.g. Issued in error, student misconduct..."
               required
               disabled={loading}
             />
             <div className="absolute bottom-3 right-3 text-xs text-gray-500">
               {reason.length} chars
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full justify-center bg-gray-800 hover:bg-gray-700 text-gray-300"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            className="w-full justify-center shadow-lg shadow-red-900/20"
            disabled={loading || !reason.trim()}
            loading={loading}
            icon={ShieldAlert}
          >
            Confirm Revocation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RevokeCertificateModal;
