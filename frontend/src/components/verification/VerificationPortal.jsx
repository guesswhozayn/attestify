import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, CheckCircle, ExternalLink, Shield, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { verifyAPI } from '../../services/api';
import { generateFileHash } from '../../utils/hash';
import { extractMetadata } from '../../utils/pdf';
import Modal from '../shared/Modal';
import { useLocation } from 'react-router-dom';
import VerificationResult from './VerificationResult';

const VerificationPortal = () => {
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const fileInputRef = useRef(null);
  
  const location = useLocation();

  useEffect(() => {
    if (location.search) {
        const params = new URLSearchParams(location.search);
        const credentialId = params.get('credentialId') || params.get('registrationNumber');
        if (credentialId) {
            setWalletAddress(credentialId);
        }
    }
  }, [location.search]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      setFile(selectedFile);
      
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
        const fileHash = await generateFileHash(file);
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
    <div className="flex flex-col items-center justify-center p-6 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-20"
      >
        
        {/* Header Section */}
        <div className="text-center lg:text-left flex-1 space-y-6 lg:sticky lg:top-32">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] backdrop-blur-xl"
          >
            <Shield className="w-10 h-10 text-indigo-400" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9]">
            Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400 bg-[length:200%_auto] animate-shimmer drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Academic</span> <br />
            Truth.
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Instant, tamper-proof verification of credentials mathematically secured by the Ethereum blockchain.
          </p>
        </div>

        {/* Main Card */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full lg:max-w-xl"
        >
          {/* Accent Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-emerald-500/30 rounded-[2.5rem] blur-2xl opacity-20 hover:opacity-40 transition-opacity duration-700"></div>

          <div className="relative bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10">
            
            {/* Upload Area */}
            <div 
              className="group/upload relative border border-dashed border-white/10 hover:border-indigo-500/40 rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer bg-white/[0.02] hover:bg-indigo-500/[0.03] overflow-hidden"
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
              
              {/* Animated background stripes */}
              <div className="absolute inset-0 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>

              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:bg-indigo-500/20 group-hover/upload:text-indigo-400 transition-all duration-300 text-gray-500 border border-white/5 group-hover/upload:border-indigo-500/30 shadow-lg">
                <Upload className="w-8 h-8" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 group-hover/upload:text-indigo-300 transition-colors">
                {file ? file.name : "Upload Credential"}
              </h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {file ? "Ready to verify" : "PDF Format Only"}
              </p>
            </div>

            <div className="relative flex items-center py-8">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs font-bold uppercase tracking-widest">Or verify by ID</span>
                <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Wallet Address Input Area */}
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Credential ID (Wallet Address)</label>
                 <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-600 group-focus-within/input:text-indigo-400 transition-colors" />
                    </div>
                    <input
                    type="text"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-black/60 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-mono text-sm"
                    />
                 </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleVerify}
                loading={verifying}
                disabled={verifying || (!file && !walletAddress)}
                className="w-full justify-center py-4 text-lg font-bold rounded-2xl bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {verifying ? 'Verifying...' : 'Verify Authenticity'}
              </Button>
            </div>
            
             {/* Security Badges */}
            <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
                <div className="flex items-center gap-2 group cursor-help" title="No gas fees required for verification">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Gas-less</span>
                </div>
                <div className="flex items-center gap-2 group cursor-help" title="Cryptographically secure verification">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-75"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Secure</span>
                </div>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* Result Modal */}
      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="Verification Result"
          size="lg"
      >
          {result && (
            <div className="space-y-6 pt-2">
              <VerificationResult result={result} />
              
              <div className="flex justify-center pt-4">
                  <button 
                      onClick={() => setShowResultModal(false)}
                      className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-bold rounded-xl transition-all border border-white/5"
                  >
                      Close Result
                  </button>
              </div>
            </div>
          )}
      </Modal>

    </div>
  );
};

export default VerificationPortal;
