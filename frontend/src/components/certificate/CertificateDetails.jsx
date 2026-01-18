import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import QRCodeDisplay from './QRCodeDisplay';
import { Download, ExternalLink, User, Calendar, Building, Hash, ShieldAlert } from 'lucide-react';
import VerificationSection from '../verification/VerificationSection';
import RevokeCertificateModal from './RevokeCertificateModal';
import { useAuth } from '../../context/AuthContext';

const CertificateDetails = ({ isOpen, onClose, certificate, onUpdate }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const { user } = useAuth();

  if (!certificate) return null;

  const downloadCertificate = () => {
    window.open(`https://gateway.pinata.cloud/ipfs/${certificate.ipfsCID}`, '_blank');
  };



  const viewOnEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/tx/${certificate.transactionHash}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate Details" size="xl">
      <div className="space-y-8">
        {/* Certificate Image with Stats */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden">
            {certificate.studentImage ? (
              <img 
                src={certificate.studentImage} 
                alt={certificate.studentName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-32 h-32 text-white opacity-50" />
            )}
          </div>
          
          {/* Academic Performance Stats (if available) */}
          <div className="absolute right-4 top-4 space-y-4">
            {certificate.yearScores?.map((score, index) => (
              <div key={index} className="bg-gray-900 bg-opacity-90 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{score.percentage}%</div>
                <div className="text-xs text-gray-400">{score.year}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                CREATOR
              </h3>
              <div className="flex items-center space-x-3 bg-gray-900 rounded-lg p-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <div className="text-white font-medium">{certificate.issuedBy?.name || 'Admin'}</div>
                  <div className="text-gray-400 text-sm">{certificate.issuedBy?.email || 'admin@university.com'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">DETAILS</h3>
              <div className="space-y-3 bg-gray-900 rounded-lg p-4">
                <div className="flex items-start">
                  <User className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <span className="text-gray-400 text-sm">Student Name: </span>
                    <span className="text-white font-medium">{certificate.studentName}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Hash className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <span className="text-gray-400 text-sm">Student ID: </span>
                    <span className="text-white font-medium">{certificate.studentId}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <span className="text-gray-400 text-sm">University: </span>
                    <span className="text-white font-medium">{certificate.university}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <span className="text-gray-400 text-sm">Issued At: </span>
                    <span className="text-white font-medium">
                      {new Date(certificate.issueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <QRCodeDisplay studentId={certificate.studentId} />

            <div>
              <h3 className="text-white font-semibold mb-4">VIEW AND DOWNLOAD</h3>
              <div className="space-y-3">
                <Button
                  onClick={downloadCertificate}
                  variant="primary"
                  className="w-full"
                  icon={Download}
                >
                  View / Download Certificate
                </Button>
                <Button
                  onClick={viewOnEtherscan}
                  variant="outline"
                  className="w-full"
                  icon={ExternalLink}
                >
                  View Transaction on Etherscan
                </Button>
                
                {/* Admin Actions */}
                {['admin', 'super_admin'].includes(user?.role) && !certificate.isRevoked && (
                  <Button
                    onClick={() => setShowRevokeModal(true)}
                    variant="primary"
                    className="w-full !bg-red-500/10 !text-red-400 hover:!bg-red-500/20 border border-red-500/20"
                    icon={ShieldAlert}
                  >
                    Revoke Certificate
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Verification */}
          <VerificationSection certificate={certificate} />
        </div>
      </div>

      <RevokeCertificateModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        certificate={certificate}
        onSuccess={() => {
          if (onUpdate) onUpdate();
          onClose(); // Close details modal after revocation, or we could just refresh the details.
          // For now, closing details seems safer to force refresh on grid.
        }}
      />
    </Modal>
  );
};

export default CertificateDetails;
