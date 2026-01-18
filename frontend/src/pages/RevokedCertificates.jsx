import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import { credentialAPI } from '../services/api';

const RevokedCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevokedCertificates();
  }, []);

  const fetchRevokedCertificates = async () => {
    try {
      const response = await credentialAPI.getAll({ revoked: true });
      setCertificates(response.data.credentials);
    } catch (error) {
      console.error('Failed to fetch revoked certificates', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Revoked Certificates" showSearch={false} />

      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Revoked Certificates</h2>
          <p className="text-gray-400">
            View all certificates that have been revoked
          </p>
        </div>

        <CertificateGrid
          certificates={certificates}
          onCertificateClick={setSelectedCertificate}
          loading={loading}
        />
      </div>

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
