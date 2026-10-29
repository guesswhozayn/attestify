import { useState, useEffect } from 'react';
import CredentialTable from '../components/credential/CredentialTable';
import CredentialDetails from '../components/credential/CredentialDetails';
import { credentialAPI } from '../services/api';
import { AlertTriangle } from 'lucide-react';

const RevokedCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    credentialAPI.getAll({ revoked: 'true' })
      .then((response) => {
        if (active) setCredentials(response.data.credentials || []);
      })
      .catch((error) => {
        console.error('Failed to fetch revoked credentials', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="w-full bg-[#F8F9FA] text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Revoked Credentials
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Canceled credentials that will fail verification checks.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{credentials.length} Revoked</span>
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
