import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CredentialTable from '../components/credential/CredentialTable';
import CredentialDetails from '../components/credential/CredentialDetails';
import { credentialAPI } from '../services/api';
import { AlertTriangle, FileWarning, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white overflow-x-hidden font-sans relative pb-20">
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6 relative z-10">

        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Revoked Credentials
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Canceled credentials that are no longer valid.
            </p>
          </div>
        </motion.div>

        {/* Alert Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">Canceled Certificates</h2>
              <p className="text-xs text-stone-500 leading-relaxed max-w-2xl mt-0.5">
                Revocations are permanent. Anyone who verifies these records will see that they have been revoked.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 shrink-0">
            <div className="text-3xl font-bold text-stone-900 font-mono tracking-tight">{credentials.length}</div>
            <span className="text-xs text-stone-500 font-medium mt-1">
              Total revoked
            </span>
          </div>
        </motion.div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="min-h-[300px]">
            <CredentialTable
              credentials={credentials}
              onView={setSelectedCredential}
              loading={loading}
            />
          </div>
        </motion.div>
      </main>

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
