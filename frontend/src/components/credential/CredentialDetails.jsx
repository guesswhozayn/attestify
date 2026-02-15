import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import QRCodeDisplay from './QRCodeDisplay';
import { Download, ExternalLink, User, Calendar, Building, Hash, ShieldAlert, BadgeCheck, GraduationCap, Award, Shield, ShieldCheck, Copy, Check, Clock, Zap, Database } from 'lucide-react';
import VerificationSection from '../verification/VerificationSection';
import RevokeCredentialModal from './RevokeCredentialModal';
import SBTDetailsModal from './SBTDetailsModal';
import { useAuth } from '../../context/AuthContext';

const CredentialDetails = ({ isOpen, onClose, credential, onUpdate }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showSBTModal, setShowSBTModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { user } = useAuth();

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!credential) return null;

  const downloadCredential = () => {
    window.open(`https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}`, '_blank');
  };

  const viewOnEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/tx/${credential.transactionHash}`, '_blank');
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const headerGradient = credential.type === 'TRANSCRIPT' 
    ? 'from-indigo-900 via-purple-900 to-gray-900' 
    : 'from-emerald-900 via-teal-900 to-gray-900';

  const iconColor = credential.type === 'TRANSCRIPT' 
    ? 'text-indigo-400' 
    : 'text-emerald-400';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Credential Details" size="xl">
      <div className="space-y-6">
        
        {/* Hero Section */}
        <div className={`relative h-48 rounded-2xl bg-gradient-to-br ${headerGradient} overflow-hidden shadow-lg`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          
          {/* Decorative Blobs */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-[60px]"></div>

          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="flex items-end space-x-6">
              {/* Avatar or Logo */}
              <div className="w-24 h-24 rounded-2xl border-2 border-white/20 bg-black/30 backdrop-blur-md shadow-xl overflow-hidden flex-shrink-0 -mb-4 z-10 flex items-center justify-center">
                {credential.issuedBy?.issuerDetails?.branding && (credential.issuedBy.issuerDetails.branding.logo || credential.issuedBy.issuerDetails.branding.logoCID) ? (
                   <img 
                     src={credential.issuedBy.issuerDetails.branding.logo || `https://gateway.pinata.cloud/ipfs/${credential.issuedBy.issuerDetails.branding.logoCID}`}
                     alt="Issuer Logo"
                     className="w-full h-full object-contain p-1"
                   />
                ) : credential.studentImage ? (
                  <img 
                    src={credential.studentImage} 
                    alt={credential.studentName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <User className="w-10 h-10 text-white/60" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 pb-1 z-0">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md tracking-tight">{credential.studentName}</h2>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Hash className="w-4 h-4 opacity-60" />
                      <button 
                        onClick={() => copyToClipboard(credential._id, 'id')}
                        className="flex items-center space-x-2 font-mono bg-white/10 hover:bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-sm border border-white/10 transition-all group/id-copy"
                        title="Click to copy Credential ID"
                      >
                        <span>{credential._id}</span>
                        {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover/id-copy:opacity-100 transition-opacity" />}
                      </button>
                      <span className="text-white/40 mx-1">•</span>
                      <div className="flex items-center group/univ">
                        <Building className="w-4 h-4 mr-2 opacity-60 group-hover/univ:text-indigo-400 transition-colors" />
                        <span className="text-sm font-medium">{credential.university}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col gap-2 items-end">
                    <div className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-sm ${
                      credential.isRevoked ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {credential.isRevoked ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : (
                          <BadgeCheck className="w-5 h-5" />
                        )}
                        <span className="font-black tracking-[0.1em] text-xs uppercase">
                          {credential.isRevoked ? 'REVOKED' : 'VERIFIED'}
                        </span>
                      </div>
                    </div>

                    {credential.tokenId && (
                       <div 
                         onClick={() => setShowSBTModal(true)}
                         className="px-3 py-1.5 rounded-xl backdrop-blur-md border border-purple-500/30 bg-purple-500/20 text-purple-200 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all group/sbt-badge"
                       >
                          <div className="flex items-center space-x-2">
                             <Shield className="w-3.5 h-3.5 text-purple-300 group-hover/sbt-badge:animate-pulse" />
                             <span className="text-[10px] font-black tracking-[0.2em] uppercase">SOULBOUND TOKEN</span>
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
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                {credential.type === 'TRANSCRIPT' ? <GraduationCap className={`w-5 h-5 mr-3 ${iconColor}`} /> : <Award className={`w-5 h-5 mr-3 ${iconColor}`} />}
                {credential.type === 'TRANSCRIPT' ? 'Academic Record' : 'Certification Details'}
              </h3>
              
              {credential.type === 'TRANSCRIPT' && credential.transcriptData ? (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Academic Program</span>
                        <span className="text-white font-bold">{credential.transcriptData.program}</span>
                      </div>
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Department</span>
                        <span className="text-white font-bold">{credential.transcriptData.department}</span>
                      </div>
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">GPA Average</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{credential.transcriptData.cgpa}</span>
                      </div>
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Academic Session</span>
                        <span className="text-white font-bold tracking-tight">{credential.transcriptData.admissionYear} - {credential.transcriptData.graduationYear}</span>
                      </div>
                    </div>

                    {credential.transcriptData.courses?.length > 0 && (
                      <div className="border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/[0.03] text-gray-400 border-b border-white/10">
                            <tr>
                              <th className="px-4 py-3 font-medium">Code</th>
                              <th className="px-4 py-3 font-medium">Subject</th>
                              <th className="px-4 py-3 font-medium text-center">Credits</th>
                              <th className="px-4 py-3 font-medium text-right">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06]">
                            {credential.transcriptData.courses.map((course, i) => (
                              <tr key={i} className="hover:bg-white/[0.03] transition-colors">
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
              ) : credential.certificationData ? (
                 <div className="space-y-6">
                    <div className={`bg-white/[0.03] p-6 rounded-2xl border-l-4 ${credential.type === 'TRANSCRIPT' ? 'border-indigo-500' : 'border-emerald-500'} border-r border-t border-b border-white/5 backdrop-blur-sm`}>
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Registry Title</span>
                       <span className="text-2xl font-black text-white tracking-tight">{credential.certificationData.title}</span>
                       <p className="text-white/60 mt-3 text-sm leading-relaxed font-medium">{credential.certificationData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Proficiency Level</span>
                          <span className="text-white font-bold">{credential.certificationData.level || 'N/A'}</span>
                        </div>
                        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Valid Duration</span>
                          <span className="text-white font-bold">{credential.certificationData.duration || 'N/A'}</span>
                        </div>
                        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 backdrop-blur-sm text-center">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Acquired Score</span>
                          <span className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${credential.type === 'TRANSCRIPT' ? 'from-indigo-400 to-purple-500' : 'from-emerald-400 to-teal-500'}`}>
                            {credential.certificationData.score || 'N/A'}
                          </span>
                        </div>
                    </div>
                 </div>
              ) : (
                <div className="text-gray-500 text-center py-8">No specific details available.</div>
              )}
            </div>

            {/* On-Chain Proof Section */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-3 text-indigo-400" />
                  On-Chain Immutable Proof
                </h3>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVENET SECURED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Metadata */}
                <div className="space-y-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <Zap className="w-3 h-3 mr-2" /> Transaction Hash
                      </span>
                      <button 
                        onClick={() => copyToClipboard(credential.transactionHash, 'tx')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {copiedField === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 break-all">{credential.transactionHash}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center mb-1">
                        <Database className="w-3 h-3 mr-2" /> Block
                      </span>
                      <span className="text-white font-mono">{credential.blockNumber || 'Pending'}</span>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center mb-1">
                        <Clock className="w-3 h-3 mr-2" /> Gas Used
                      </span>
                      <span className="text-white font-mono">{credential.gasUsed || '0'} units</span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hashes */}
                <div className="space-y-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <Hash className="w-3 h-3 mr-2" /> Certificate Hash
                      </span>
                      <button 
                        onClick={() => copyToClipboard(credential.certificateHash, 'cert')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {copiedField === 'cert' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 break-all">{credential.certificateHash}</p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                        <ExternalLink className="w-3 h-3 mr-2" /> IPFS Content ID
                      </span>
                      <button 
                        onClick={() => copyToClipboard(credential.ipfsCID, 'ipfs')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {copiedField === 'ipfs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 break-all">{credential.ipfsCID}</p>
                  </div>
                </div>
              </div>

              {/* Stats & History Footer */}
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Total Verifications</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${credential.type === 'TRANSCRIPT' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`}></div>
                    <span className={`font-black text-xl text-transparent bg-clip-text bg-gradient-to-r ${credential.type === 'TRANSCRIPT' ? 'from-indigo-400 to-purple-400' : 'from-emerald-400 to-teal-400'}`}>
                      {credential.verificationCount || 0}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Last Cryptographic Check</span>
                  <div className="flex items-center gap-2 text-white/70 font-bold text-xs uppercase tracking-tight">
                    <Clock className="w-3.5 h-3.5 opacity-40" />
                    {formatDate(credential.lastVerifiedAt, true)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">On-Chain Cost</span>
                  <span className={`font-black text-lg ${credential.type === 'TRANSCRIPT' ? 'text-indigo-400' : 'text-emerald-400'} tracking-tight`}>
                    {credential.totalCost || '0.00'} <span className="text-[10px] opacity-50 ml-0.5">ETH</span>
                  </span>
                </div>
              </div>
            </div>
            
             {/* Metadata Info Bar */}
            <div className="bg-white/[0.03] rounded-xl p-4 flex items-center justify-between text-sm text-gray-400 border border-white/[0.08]">
               <div className="flex items-center space-x-6">
                 <div>
                   <span className="block text-xs uppercase tracking-wider text-gray-600 mb-0.5">Registry Entry Date</span>
                   <span className="text-gray-300 font-medium">{formatDate(credential.issueDate)}</span>
                 </div>
                 <div>
                   <span className="block text-xs uppercase tracking-wider text-gray-600 mb-0.5">Issuing Authority</span>
                   <span className="text-gray-300 font-medium">{credential.issuedBy?.name}</span>
                 </div>
               </div>
               <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500/80 font-mono text-xs">Cryptographically Sealed</span>
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
                 <QRCodeDisplay credentialId={credential._id} />
               </div>
            </div>

             {/* Verification Section Component */}
             <div className="h-auto">
               <VerificationSection certificate={credential} />
             </div>

             {credential.tokenId && (
               <div className="pt-2">
                 <button 
                   onClick={() => setShowSBTModal(true)}
                   className="w-full flex items-center justify-between p-4 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/30 rounded-xl transition-all group/sbt backdrop-blur-md"
                 >
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                       <ShieldCheck className="w-5 h-5 text-purple-400" />
                     </div>
                     <div className="text-left">
                       <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest leading-none mb-1">Soulbound Token</p>
                       <p className="text-xs font-semibold text-gray-300">Token ID: #{credential.tokenId}</p>
                     </div>
                   </div>
                   <ExternalLink className="w-4 h-4 text-gray-500 group-hover/sbt:text-purple-400 transition-colors" />
                 </button>
               </div>
             )}

            {/* Actions */}
              <div className="space-y-3 pt-2">
                {/* Branding Assets Display */}
                {(credential.issuedBy?.issuerDetails?.branding?.signature || credential.issuedBy?.issuerDetails?.branding?.signatureCID) && (
                   <div className="text-center py-4 border-t border-b border-white/10 mb-4">
                      <img 
                        src={credential.issuedBy.issuerDetails.branding.signature || `https://gateway.pinata.cloud/ipfs/${credential.issuedBy.issuerDetails.branding.signatureCID}`} 
                        alt="Issuer Signature" 
                        className="h-16 mx-auto mb-2 object-contain"
                      />
                      <p className="text-xs text-gray-500 font-medium">Issuer Signature</p>
                   </div>
                )}

              <Button
                onClick={downloadCredential}
                variant="primary"
                className="w-full justify-center py-3 text-base shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                icon={Download}
              >
                Download PDF
              </Button>
              
              <Button
                onClick={viewOnEtherscan}
                variant="outline"
                className="w-full justify-center py-3 border-white/10 hover:border-white/20"
                icon={ExternalLink}
              >
                View on Etherscan
              </Button>
              
              {['ISSUER', 'ADMIN'].includes(user?.role) && !credential.isRevoked && (
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

      <RevokeCredentialModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        credential={credential}
        onSuccess={() => {
          if (onUpdate) onUpdate();
          onClose(); 
        }}
      />

      <SBTDetailsModal 
        isOpen={showSBTModal}
        onClose={() => setShowSBTModal(false)}
        credential={credential}
      />
    </Modal>
  );
};

export default CredentialDetails;
