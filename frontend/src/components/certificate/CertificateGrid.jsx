import React from 'react';
import CertificateCard from './CertificateCard';
import { FileText } from 'lucide-react';

const CertificateGrid = ({ certificates, onCertificateClick, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="text-gray-400 mt-4">Loading certificates...</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No certificates found</p>
        <p className="text-gray-500 text-sm mt-2">Upload your first certificate to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {certificates.map((cert) => (
        <CertificateCard
          key={cert._id || cert.id}
          certificate={cert}
          onClick={() => onCertificateClick(cert)}
        />
      ))}
    </div>
  );
};

export default CertificateGrid;
