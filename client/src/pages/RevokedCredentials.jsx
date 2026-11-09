import { useState, useEffect, useCallback } from 'react';
import CredentialTable from '../components/credential/CredentialTable';
import CredentialDetails from '../components/credential/CredentialDetails';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { AlertTriangle } from 'lucide-react';

const RevokedCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [totalRevoked, setTotalRevoked] = useState(0);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchRevoked = useCallback(async () => {
    try {
      const response = await credentialAPI.getAll({ revoked: 'true', limit: 100 });
      const list = response.data.credentials || [];
      setCredentials(list);
      setTotalRevoked(response.data.pagination?.total ?? list.length);
    } catch (error) {
      if (error.response?.status !== 401) {
        showNotification('Failed to fetch revoked credentials', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchRevoked();
    window.addEventListener('credentials-updated', fetchRevoked);
    return () => window.removeEventListener('credentials-updated', fetchRevoked);
  }, [fetchRevoked]);

  return (
    <div className="w-full text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Revoked credentials
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Invalidated certificates that fail verification.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{totalRevoked} revoked</span>
        </div>
      </div>

      <div className="min-h-[300px]">
        <CredentialTable
          credentials={credentials}
          onView={setSelectedCredential}
          loading={loading}
        />
      </div>

      {selectedCredential && (
        <CredentialDetails
          isOpen={!!selectedCredential}
          onClose={() => setSelectedCredential(null)}
          credential={selectedCredential}
        />
      )}
    </div>
  );
};

export default RevokedCredentials;
