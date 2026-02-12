import React, { useState } from 'react';
import Button from '../shared/Button';
import { Upload, CheckCircle, ShieldCheck, FileCheck, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import { verifyAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../shared/Modal';
import { generateFileHash } from '../../utils/hash';

const VerificationSection = ({ certificate }) => {
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      showNotification('Please select a file to verify', 'error');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      console.log('Verifying certificate with ID:', certificate._id);
      
      // Compute hash client-side to match VerificationPortal workflow
      const fileHash = await generateFileHash(file);
      console.log('Computed Hash:', fileHash);
      
      // Verify by hash (more robust than file upload)
      // We pass certificate._id as the identifier (studentWalletAddress param)
      const response = await verifyAPI.verifyByHash(certificate._id, fileHash);
      
      setResult(response.data);
      setShowResultModal(true);

    } catch (error) {
       console.error(error);
       // If error response has data, use it
       if (error.response?.data) {
           setResult(error.response.data);
       } else {
           setResult({
               valid: false,
               message: 'Verification failed. Please try again.'
           });
       }
       setShowResultModal(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Verify Authenticity</h3>
            <p className="text-xs text-gray-400">Validate file hash against blockchain</p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              file ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-400 hover:bg-gray-700/50'
            }`}>
              {file ? (
                <div className="flex flex-col items-center text-purple-300">
                  <FileCheck className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium truncate max-w-full px-2">{file.name}</span>
                  <span className="text-xs text-purple-400/70 mt-1">Click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-300">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Click to upload PDF</span>
                  <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-200 text-xs flex items-start">
               <span className="mr-2">•</span>
               No gas fees required for verification.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={verifying || !file}
            variant="primary"
            className="w-full justify-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 shadow-lg shadow-purple-900/20"
            icon={CheckCircle}
          >
            {verifying ? 'Verifying...' : 'Verify Now'}
          </Button>
        </div>
      </div>

      {/* Verification Result Modal */}
      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="Verification Result"
          size="lg"
      >
          {result && (
            <div className="space-y-6">
              {/* Result Header */}
              <div className={`p-6 rounded-2xl flex items-center gap-4 ${
                 result.valid 
                   ? 'bg-emerald-500/10 border border-emerald-500/20' 
                   : result.revoked 
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className={`p-3 rounded-full flex-shrink-0 ${
                  result.valid 
                    ? 'bg-emerald-500 text-white' 
                    : result.revoked
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                }`}>
                  {result.valid ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                      result.valid ? 'text-white' : result.revoked ? 'text-yellow-200' : 'text-red-200'
                  }`}>
                    {result.valid 
                      ? 'Certificate Verified' 
                      : result.revoked 
                          ? 'Certificate Revoked' 
                          : 'Verification Failed'}
                  </h3>
                  <p className={`text-sm ${
                      result.valid ? 'text-emerald-400' : result.revoked ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Revocation Details */}
              {result.revoked && result.credential && (
                  <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl space-y-2">
                      <h4 className="text-red-400 font-semibold flex items-center gap-2">
                           <ShieldAlert className="w-4 h-4" />
                           Revocation Information
                      </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                           <div>
                               <span className="text-gray-500 block">Revoked On</span>
                               <span className="text-gray-300">
                                   {result.credential.revokedAt ? new Date(result.credential.revokedAt).toLocaleDateString() : 'Unknown'}
                               </span>
                           </div>
                           <div>
                               <span className="text-gray-500 block">Reason</span>
                               <span className="text-gray-300">{result.credential.revocationReason || 'No reason provided'}</span>
                           </div>
                       </div>
                  </div>
              )}

              {/* Credential Details */}
              {result.credential && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Recipient</label>
                        <p className="text-lg text-white font-medium">{result.credential.studentName}</p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Issued By</label>
                        <p className="text-lg text-white font-medium">{result.credential.university}</p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Wallet / ID</label>
                        <p className="text-sm text-gray-300 font-mono break-all leading-tight">
                          {result.credential.studentWalletAddress}
                        </p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Issue Date</label>
                        <p className="text-base text-gray-300">
                          {result.credential.issueDate ? new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                     </div>
                     {result.credential.tokenId && (
                        <div>
                           <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Token ID</label>
                           <p className="text-base text-purple-400 font-mono font-medium">#{result.credential.tokenId}</p>
                        </div>
                     )}
                  </div>
                  
                  {result.credential.transactionHash && (
                      <div className="pt-4 border-t border-gray-600/50">
                         <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-2 mb-2">
                            Blockchain Record
                         </label>
                         <a 
                           href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                           target="_blank"
                           rel="noreferrer"
                           className="flex items-center justify-between font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:bg-gray-700/50 p-3 rounded-lg border border-gray-700 transition-colors group"
                         >
                           <span className="truncate mr-2">{result.credential.transactionHash}</span>
                           <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                         </a>
                      </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                  <button 
                      onClick={() => setShowResultModal(false)}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium border border-gray-700"
                  >
                      Close
                  </button>
              </div>
            </div>
          )}
      </Modal>
    </>
  );
};

export default VerificationSection;
