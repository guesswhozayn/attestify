import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CredentialGrid from '../components/credential/CredentialGrid';
import CredentialDetails from '../components/credential/CredentialDetails';
import { credentialAPI } from '../services/api';
import { ShieldAlert, AlertTriangle, FileWarning, Search } from 'lucide-react';

const RevokedCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchRevokedCredentials();
    return () => { isMounted.current = false; };
  }, []);

  const fetchRevokedCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.getAll({ revoked: true });
      if (isMounted.current) {
          const revoked = response.data.credentials?.filter(c => c.isRevoked) || [];
          setCredentials(revoked);
      }
    } catch (error) {
      if (isMounted.current) {
          console.error('Failed to fetch revoked credentials', error);
      }
    } finally {
      if (isMounted.current) {
          setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 pb-20">

      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-red-900/10 border border-red-500/20 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden backdrop-blur-xl"
        >
           {/* Decorative elements */}
           <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none"></div>
           <div className="absolute -right-10 -top-10 text-red-500/5 rotate-12">
               <ShieldAlert className="w-80 h-80" />
           </div>
           
           <div className="p-5 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 flex-shrink-0 relative z-10 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-10 h-10" />
           </div>
           
           <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Revocation Registry</h2>
              <p className="text-red-200/80 max-w-2xl text-lg leading-relaxed">
                 These credentials have been permanently invalidated by the institution. They are no longer considered valid proof of qualification and will appear as "Revoked" during verification.
              </p>
           </div>
           
           <div className="text-center md:text-right relative z-10 min-w-[150px]">
              <div className="text-5xl font-bold text-white mb-1 drop-shadow-lg">{credentials.length}</div>
              <div className="text-xs text-red-400 font-bold uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full bg-red-500/10 inline-block">Revoked Items</div>
           </div>
        </motion.div>

        {/* List Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="space-y-6"
        >
           <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-red-500/10 rounded-lg">
                    <FileWarning className="w-5 h-5 text-red-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight">Revoked List</h3>
              </div>
           </div>
           
           <div className="min-h-[300px]">
               <CredentialGrid
                 credentials={credentials}
                 onCredentialClick={setSelectedCredential}
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
