import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import QRCodeDisplay from './QRCodeDisplay';
import { Download, ExternalLink, User, Calendar, Building, Hash, ShieldAlert, BadgeCheck, GraduationCap, Award, Shield, ShieldCheck } from 'lucide-react';
import VerificationSection from '../verification/VerificationSection';
import RevokeCertificateModal from './RevokeCertificateModal';
import SBTDetailsModal from './SBTDetailsModal';
import { useAuth } from '../../context/AuthContext';

const CertificateDetails = ({ isOpen, onClose, certificate, onUpdate }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showSBTModal, setShowSBTModal] = useState(false);
  const { user } = useAuth(); // Assuming 'user' is the current logged-in user viewing the modal

  if (!certificate) return null;

  const downloadCertificate = () => {
    window.open(`https://gateway.pinata.cloud/ipfs/${certificate.ipfsCID}`, '_blank');
  };

  const viewOnEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/tx/${certificate.transactionHash}`, '_blank');
  };

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine gradient based on type
  const headerGradient = certificate.type === 'TRANSCRIPT' 
    ? 'from-blue-600 to-cyan-500' 
    : 'from-emerald-500 to-teal-500';

  const iconColor = certificate.type === 'TRANSCRIPT' 
    ? 'text-cyan-400' 
    : 'text-emerald-400';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certificate Details" size="xl">
      <div className="space-y-6">
        
        {/* Hero Section */}
        <div className={`relative h-48 rounded-2xl bg-gradient-to-r ${headerGradient} overflow-hidden shadow-lg`}>
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Decorative Circles */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="flex items-end space-x-6">
              {/* Avatar or Logo */}
              <div className="w-24 h-24 rounded-full border-4 border-gray-800 bg-white shadow-xl overflow-hidden flex-shrink-0 -mb-4 z-10 flex items-center justify-center">
                {certificate.issuedBy?.instituteDetails?.branding && (certificate.issuedBy.instituteDetails.branding.logo || certificate.issuedBy.instituteDetails.branding.logoCID) ? (
                   <img 
                     src={certificate.issuedBy.instituteDetails.branding.logo || `https://gateway.pinata.cloud/ipfs/${certificate.issuedBy.instituteDetails.branding.logoCID}`}
                     alt="Institute Logo"
                     className="w-full h-full object-contain p-1"
                   />
                ) : certificate.studentImage ? (
                  <img 
                    src={certificate.studentImage} 
                    alt={certificate.studentName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 pb-1 z-0">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{certificate.studentName}</h2>
                    <div className="flex items-center space-x-2 text-white/90">
                      <Hash className="w-4 h-4 opacity-75" />
                      <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm backdrop-blur-sm" title="Credential ID">
                        {certificate._id}
                      </span>
                      <span className="text-white/60 mx-1">•</span>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1 opacity-75" />
                        <span className="text-sm">{certificate.university}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex flex-col gap-2 items-end">
                    <div className={`px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${
                      certificate.isRevoked ? 'bg-red-500/20 text-red-100' : 'bg-white/20 text-white'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {certificate.isRevoked ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : (
                          <BadgeCheck className="w-5 h-5" />
                        )}
                        <span className="font-semibold tracking-wide text-sm">
                          {certificate.isRevoked ? 'REVOKED' : 'VERIFIED'}
                        </span>
                      </div>
                    </div>

                    {/* Soulbound Badge */}
                    {certificate.tokenId && (
                       <div className="px-3 py-1 rounded-full backdrop-blur-md border border-purple-500/30 bg-purple-500/20 text-purple-100 shadow-sm">
                          <div className="flex items-center space-x-1.5">
                             <Shield className="w-3 h-3 text-purple-300" />
                             <span className="text-xs font-medium tracking-wide">SOULBOUND</span>
                         </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* LEFT COLUMN: Details (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details Card */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                {certificate.type === 'TRANSCRIPT' ? <GraduationCap className={`w-5 h-5 mr-3 ${iconColor}`} /> : <Award className={`w-5 h-5 mr-3 ${iconColor}`} />}
                {certificate.type === 'TRANSCRIPT' ? 'Academic Record' : 'Certification Details'}
              </h3>
              
              {/* Dynamic Content based on Type */}
              {certificate.type === 'TRANSCRIPT' && certificate.transcriptData ? (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Program</span>
                        <span className="text-white font-medium">{certificate.transcriptData.program}</span>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Department</span>
                        <span className="text-white font-medium">{certificate.transcriptData.department}</span>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">CGPA</span>
                        <span className="text-2xl font-bold text-emerald-400">{certificate.transcriptData.cgpa}</span>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Session</span>
                        <span className="text-white">{certificate.transcriptData.admissionYear} - {certificate.transcriptData.graduationYear}</span>
                      </div>
                    </div>

                    {/* Courses Table */}
                    {certificate.transcriptData.courses?.length > 0 && (
                      <div className="border border-gray-700/50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-700/50">
                            <tr>
                              <th className="px-4 py-3 font-medium">Code</th>
                              <th className="px-4 py-3 font-medium">Subject</th>
                              <th className="px-4 py-3 font-medium text-center">Credits</th>
                              <th className="px-4 py-3 font-medium text-right">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {certificate.transcriptData.courses.map((course, i) => (
                              <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{course.code}</td>
                                <td className="px-4 py-3 text-white">{course.name}</td>
                                <td className="px-4 py-3 text-gray-300 text-center">{course.credits}</td>
                                <td className="px-4 py-3 text-emerald-400 font-bold text-right">{course.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                 </div>
              ) : certificate.certificationData ? (
                 <div className="space-y-6">
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-emerald-500">
                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Title</span>
                       <span className="text-xl font-bold text-white">{certificate.certificationData.title}</span>
                       <p className="text-gray-400 mt-2 text-sm leading-relaxed">{certificate.certificationData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                          <span className="text-xs text-gray-500 block mb-1">Level</span>
                          <span className="text-white font-medium">{certificate.certificationData.level || '-'}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                          <span className="text-xs text-gray-500 block mb-1">Duration</span>
                          <span className="text-white font-medium">{certificate.certificationData.duration || '-'}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                          <span className="text-xs text-gray-500 block mb-1">Score</span>
                          <span className="text-emerald-400 font-bold">{certificate.certificationData.score || '-'}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                          <span className="text-xs text-gray-500 block mb-1">Expiry</span>
                          <span className="text-white font-medium">
                            {certificate.certificationData.expiryDate 
                              ? formatDate(certificate.certificationData.expiryDate)
                              : 'None'}
                          </span>
                        </div>
                    </div>
                 </div>
              ) : (
                <div className="text-gray-500 text-center py-8">No specific details available.</div>
              )}
            </div>
            
             {/* Metadata Footer */}
            <div className="bg-gray-800/30 rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 border border-gray-700/30">
               <div className="flex items-center space-x-6">
                 <div>
                   <span className="block text-xs uppercase tracking-wider text-gray-600 mb-0.5">Issued On</span>
                   <span className="text-gray-300 font-medium">{formatDate(certificate.issueDate)}</span>
                 </div>
                 <div>
                   <span className="block text-xs uppercase tracking-wider text-gray-600 mb-0.5">Issuer</span>
                   <span className="text-gray-300 font-medium">{certificate.issuedBy?.name}</span>
                 </div>
                 {certificate.tokenId && (
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-600 mb-0.5">Token ID</span>
                        <span className="text-purple-400 font-mono font-medium">#{certificate.tokenId}</span>
                    </div>
                 )}
               </div>
               <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-500/80 font-mono text-xs">Blockchain Secured</span>
                  </div>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar (Span 1) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* QR Code Card */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg text-xs font-medium text-gray-500">
                 Scan to Verify
               </div>
               <div className="p-2 transition-transform duration-300 group-hover:scale-105">
                 <QRCodeDisplay credentialId={certificate._id} />
               </div>
            </div>

             {/* Verification Section Component */}
             <div className="h-auto">
               <VerificationSection certificate={certificate} />
             </div>

             {certificate.tokenId && (
               <div className="pt-2">
                 <button 
                   onClick={() => setShowSBTModal(true)}
                   className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all group"
                 >
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/10 rounded-lg">
                       <ShieldCheck className="w-5 h-5 text-blue-600" />
                     </div>
                     <div className="text-left">
                       <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none mb-1 text-shadow-glow">Soulbound Token</p>
                       <p className="text-xs font-semibold text-gray-700">Token ID: #{certificate.tokenId}</p>
                     </div>
                   </div>
                   <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                 </button>
               </div>
             )}

            {/* Actions */}
              <div className="space-y-3 pt-2">
                {/* Branding Assets Display */}
                {(certificate.issuedBy?.instituteDetails?.branding?.signature || certificate.issuedBy?.instituteDetails?.branding?.signatureCID) && (
                   <div className="text-center py-4 border-t border-b border-gray-100 mb-4">
                      <img 
                        src={certificate.issuedBy.instituteDetails.branding.signature || `https://gateway.pinata.cloud/ipfs/${certificate.issuedBy.instituteDetails.branding.signatureCID}`} 
                        alt="Authorized Signature" 
                        className="h-16 mx-auto mb-2 object-contain"
                      />
                      <p className="text-xs text-gray-500 font-medium">Authorized Signature</p>
                   </div>
                )}

              <Button
                onClick={downloadCertificate}
                variant="primary"
                className="w-full justify-center py-3 text-base shadow-lg shadow-blue-500/20"
                icon={Download}
              >
                Download PDF
              </Button>
              
              <Button
                onClick={viewOnEtherscan}
                variant="outline"
                className="w-full justify-center py-3 border-gray-700 hover:bg-gray-800"
                icon={ExternalLink}
              >
                View on Etherscan
              </Button>
              
              {/* Revoke Button (Admin only) */}
              {['INSTITUTE', 'ADMIN'].includes(user?.role) && !certificate.isRevoked && (
                <Button
                  onClick={() => setShowRevokeModal(true)}
                  variant="danger"
                  className="w-full justify-center py-3 mt-4 opacity-80 hover:opacity-100 transition-opacity"
                  icon={ShieldAlert}
                >
                  Revoke Credential
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      <RevokeCertificateModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        certificate={certificate}
        onSuccess={() => {
          if (onUpdate) onUpdate();
          onClose(); 
        }}
      />

      <SBTDetailsModal 
        isOpen={showSBTModal}
        onClose={() => setShowSBTModal(false)}
        credential={certificate}
      />
    </Modal>
  );
};

export default CertificateDetails;
