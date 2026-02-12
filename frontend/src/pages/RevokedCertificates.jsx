import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import { credentialAPI } from '../services/api';
import { ShieldAlert, AlertTriangle, FileWarning } from 'lucide-react';

const RevokedCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchRevokedCertificates();
    return () => { isMounted.current = false; };
  }, []);

  const fetchRevokedCertificates = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.getAll({ revoked: true });
      if (isMounted.current) {
          const revoked = response.data.credentials?.filter(c => c.isRevoked) || [];
          setCertificates(revoked);
      }
    } catch (error) {
      if (isMounted.current) {
          console.error('Failed to fetch revoked certificates', error);
      }
    } finally {
      if (isMounted.current) {
          setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header title="Revoked Certificates" showSearch={false} />

      <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Warning Banner */}
        <div className="bg-red-900/10 border border-red-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldAlert className="w-64 h-64 text-red-500" />
           </div>
           
           <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 flex-shrink-0">
              <AlertTriangle className="w-8 h-8" />
           </div>
           
           <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Revocation Registry</h2>
              <p className="text-gray-400 max-w-2xl">
                 These certificates have been officially invalidated by the institution. They are no longer considered valid proof of qualification and will appear as "Revoked" during verification.
              </p>
           </div>
           
           <div className="text-center md:text-right relative z-10">
              <div className="text-3xl font-bold text-red-400">{certificates.length}</div>
              <div className="text-sm text-red-300/60 uppercase tracking-wider font-medium">Revoked Items</div>
           </div>
        </div>

        {/* List Section */}
        <div>
           <div className="flex items-center space-x-2 mb-6">
              <FileWarning className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-200">Revoked List</h3>
           </div>
           
           <CertificateGrid
             certificates={certificates}
             onCertificateClick={setSelectedCertificate}
             loading={loading}
           />
        </div>
      </main>

      {selectedCertificate && (
        <CertificateDetails
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
    </div>
  );
};

export default RevokedCertificates;
