import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CredentialTable from '../components/credential/CredentialTable';
import CredentialDetails from '../components/credential/CredentialDetails';
import { credentialAPI } from '../services/api';
import { ShieldAlert, AlertTriangle, FileWarning } from 'lucide-react';

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
    <div className="min-h-screen bg-transparent text-stone-900 selection:bg-stone-200 overflow-x-hidden font-sans relative pb-20">
      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[#FDF0EE] border border-[#F7D4CF] rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-[0_4px_24px_-4px_rgba(28,25,23,0.03)]"
        >
           <div className="p-4 bg-white/80 rounded-2xl border border-[#F7D4CF] text-[#9E2D2D] shrink-0 relative z-10 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
           </div>

           <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-stone-900 mb-2 tracking-tight">Revoked credentials</h2>
              <p className="text-stone-600 max-w-2xl text-base leading-relaxed">
                 These credentials were canceled by your institution. They are permanently marked as revoked on the cryptographic ledger and cannot be re-validated.
              </p>
           </div>

           <div className="text-center md:text-right relative z-10 min-w-[150px]">
              <div className="text-5xl font-bold text-stone-900 mb-1">{credentials.length}</div>
              <div className="text-xs text-[#9E2D2D] font-bold uppercase tracking-wider border border-[#F7D4CF] px-3 py-1 rounded-full bg-white inline-block">Total revoked</div>
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="space-y-6"
        >
           <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-4 px-2">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-stone-100 rounded-xl border border-stone-200">
                    <FileWarning className="w-5 h-5 text-stone-700" />
                 </div>
                 <h3 className="text-xl font-bold text-stone-900 tracking-tight">Revoked registry</h3>
              </div>
           </div>

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
