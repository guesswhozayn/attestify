import React from 'react';
import { FileText, User, Calendar } from 'lucide-react';

const CertificateCard = ({ certificate, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition transform hover:scale-105"
    >
      <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center relative">
        {certificate.studentImage ? (
          <img 
            src={certificate.studentImage} 
            alt={certificate.studentName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-20 h-20 text-white opacity-50" />
        )}
        {certificate.isRevoked && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
            <span className="text-white font-bold text-xl">REVOKED</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
          <FileText className="w-4 h-4" />
          <span>{certificate.university}</span>
        </div>
        
        <h3 className="text-white font-semibold text-lg mb-1 truncate">
          {certificate.studentName}
        </h3>
        
        <p className="text-gray-400 text-sm mb-3">
          ID: {certificate.registrationNumber}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
            <span className="text-xs text-gray-400">by {certificate.creator || 'Admin'}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
