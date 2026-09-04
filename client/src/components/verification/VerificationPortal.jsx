import React, { useState, useRef, useEffect } from 'react';
import { Upload, Search, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { verifyAPI } from '../../services/api';
import { generateFileHash } from '../../utils/hash';
import { extractMetadata } from '../../utils/pdf';
import Modal from '../shared/Modal';
import { useLocation, useParams } from 'react-router-dom';
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
  const { id: urlId } = useParams();

  const addFeedItem = (message, type = 'info') => {
    setFeed(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {

    if (urlId) {
        setWalletAddress(urlId);
        addFeedItem(`Auto-detected ID from URL: ${urlId.substring(0, 10)}...`, 'success');
    } else if (location.search) {
        const params = new URLSearchParams(location.search);
        const credentialId = params.get('credentialId') || params.get('registrationNumber');
        if (credentialId) {
            setWalletAddress(credentialId);
            addFeedItem(`Auto-detected ID from URL: ${credentialId.substring(0, 10)}...`, 'success');
        }
    }
  }, [urlId, location.search]);

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

    addFeedItem("Initializing secure check...", "info");

    try {
      let response;
      if (file && walletAddress) {
        addFeedItem("Creating secure file fingerprint...", "info");
        const fileHash = await generateFileHash(file);
        addFeedItem(`Fingerprint: ${fileHash.substring(0, 32)}...`, "info");

        addFeedItem("Searching verification registry...", "info");
        response = await verifyAPI.verifyByHash(walletAddress, fileHash);
      } else if (walletAddress) {
        addFeedItem(`Checking record for ID: ${walletAddress.substring(0, 10)}...`, "info");
        response = await verifyAPI.checkExists(walletAddress);
      }

      addFeedItem("Validating authority signatures...", "info");
      addFeedItem("Verification check completed.", "success");

      setResult(response.data);
      setTimeout(() => setShowResultModal(true), 800);
    } catch {
      addFeedItem("Verification failed: Record mismatch or network error", "error");
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl relative"
      >

        {verifying && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] z-20 pointer-events-none rounded-full"
            />
        )}

        <div className="relative bg-[#050505] border border-white/10 rounded-[3rem] p-6 sm:p-10 shadow-3xl overflow-hidden flex flex-col gap-8">

           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50"></div>

           <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <Shield className="w-6 h-6 text-indigo-400" />
                 </div>
                 <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white">VERIFICATION PORTAL</h2>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${verifying ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${verifying ? 'text-indigo-500' : 'text-emerald-500'}`}>
                          {verifying ? 'Processing...' : 'System Ready'}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Security Network</span>
                <span className="text-[10px] font-mono text-indigo-400">SECURE LEDGER</span>
              </div>
           </div>

           <div className="relative z-10 space-y-8">

              <div
                className={`relative border-2 border-dashed rounded-[2rem] p-8 sm:p-12 text-center transition-all duration-500 cursor-pointer group/zone ${
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

                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-2xl ${
                   file ? 'bg-emerald-500 text-white' : 'bg-black border border-white/10 text-gray-500 group-hover/zone:border-indigo-500/50 group-hover/zone:text-indigo-400'
                }`}>
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate px-4">
                  {file ? file.name : "UPLOAD CERTIFICATE"}
                </h3>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {file ? "Document Loaded Successfully" : "Supported format: PDF"}
                </p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Credential Reference ID</label>
                    {walletAddress && (<span className="text-[10px] font-bold text-indigo-400">ID CAPTURED</span>)}
                 </div>
                 <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                       <Search className="h-5 w-5 text-gray-600 group-focus-within/input:text-indigo-400 transition-colors" />
                    </div>
                    <input
                       type="text"
                       placeholder="0x..."
                       value={walletAddress}
                       onChange={(e) => setWalletAddress(e.target.value)}
                       className="block w-full pl-14 pr-6 py-5 bg-black/50 border border-white/5 focus:border-indigo-500/30 rounded-2xl text-white placeholder-gray-800 transition-all font-mono text-sm sm:text-base outline-none shadow-inner"
                    />
                 </div>
              </div>

              <Button
                onClick={handleVerify}
                loading={verifying}
                disabled={verifying || !walletAddress}
                variant="white"
                size="xl"
                className="w-full hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {verifying ? 'Verifying Document Status...' : 'Verify Document'}
              </Button>
           </div>

           <div className="relative z-10 bg-black/80 border border-white/5 rounded-2xl p-5 font-mono overflow-hidden flex flex-col h-48 sm:h-56 mt-4 shadow-inner">

             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Search className="w-32 h-32" />
             </div>

             <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold">Verification Log</span>
                <div className="flex gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-500/40 border border-red-500/20"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500/40 border border-yellow-500/20"></div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500/40 border border-emerald-500/20"></div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2 pb-2">
                {feed.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                      <p className="text-[11px] text-gray-400">Awaiting document upload or reference ID...</p>
                   </div>
                ) : (
                   feed.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] leading-relaxed flex gap-3"
                      >
                         <span className="text-indigo-500/50 shrink-0 select-none">[{item.time}]</span>
                         <span className={`break-words ${
                            item.type === 'error' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]' :
                            item.type === 'success' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.2)]' :
                            item.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'
                         }`}>
                            <span className="select-none inline-block w-4">
                                {item.type === 'error' ? '×' : item.type === 'success' ? '✓' : '›'}
                            </span>
                            {item.message}
                         </span>
                      </motion.div>
                   ))
                )}
                {verifying && (
                   <div className="flex items-center gap-2 text-[11px] text-indigo-400 animate-pulse mt-2">
                      <span className="select-none inline-block w-4">›</span>
                      <span>Analyzing document details...</span>
                   </div>
                )}
             </div>
           </div>

           <div className="pt-2">
                             <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 py-8 opacity-60">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Powered by</span>
                  <span className="font-sans text-lg font-black tracking-[-0.05em] lowercase text-white">attestify<span className="text-indigo-500">.</span></span>
               </div>
           </div>

        </div>
      </motion.div>
      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="VERIFICATION RESULT"
          size="lg"
      >
          {result && (
            <div className="space-y-6 pt-2">
              <VerificationResult result={result} />

              <div className="flex justify-center pt-8 border-t border-white/5">
                  <Button
                      onClick={() => setShowResultModal(false)}
                      variant="secondary"
                      size="lg"
                      icon={RefreshCw}
                      className="px-8 uppercase tracking-widest text-xs font-bold border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 animate-none"
                      title="Verify Another"
                  >
                      Verify Another
                  </Button>
              </div>
            </div>
          )}
      </Modal>

    </div>
  );
};

export default VerificationPortal;
