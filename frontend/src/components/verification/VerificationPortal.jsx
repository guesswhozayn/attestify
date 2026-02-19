import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import RefreshButton from '../shared/RefreshButton';
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
  const [feed, setFeed] = useState([]);
  const fileInputRef = useRef(null);
  
  const location = useLocation();

  const addFeedItem = (message, type = 'info') => {
    setFeed(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    if (location.search) {
        const params = new URLSearchParams(location.search);
        const credentialId = params.get('credentialId') || params.get('registrationNumber');
        if (credentialId) {
            setWalletAddress(credentialId);
            addFeedItem(`Auto-detected ID from URL: ${credentialId.substring(0, 10)}...`, 'success');
        }
    }
  }, [location.search]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      setFile(selectedFile);
      addFeedItem(`File loaded: ${selectedFile.name}`, 'info');
      
      try {
        const extractedId = await extractMetadata(selectedFile);
        if (extractedId) {
          setWalletAddress(extractedId);
          addFeedItem(`Successfully extracted ID from metadata`, 'success');
        } else {
          addFeedItem(`No ID metadata found in file`, 'warning');
        }
      } catch {
        addFeedItem(`Metadata extraction failed`, 'error');
      }
    }
  };

  const handleVerify = async () => {
    if (!file && !walletAddress) return;

    setVerifying(true);
    setResult(null);
    setFeed([]);
    
    addFeedItem("Initializing verification sequence...", "info");
    
    try {
      let response;
      if (file && walletAddress) {
        addFeedItem("Generating cryptographic file hash...", "info");
        const fileHash = await generateFileHash(file);
        addFeedItem(`Hash: ${fileHash.substring(0, 32)}...`, "info");
        
        addFeedItem("Querying Ethereum smart contracts...", "info");
        response = await verifyAPI.verifyByHash(walletAddress, fileHash);
      } else if (walletAddress) {
        addFeedItem(`Checking registry for ID: ${walletAddress.substring(0, 10)}...`, "info");
        response = await verifyAPI.checkExists(walletAddress);
      }
      
      addFeedItem("Validating digital signatures...", "info");
      addFeedItem("Verification sequence completed.", "success");
      
      setResult(response.data);
      setTimeout(() => setShowResultModal(true), 800);
    } catch {
      addFeedItem("Verification failed: Integrity mismatch or network error", "error");
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
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto min-h-screen">
      
      {/* HUD Scanner Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
        
        {/* Left: Terminal Console */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 flex flex-col space-y-6"
        >
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Shield className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tighter text-white">SCANNER MODULE</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Ready</span>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 font-mono overflow-hidden flex flex-col min-h-[400px] backdrop-blur-xl relative">
             <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                <Search className="w-24 h-24" />
             </div>
             
             <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Live Process Log</span>
                <span className="text-[10px] text-indigo-400/60 uppercase">Node: SEPOLIA</span>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {feed.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-4">
                      <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                      <p className="text-xs">Waiting for input stream...</p>
                   </div>
                ) : (
                   feed.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs flex gap-3"
                      >
                         <span className="text-indigo-500/50 shrink-0">[{item.time}]</span>
                         <span className={`break-all ${
                            item.type === 'error' ? 'text-red-400' :
                            item.type === 'success' ? 'text-emerald-400' :
                            item.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'
                         }`}>
                            {item.type === 'error' ? '× ' : item.type === 'success' ? '✓ ' : '• '}
                            {item.message}
                         </span>
                      </motion.div>
                   ))
                )}
                {verifying && (
                   <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                      <span>•</span>
                      <span>Processing input...</span>
                   </div>
                )}
             </div>
          </div>
        </motion.div>

        {/* Right: Security Portal Input */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-7"
        >
          <div className="relative group/scanner">
            {/* Animated Laser Line */}
            {verifying && (
               <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] z-20 pointer-events-none"
               />
            )}

            <div className="relative bg-[#050505] border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden">
               {/* Background Technical Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>
               
               <div className="relative z-10 space-y-12">
                  {/* Upload Scanner Zone */}
                  <div 
                    className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-500 cursor-pointer group/zone ${
                       file 
                       ? 'border-emerald-500/40 bg-emerald-500/5' 
                       : 'border-white/5 bg-white/[0.01] hover:border-indigo-500/40 hover:bg-indigo-500/5'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-2xl ${
                       file ? 'bg-emerald-500 text-white' : 'bg-black border border-white/10 text-gray-500 group-hover/zone:border-indigo-500/50 group-hover/zone:text-indigo-400'
                    }`}>
                      <Upload className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {file ? file.name : "UPLOAD CREDENTIAL"}
                    </h3>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {file ? "Scan Sequence Ready" : "Target: application/pdf"}
                    </p>
                  </div>

                  {/* ID Input Zone */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Registry ID</label>
                        {walletAddress && (<span className="text-[10px] font-bold text-indigo-400">ID CAPTURED</span>)}
                     </div>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                           <Search className="h-5 w-5 text-gray-700" />
                        </div>
                        <input
                           type="text"
                           placeholder="0x..."
                           value={walletAddress}
                           onChange={(e) => setWalletAddress(e.target.value)}
                           className="block w-full pl-14 pr-6 py-6 bg-black border border-white/5 rounded-2xl text-white placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono text-base"
                        />
                     </div>
                  </div>

                  {/* Main Action Trigger */}
                  <Button
                    onClick={handleVerify}
                    loading={verifying}
                    disabled={verifying || (!file && !walletAddress)}
                    variant="premium"
                    size="xl"
                    className="w-full shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    {verifying ? 'Verifying...' : 'Scan'}
                  </Button>
               </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Result Modal */}
      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="OUTPUT REPORT"
          size="lg"
      >
          {result && (
            <div className="space-y-6 pt-2">
              <VerificationResult result={result} />
              
            {/* Footer Actions */}
              <div className="flex justify-center pt-8 border-t border-white/5">
                  <RefreshButton 
                      onClick={() => setShowResultModal(false)}
                      variant="secondary"
                      size="lg"
                      className="px-8 uppercase tracking-widest text-xs font-bold border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300"
                      title="System Reset"
                  />
              </div>
            </div>
          )}
      </Modal>

    </div>
  );
};

export default VerificationPortal;
