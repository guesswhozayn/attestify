import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { TriangleAlert, ShieldAlert } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Revoke Certificate" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
          <TriangleAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-red-200 mb-1">Warning: Irreversible Action</h4>
            <p className="text-red-300">
              Revoking a certificate will mark it as invalid on the blockchain. 
              This action cannot be undone and will be permanently recorded in the audit logs.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Revocation Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition h-32 resize-none"
            placeholder="Please provide a detailed reason for revocation..."
            required
            disabled={loading}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary" // Ideally danger variant if available, but primary is "green" usually. I'll stick to primary or customizable
            className="w-full !bg-red-600 hover:!bg-red-700"
            disabled={loading}
            loading={loading}
            icon={ShieldAlert}
          >
            Revoke Certificate
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RevokeCertificateModal;
