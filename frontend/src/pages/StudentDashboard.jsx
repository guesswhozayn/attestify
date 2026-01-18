import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import { useAuth } from '../context/AuthContext';
import { credentialAPI } from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentCertificates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudentCertificates = async () => {
    try {
      const response = await credentialAPI.getAll({ studentId: user.studentId });
      setCertificates(response.data.credentials);
    } catch (error) {
      console.error('Failed to fetch certificates', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="My Credentials" showSearch={false} />

      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Your Certificates</h2>
          <p className="text-gray-400">
            View, download, and share your verified academic credentials
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

export default StudentDashboard;
