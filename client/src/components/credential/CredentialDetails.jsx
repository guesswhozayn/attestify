import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import QRCodeDisplay from './QRCodeDisplay';
import { fileAPI } from '../../services/api';
import { Download, ExternalLink, User, Building, Hash, ShieldAlert, GraduationCap, Award, Shield, ShieldCheck, Copy, Check, Database, Loader2, Clock } from 'lucide-react';
import VerificationSection from '../verification/VerificationSection';
import RevokeCredentialModal from './RevokeCredentialModal';
import SBTDetailsModal from './SBTDetailsModal';
import { getCredentialMeta } from '../../utils/credential';
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

  if (!credential) return null;

  const meta = getCredentialMeta(credential);
  const displayMetadata = meta?.metadata;
  const isTranscript = meta?.isTranscript;
  const isSBT = !!credential.tokenId;
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';

  const getStatusStyles = () => {
    if (credential.isRevoked) {
      return {
        text: 'text-rose-600',
        icon: ShieldAlert,
        label: 'Revoked'
      };
    }
    switch (credential.status) {
      case 'PENDING':
        return {
          text: 'text-amber-700',
          icon: Clock,
          label: 'Pending'
        };
      case 'PROCESSING':
        return {
          text: 'text-amber-700',
          icon: Loader2,
          label: 'Processing'
        };
      case 'FAILED':
        return {
          text: 'text-rose-600',
          icon: ShieldAlert,
          label: 'Failed'
        };
      case 'COMPLETED':
      default:
        return {
          text: 'text-emerald-700',
          icon: ShieldCheck,
          label: 'Verified'
        };
    }
  };

  const statusStyles = getStatusStyles();
  const StatusIcon = statusStyles.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Credential details" size="2xl">
      <div className="space-y-8 pb-4">
        {credential.status === 'FAILED' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Credential issuance failed</p>
              <p className="text-xs text-red-400/80 mt-1">
                {credential.processingError || 'An error occurred while creating this credential on the blockchain. Please try issuing it again or contact support.'}
              </p>
            </div>
          </div>
        )}

        {(credential.status === 'PROCESSING' || credential.status === 'PENDING') && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-400 text-sm flex items-start gap-3">
            <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="font-bold">Issuance in progress</p>
              <p className="text-xs text-amber-400/80 mt-1">
                This credential is being processed on the blockchain. Records and downloads will be available once completed.
              </p>
            </div>
          </div>
        )}

        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#FAF8F5] border border-[#E8E4DC] p-7 md:p-8 shadow-xs"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">

            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white border border-[#E8E4DC] flex items-center justify-center shrink-0 shadow-xs overflow-hidden p-1">
                <div className="w-full h-full rounded-xl bg-[#FAF8F5] flex items-center justify-center overflow-hidden">
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
                    <User className="w-8 h-8 text-stone-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2 break-words">
                    {credential.studentName}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E8E4DC] rounded-xl">
                      <Building className="w-3.5 h-3.5 text-stone-500" />
                      <span className="text-xs font-semibold text-stone-700">{credential.university || credential.issuedBy?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8E4DC] rounded-xl">
                      <Hash className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-xs font-mono text-stone-600 truncate max-w-[120px]">{credential._id}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(credential._id, 'id')}
                        className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                      >
                        {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusStyles.text}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusStyles.label}</span>
                  </div>
                  {isSBT && (
                    <button
                      type="button"
                      onClick={() => setShowSBTModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8E4DC] rounded-xl text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-500" />
                      <span>Direct record</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-1">

          <div className="lg:col-span-8 space-y-6">

            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-7 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-stone-700">
                   {isTranscript ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                    {isTranscript ? 'Academic transcript' : 'Certificate details'}
                  </h3>
                  <p className="text-xs text-stone-400 font-medium">Verified credential record</p>
                </div>
              </div>

              <div className="relative z-10">
                {isTranscript && displayMetadata ? (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Program</span>
                          <p className="text-stone-900 font-bold text-base">{displayMetadata.program}</p>
                        </div>
                        <div className="space-y-1 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Department</span>
                          <p className="text-stone-900 font-bold text-base">{displayMetadata.department}</p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Cumulative GPA</span>
                          <p className="text-3xl font-mono font-bold text-stone-900 mt-1">{displayMetadata.cgpa}</p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Duration</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-stone-900 font-bold text-lg">{displayMetadata.admissionYear}</span>
                            <span className="text-stone-400">-</span>
                            <span className="text-stone-900 font-bold text-lg">{displayMetadata.graduationYear}</span>
                          </div>
                        </div>
                      </div>

                      {displayMetadata.courses?.length > 0 && (
                        <div className="space-y-3">
                           <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider px-1">Course breakdown</h4>
                           <div className="border border-[#E8E4DC] rounded-xl overflow-hidden bg-white">
                            <div className="overflow-x-auto max-h-[300px]">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-[#FAF8F5] text-stone-500 text-[10px] font-bold uppercase tracking-wider border-b border-[#E8E4DC]">
                                    <th className="px-5 py-3 text-left">Code</th>
                                    <th className="px-5 py-3 text-left">Title</th>
                                    <th className="px-5 py-3 text-center">Credits</th>
                                    <th className="px-5 py-3 text-right">Grade</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E4DC]">
                                  {displayMetadata.courses.map((course, i) => (
                                    <tr key={i} className="text-stone-700 hover:bg-[#FAF8F5] transition-colors">
                                      <td className="px-5 py-3 font-mono text-xs font-semibold text-stone-600">{course.code}</td>
                                      <td className="px-5 py-3 text-stone-900 font-semibold">{course.name}</td>
                                      <td className="px-5 py-3 text-center text-stone-600 font-bold">{course.credits}</td>
                                      <td className="px-5 py-3 text-right">
                                        <span className="font-bold text-xs text-stone-900">
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
                   <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
                         <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Credential summary</span>
                         <h4 className="text-2xl font-bold text-stone-900 mb-2 leading-tight">{displayMetadata?.title}</h4>
                         <p className="text-stone-600 text-sm leading-relaxed">{displayMetadata?.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Level</span>
                            <p className="text-stone-900 font-bold text-base">{displayMetadata?.level || 'N/A'}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Duration</span>
                            <p className="text-stone-900 font-bold text-base">{displayMetadata?.duration || 'N/A'}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Score</span>
                            <p className="text-xl font-bold font-mono text-stone-900">{displayMetadata?.score || 'N/A'}</p>
                          </div>
                      </div>
                   </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex flex-col items-center justify-center text-center">
                    <Database className="w-8 h-8 text-stone-400 mb-2" />
                    <p className="text-stone-500 font-semibold text-xs">Blockchain credential record</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EDF5EE] border border-[#CFE6D3] text-[#25562C]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 tracking-tight">Record verification</h3>
                    <p className="text-xs text-stone-400 font-medium">Network confirmation</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  <span>Verified</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-stone-600 flex items-center justify-between px-0.5">
                        <span>Transaction hash</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(credential.transactionHash, 'tx')}
                          className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {copiedField === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-xs font-mono text-stone-700 break-all p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] leading-relaxed">
                        {credential.transactionHash}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Block</span>
                        <p className="text-stone-900 font-bold text-xs">{credential.blockNumber || '-'}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Gas</span>
                        <p className="text-stone-900 font-bold text-xs">{(credential.gasUsed || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-center">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Gwei</span>
                        <p className="text-stone-900 font-bold text-xs">
                          {credential.gasPrice ? Number(ethers.formatUnits(credential.gasPrice, 'gwei')).toFixed(1) : '0.0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-stone-600 flex items-center justify-between px-0.5">
                        <span>File storage ID (IPFS)</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(credential.ipfsCID, 'ipfs')}
                          className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-mono text-stone-700 break-all p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] leading-relaxed">
                        {credential.ipfsCID}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-stone-600 flex items-center justify-between px-0.5">
                        <span>Certificate hash</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(credential.certificateHash, 'cert')}
                          className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-mono text-stone-700 break-all p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] leading-relaxed">
                        {credential.certificateHash}
                      </div>
                    </div>
                  </div>
                </div>

                {isSBT && (
                  <div className="pt-5 border-t border-[#E8E4DC] space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Direct record details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-stone-600 block">Token ID</span>
                        <div className="text-xs font-mono text-purple-900 font-bold p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                          #{credential.tokenId}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-stone-600 block">Contract address</span>
                        <div className="text-xs font-mono text-purple-900 break-all p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                          {contractAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Issued by</span>
                  <span className="text-stone-900 font-bold block text-sm">{credential.issuedBy?.name}</span>
                </div>
                <div className="w-px h-6 bg-stone-300 hidden sm:block"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Date issued</span>
                  <span className="text-stone-700 font-medium block text-sm">{formatDate(credential.issueDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified authentic</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-5">

            <VerificationSection certificate={credential} />

            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 flex flex-col items-center shadow-xs">
               <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-5">Scan to verify</span>
               <div className="p-3 bg-white border border-stone-200 rounded-2xl mb-4 shadow-xs">
                 <QRCodeDisplay credentialId={credential._id} />
               </div>
               <p className="text-xs text-stone-500 text-center leading-relaxed">
                 Scan with a phone camera to view and verify this certificate.
               </p>
            </div>

            {user?.role === 'ISSUER' && user?.id === (credential.issuedBy?._id || credential.issuedBy) && !credential.isRevoked && (
               <div className="bg-[#FDF0EE] border border-[#F7D4CF] rounded-3xl p-6">
                  <h4 className="text-xs font-bold text-[#9E2D2D] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Issuer actions
                  </h4>
                  <Button
                    onClick={() => setShowRevokeModal(true)}
                    variant="danger"
                    className="w-full justify-center py-3 bg-white hover:bg-rose-50 border border-[#F7D4CF] text-[#9E2D2D] font-semibold text-xs rounded-xl shadow-xs"
                    icon={ShieldAlert}
                  >
                    Revoke credential
                  </Button>
               </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={downloadCredential}
                variant="primary"
                loading={isDownloading}
                disabled={credential.status === 'FAILED' || credential.status === 'PROCESSING' || credential.status === 'PENDING'}
                className="w-full justify-center py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl shadow-sm cursor-pointer"
                icon={Download}
              >
                {isDownloading ? 'Downloading...' : 'Download certificate'}
              </Button>
              <Button
                onClick={viewOnEtherscan}
                variant="outline"
                disabled={!credential.transactionHash}
                className="w-full justify-center py-3.5 bg-white hover:bg-stone-50 text-stone-800 border-stone-200 font-semibold text-sm rounded-xl shadow-2xs cursor-pointer"
                icon={ExternalLink}
              >
                View on Etherscan
              </Button>
            </div>

            {(credential.issuedBy?.issuerDetails?.branding?.signature || credential.issuedBy?.issuerDetails?.branding?.signatureCID) && (
               <div className="pt-6 text-center border-t border-[#E8E4DC]">
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DC] inline-block mx-auto mb-2">
                    <img
                      src={credential.issuedBy.issuerDetails.branding.signature || `https://gateway.pinata.cloud/ipfs/${credential.issuedBy.issuerDetails.branding.signatureCID}`}
                      alt="Authority Signature"
                      className="h-9 object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Authorized signature</p>
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
