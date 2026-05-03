import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import QRCodeDisplay from './QRCodeDisplay';
import { fileAPI } from '../../services/api';
import { Download, ExternalLink, User, Building, Hash, ShieldAlert, GraduationCap, Award, Shield, ShieldCheck, Copy, Check, Database, Loader2 } from 'lucide-react';
import VerificationSection from '../verification/VerificationSection';
import RevokeCredentialModal from './RevokeCredentialModal';
import SBTDetailsModal from './SBTDetailsModal';
import { useAuth } from '../../context/AuthContext';

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

const CredentialDetails = React.memo(({ isOpen, onClose, credential, onUpdate }) => {
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showSBTModal, setShowSBTModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { user } = useAuth();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const copyToClipboard = useCallback((text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCredential = useCallback(async () => {
    if (!credential) return;
    setIsDownloading(true);
    try {
      const response = await fileAPI.downloadCertificate(credential._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Certificate_${credential.studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2)
            filename = filenameMatch[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed, falling back to direct IPFS link', error);
      window.open(`https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  }, [credential]);

  const viewOnEtherscan = useCallback(() => {
    if (!credential) return;
    window.open(`https://sepolia.etherscan.io/tx/${credential.transactionHash}`, '_blank');
  }, [credential]);

  // Hook declarations complete, now early return if no credential
  if (!credential) return null;

  const displayMetadata = credential.type === 'TRANSCRIPT' ? credential.transcriptData : credential.certificationData;
  const isSBT = !!credential.tokenId;



  const iconColor = credential.type === 'TRANSCRIPT' 
    ? 'text-indigo-400' 
    : 'text-emerald-400';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identity Registry Detail" size="2xl">
      <div className="space-y-8 pb-4">
        
        {/* Spotlight-enhanced Header */}
        <div 
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/[0.08] p-8 md:p-10 backdrop-blur-3xl group"
        >
          {/* Spotlight Effect */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`
            }}
          />

          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* High-fidelity Avatar */}
            <div className="relative shrink-0 group/avatar">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500"></div>
              <div className="w-32 h-32 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center shrink-0 shadow-2xl overflow-hidden relative z-10 p-1">
                <div className="w-full h-full rounded-full bg-white/[0.03] flex items-center justify-center overflow-hidden">
                  {credential.issuedBy?.issuerDetails?.branding && (credential.issuedBy.issuerDetails.branding.logo || credential.issuedBy.issuerDetails.branding.logoCID) ? (
                    <img 
                      src={credential.issuedBy.issuerDetails.branding.logo || `https://gateway.pinata.cloud/ipfs/${credential.issuedBy.issuerDetails.branding.logoCID}`}
                      alt="Issuer Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : credential.studentImage ? (
                    <img 
                      src={credential.studentImage} 
                      alt={credential.studentName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/20" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                <div className="min-w-0">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 break-words leading-none uppercase">
                    {credential.studentName}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-colors">
                      <Building className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{credential.university || credential.issuedBy?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl group/chip">
                      <Hash className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[100px]">{credential._id}</span>
                      <Button 
                        onClick={() => copyToClipboard(credential._id, 'id')}
                        variant="ghost"
                        className="!p-1 text-zinc-400 hover:text-white"
                        size="sm"
                        rounded="md"
                      >
                        {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                  <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-[10px] font-black tracking-[0.2em] shadow-lg shadow-black/20 ${
                    credential.isRevoked 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {credential.isRevoked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {credential.isRevoked ? 'REVOKED' : 'ON-CHAIN VERIFIED'}
                  </div>
                  {isSBT && (
                    <Button 
                      onClick={() => setShowSBTModal(true)}
                      variant="ghost"
                      className="flex items-center gap-2.5 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 text-[9px] font-black tracking-[0.2em] hover:bg-purple-500/20 shadow-none normal-case"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      SOULBOUND
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Record Details Card */}
            <div className="bg-[#0b0b0b] border border-white/[0.06] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/card">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className={`p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] ${iconColor}`}>
                   {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    {credential.type === 'TRANSCRIPT' ? 'Academic Ledger' : 'Certification Registry'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Authentic Decentralized Record</p>
                </div>
              </div>
              
              <div className="relative z-10">
                {credential.type === 'TRANSCRIPT' && displayMetadata ? (
                   <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Academic Program</span>
                          <p className="text-white font-bold text-lg leading-tight">{displayMetadata.program}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Department</span>
                          <p className="text-white font-bold text-lg leading-tight">{displayMetadata.department}</p>
                        </div>
                        <div className="space-y-1.5 p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                          <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.2em]">Cumulative GPA</span>
                          <p className="text-4xl font-black text-white mt-2 leading-none">{displayMetadata.cgpa}</p>
                        </div>
                        <div className="space-y-1.5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Duration</span>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-white font-black text-xl">{displayMetadata.admissionYear}</span>
                            <div className="w-6 h-0.5 bg-zinc-800"></div>
                            <span className="text-white font-black text-xl">{displayMetadata.graduationYear}</span>
                          </div>
                        </div>
                      </div>

                      {displayMetadata.courses?.length > 0 && (
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Curriculum Breakdown</h4>
                           <div className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.01] shadow-inner">
                            <div className="overflow-x-auto custom-scrollbar max-h-[350px]">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-white/[0.04] text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4 text-left">Code</th>
                                    <th className="px-6 py-4 text-left">Title</th>
                                    <th className="px-6 py-4 text-center">Unit</th>
                                    <th className="px-6 py-4 text-right">Merit</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                  {displayMetadata.courses.map((course, i) => (
                                    <tr key={i} className="text-zinc-400 hover:bg-white/[0.02] transition-colors group/row">
                                      <td className="px-6 py-4 font-mono text-[10px] text-indigo-400/80">{course.code}</td>
                                      <td className="px-6 py-4 text-zinc-200 font-bold group-hover/row:text-white">{course.name}</td>
                                      <td className="px-6 py-4 text-center text-zinc-400 font-black">{course.credits}</td>
                                      <td className="px-6 py-4 text-right">
                                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-black text-[10px]">
                                          {course.grade}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                           </div>
                        </div>
                      )}
                   </div>
                ) : credential.certificationData ? (
                   <div className="space-y-10">
                      <div className="p-8 rounded-[1.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border-l-4 border-indigo-500 shadow-xl">
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-3">Registry Endorsement</span>
                         <h4 className="text-2xl sm:text-3xl font-black text-white mb-4 break-words leading-tight uppercase">{displayMetadata?.title}</h4>
                         <p className="text-zinc-400 text-sm leading-relaxed font-medium">{displayMetadata?.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center sm:text-left transition-transform hover:scale-[1.02]">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">Merit</span>
                            <p className="text-white font-bold text-lg">{displayMetadata?.level || 'N/A'}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center sm:text-left transition-transform hover:scale-[1.02]">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">Timeline</span>
                            <p className="text-white font-bold text-lg">{displayMetadata?.duration || 'N/A'}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 text-center sm:text-left transition-transform hover:scale-[1.02]">
                            <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.2em] block mb-1">Score</span>
                            <p className="text-2xl font-black text-white">{displayMetadata?.score || 'N/A'}</p>
                          </div>
                      </div>
                   </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 text-zinc-500 mb-4" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">Primary On-Chain Record</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic Proof Section */}
            <div className="bg-[#0b0b0b] border border-white/[0.06] rounded-[2rem] p-8 shadow-2xl relative group/card">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">On-Chain Evidence</h3>
                    <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-1">Hashed Cryptographic Proof</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  LIVE VERIFICATION
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Transaction Details */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-between px-1">
                        <span>Transaction Hash</span>
                        <div className="flex items-center gap-2">
                           {copiedField === 'tx' && <span className="text-[8px] text-emerald-400 font-black uppercase">COPIED</span>}
                           <Button 
                              onClick={() => copyToClipboard(credential.transactionHash, 'tx')} 
                              variant="ghost"
                              className="!p-1 text-zinc-500 hover:text-white"
                              size="sm"
                              rounded="md"
                           >
                              <Copy className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                      </label>
                      <div className="text-[10px] font-mono text-zinc-400 break-all p-5 bg-black/40 rounded-2xl border border-white/[0.04] shadow-inner group/hash relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/[0.01] opacity-0 group-hover/hash:opacity-100 transition-opacity"></div>
                        {credential.transactionHash}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Block</span>
                        <p className="text-white font-black text-xs">{credential.blockNumber || '-'}</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gas Used</span>
                        <p className="text-white font-black text-xs">{(credential.gasUsed || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gwei</span>
                        <p className="text-white font-black text-xs">
                          {credential.gasPrice ? Number(ethers.formatUnits(credential.gasPrice, 'gwei')).toFixed(1) : '0.0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fingerprint Details */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-between px-1">
                        <span>IPFS Content ID</span>
                        <Button 
                          onClick={() => copyToClipboard(credential.ipfsCID, 'ipfs')} 
                          variant="ghost"
                          className="!p-1 text-zinc-500 hover:text-white"
                          size="sm"
                          rounded="md"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </label>
                      <div className="text-[10px] font-mono text-zinc-400 break-all p-5 bg-black/40 rounded-2xl border border-white/[0.04] shadow-inner">
                        {credential.ipfsCID}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center justify-between px-1">
                        <span>Certificate Fingerprint</span>
                        <Button 
                          onClick={() => copyToClipboard(credential.certificateHash, 'cert')} 
                          variant="ghost"
                          className="!p-1 text-zinc-500 hover:text-white"
                          size="sm"
                          rounded="md"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </label>
                      <div className="text-[10px] font-mono text-zinc-400 break-all p-5 bg-black/40 rounded-2xl border border-white/[0.04] shadow-inner">
                        {credential.certificateHash}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Economic Summary */}
                <div className="pt-10 border-t border-white/[0.04] grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Verifications</span>
                    <p className="text-2xl font-black text-white leading-none">{credential.verificationCount || 0}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Last Event</span>
                    <p className="text-zinc-400 font-bold text-xs tracking-tight uppercase">{formatDate(credential.lastVerifiedAt, true)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Settlement</span>
                    <p className="text-xl font-black text-indigo-400 leading-none">
                      {credential.totalCost ? Number(ethers.formatEther(credential.totalCost)).toFixed(6) : '0.000'}
                      <span className="text-[10px] text-zinc-500 font-black ml-1 uppercase">ETH</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorization Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-indigo-500/[0.02] border border-white/[0.06] rounded-[2rem] shadow-2xl group/auth relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
              <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 w-full sm:w-auto">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Authorized Issuer</span>
                  <span className="text-white font-black block text-sm uppercase">{credential.issuedBy?.name}</span>
                </div>
                <div className="w-px h-8 bg-zinc-800 hidden sm:block"></div>
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Issued On</span>
                  <span className="text-zinc-400 font-bold block text-sm tracking-tight">{formatDate(credential.issueDate).toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-[9px] font-black text-emerald-400 tracking-[0.2em] relative z-10 w-full sm:w-auto justify-center">
                <ShieldCheck className="w-4 h-4" />
                INTEGRITY SECURED
              </div>
            </div>

          </div>

          {/* Sidebar Info Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Verification API */}
            <VerificationSection certificate={credential} />

            {/* Mobile Registry Link */}
            <div className="bg-[#0b0b0b] border border-white/[0.06] rounded-[2rem] p-8 flex flex-col items-center shadow-2xl relative group/qr overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-black/[0.1] to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity"></div>
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 relative z-10">Mobile Registry Access</span>
               <div className="p-3 bg-white border border-zinc-100 rounded-3xl mb-6 shadow-xl relative z-10 transition-transform group-hover/qr:scale-105 duration-500">
                 <QRCodeDisplay credentialId={credential._id} />
               </div>
               <p className="text-[10px] font-bold text-zinc-400 text-center px-4 leading-relaxed relative z-10 uppercase tracking-tighter">
                 Scan with any mobile terminal to securely verify this record on the public ledger.
               </p>
            </div>

            {user?.role === 'ISSUER' && user?.id === (credential.issuedBy?._id || credential.issuedBy) && !credential.isRevoked && (
               <div className="bg-[#0b0b0b] border border-red-500/10 rounded-[2rem] p-8 shadow-2xl">
                  <h4 className="text-[10px] font-black text-red-400/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4" />
                    Management CLI
                  </h4>
                  <Button
                    onClick={() => setShowRevokeModal(true)}
                    variant="danger"
                    className="w-full justify-center py-4 bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 font-black rounded-2xl active:scale-95 transition-all"
                    icon={ShieldAlert}
                  >
                    Revoke Certificate
                  </Button>
               </div>
            )}

            {/* Principal Actions */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                onClick={downloadCredential}
                variant="secondary"
                loading={isDownloading}
                className="w-full justify-center py-4 font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                icon={Download}
              >
                {isDownloading ? 'Downloading...' : 'Download Evidence'}
              </Button>
              <Button
                onClick={viewOnEtherscan}
                variant="outline"
                className="w-full justify-center py-4 border-white/[0.06] hover:border-white/10 text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all backdrop-blur-3xl"
                icon={ExternalLink}
              >
                View Explorer
              </Button>
            </div>

            {(credential.issuedBy?.issuerDetails?.branding?.signature || credential.issuedBy?.issuerDetails?.branding?.signatureCID) && (
               <div className="pt-8 text-center border-t border-white/[0.06]">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/[0.06] inline-block mx-auto mb-4 hover:shadow-2xl transition-all">
                    <img 
                      src={credential.issuedBy.issuerDetails.branding.signature || `https://gateway.pinata.cloud/ipfs/${credential.issuedBy.issuerDetails.branding.signatureCID}`} 
                      alt="Authority Signature" 
                      className="h-10 opacity-60 object-contain hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cryptographic Endorsement</p>
               </div>
            )}

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
});

CredentialDetails.displayName = 'CredentialDetails';

export default CredentialDetails;
