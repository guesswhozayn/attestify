import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, CheckCircle, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import Button from '../shared/Button';
import { verifyAPI } from '../../services/api';
import { generateFileHash } from '../../utils/hash';
import { extractMetadata } from '../../utils/pdf';
import Modal from '../shared/Modal';
import { useLocation } from 'react-router-dom';

const VerificationPortal = () => {
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const fileInputRef = useRef(null);
  
  const location = useLocation();

  useEffect(() => {
    // Parse query params for credentialId
    if (location.search) {
        const params = new URLSearchParams(location.search);
        const credentialId = params.get('credentialId') || params.get('registrationNumber'); // Legacy support
        if (credentialId) {
            setWalletAddress(credentialId);
            // Optional: Auto-verify? Better to let user click verify or just fill it.
            // If it's a direct link, maybe we should auto verify?
            // Let's just fill it for now to be safe.
        }
    }
  }, [location.search]);





  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      setFile(selectedFile);
      
      // Auto-extract Student ID from metadata
      try {
        const extractedId = await extractMetadata(selectedFile);
        if (extractedId) {
          setWalletAddress(extractedId);
        }
      } catch (err) {
        console.warn('Could not extract metadata', err);
      }
    }
  };

  const handleVerify = async () => {
    if (!file && !walletAddress) {
      return;
    }

    if (file && !walletAddress) {
      setResult({
        valid: false,
        message: 'Please enter the Wallet Address associated with this certificate.'
      });
      setShowResultModal(true);
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      let response;
      if (file && walletAddress) {
        // Generate hash locally
        const fileHash = await generateFileHash(file);
        
        // Verify by hash (no file upload) - Check if we should use verifyWithFile or verifyByHash
        // Using verifyByHash saves bandwidth if we hash locally
        response = await verifyAPI.verifyByHash(walletAddress, fileHash);
      } else if (walletAddress) {
        response = await verifyAPI.checkExists(walletAddress);
      }
      
      setResult(response.data);
      setShowResultModal(true);
    } catch (error) {
      setResult({
        valid: false,
        message: 'Verification failed. Please try again.',
      });
      setShowResultModal(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <CheckCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Verify Certificate
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            Instant, tamper-proof verification of academic credentials using blockchain technology.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="p-8">
            {/* Upload Certificate */}
            <div 
              className="border-2 border-dashed border-gray-700/50 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-gray-800/20 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
              />
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-gray-400">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {file ? file.name : "Click to Upload Certificate"}
              </h3>
              <p className="text-sm text-gray-500">
                {file ? "File selected. Ready to verify." : "Supported format: PDF (Max 10MB)"}
              </p>
            </div>

            {/* Wallet Address Input */}
            <div className="mt-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Enter Credential ID or Student Wallet Address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-gray-950/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Verify Action */}
            <div className="mt-8">
              <Button
                onClick={handleVerify}
                loading={verifying}
                disabled={verifying || (!file && !walletAddress)}
                className="w-full justify-center py-4 text-base font-semibold shadow-lg shadow-indigo-500/25"
                size="lg"
                variant="primary"
              >
                {verifying ? 'Verifying on Blockchain...' : 'Verify Authenticity'}
              </Button>
            </div>
            
             {/* Security Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldAlert className="w-4 h-4" />
              <span>Verification is free and gas-less</span>
            </div>
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

      </div>


    </div>
  );
};

export default VerificationPortal;
