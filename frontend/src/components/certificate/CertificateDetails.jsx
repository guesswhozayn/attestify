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

            {/* Type Specific Details */}
            {certificate.type === 'TRANSCRIPT' && certificate.transcriptData && (
              <div>
                <h3 className="text-white font-semibold mb-4">ACADEMIC RECORD</h3>
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block">Program</span>
                      <span className="text-white font-medium">{certificate.transcriptData.program}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Department</span>
                      <span className="text-white font-medium">{certificate.transcriptData.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">CGPA</span>
                      <span className="text-white font-medium">{certificate.transcriptData.cgpa}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Year</span>
                      <span className="text-white font-medium">
                        {certificate.transcriptData.admissionYear} - {certificate.transcriptData.graduationYear}
                      </span>
                    </div>
                  </div>

                  {certificate.transcriptData.courses?.length > 0 && (
                    <div className="border-t border-gray-800 pt-3">
                      <span className="text-gray-400 text-sm block mb-2">Courses</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-gray-500 border-b border-gray-800">
                            <tr>
                              <th className="pb-2">Code</th>
                              <th className="pb-2">Subject</th>
                              <th className="pb-2">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="text-white">
                            {certificate.transcriptData.courses.map((course, i) => (
                              <tr key={i} className="border-b border-gray-800/50 last:border-0">
                                <td className="py-2 text-gray-400">{course.code}</td>
                                <td className="py-2">{course.name}</td>
                                <td className="py-2 font-medium text-green-400">{course.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {certificate.type === 'CERTIFICATION' && certificate.certificationData && (
              <div>
                <h3 className="text-white font-semibold mb-4">CERTIFICATION DETAILS</h3>
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm block">Title</span>
                    <span className="text-white font-medium text-lg">{certificate.certificationData.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm block">Description</span>
                    <p className="text-gray-300 text-sm mt-1">{certificate.certificationData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div>
                      <span className="text-gray-400 block">Level</span>
                      <span className="text-white">{certificate.certificationData.level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Duration</span>
                      <span className="text-white">{certificate.certificationData.duration || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Score</span>
                      <span className="text-white">{certificate.certificationData.score || 'N/A'}</span>
                    </div>
                     <div>
                      <span className="text-gray-400 block">Expiry</span>
                      <span className="text-white">
                        {certificate.certificationData.expiryDate 
                          ? new Date(certificate.certificationData.expiryDate).toLocaleDateString() 
                          : 'Valid Forever'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  View / Download {certificate.type === 'TRANSCRIPT' ? 'Transcript' : 'Certificate'}
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
                {['INSTITUTE'].includes(user?.role) && !certificate.isRevoked && (
                  <Button
                    onClick={() => setShowRevokeModal(true)}
                    variant="danger"
                    className="w-full"
                    icon={ShieldAlert}
                  >
                    Revoke Credential
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
