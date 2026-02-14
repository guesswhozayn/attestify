import React from 'react';
import CredentialCard from './CredentialCard';
import { FileText } from 'lucide-react';

const CredentialGrid = ({ credentials, onCredentialClick, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading credentials...</p>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/[0.06] border-dashed rounded-3xl text-center">
        <div className="w-20 h-20 bg-gray-800/80 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-800/40">
            <FileText className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-white font-semibold text-lg mb-1">No Credentials Found</p>
        <p className="text-gray-500 text-sm">Issue your first credential to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {credentials.map((cred) => (
        <CredentialCard
          key={cred._id || cred.id}
          credential={cred}
          onClick={() => onCredentialClick(cred)}
        />
      ))}
    </div>
  );
};

export default CredentialGrid;
