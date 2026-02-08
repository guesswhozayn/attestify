import React, { useState, useRef } from 'react';
import { Upload, Search, CheckCircle, XCircle, QrCode, ShieldAlert, ExternalLink } from 'lucide-react';
import Button from '../shared/Button';
import { verifyAPI } from '../../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { generateFileHash } from '../../utils/hash';
import { extractMetadata } from '../../utils/pdf';
import Modal from '../shared/Modal';
import { useEffect } from 'react';

const VerificationPortal = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let scanner = null;

    if (showScanner) {
      // Small delay to ensure modal DOM is ready
      setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scanner.render(onScanSuccess, onScanFailure);
      }, 100);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
      }
    };
  }, [showScanner]);

  const onScanSuccess = (decodedText, decodedResult) => {
    // Handle the scanned code as you like, for example:
    if (decodedText) {
      setRegistrationNumber(decodedText);
      setShowScanner(false);
    }
  };

  const onScanFailure = (error) => {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    // console.warn(`Code scan error = ${error}`);
  };



  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      
      // Auto-extract Student ID from metadata
      try {
        const extractedId = await extractMetadata(selectedFile);
        if (extractedId) {
          setRegistrationNumber(extractedId);
        }
      } catch (err) {
        console.warn('Could not extract metadata', err);
      }
    }
  };

  const handleVerify = async () => {
    if (!file && !registrationNumber) {
      return;
    }

    if (file && !registrationNumber) {
      setResult({
        valid: false,
        message: 'Please enter the Registration Number associated with this certificate.'
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      if (file && registrationNumber) {
        // Generate hash locally
        const fileHash = await generateFileHash(file);
        
        // Verify by hash (no file upload)
        const response = await verifyAPI.verifyByHash(registrationNumber, fileHash);
        setResult(response.data);
      } else if (registrationNumber) {
        const response = await verifyAPI.checkExists(registrationNumber);
        setResult(response.data);
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Verification failed. Please try again.',
      });
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
          
          {/* Tabs / Input Selection */}
          <div className="grid grid-cols-2 p-2 gap-2 bg-gray-900/50 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'upload' 
                  ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'scan' 
                  ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Scan QR Code
            </button>
          </div>

          <div className="p-8">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
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
            )}

            {/* Scan Tab */}
            {activeTab === 'scan' && (
               <div className="text-center py-8">
                 <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 animate-pulse">
                    <QrCode className="w-10 h-10" />
                 </div>
                 <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                    Use your device's camera to verify the physical copy of the certificate.
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowScanner(true)}
                    className="mx-auto"
                  >
                    Open Camera
                  </Button>
               </div>
            )}

            {/* Registration Number Input */}
            <div className="mt-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Enter Registration Number (e.g., REG-2024-001)"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-gray-950/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Verify Action */}
            <div className="mt-8">
              <Button
                onClick={handleVerify}
                loading={verifying}
                disabled={verifying || (!file && !registrationNumber)}
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

        {/* Results Section */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`rounded-3xl border overflow-hidden ${
              result.valid 
                ? 'bg-emerald-950/10 border-emerald-500/30' 
                : 'bg-red-950/10 border-red-500/30'
            }`}>
              
              {/* Result Header */}
              <div className={`p-6 flex items-center gap-4 border-b ${
                 result.valid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
              }`}>
                <div className={`p-3 rounded-full ${
                  result.valid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                }`}>
                  {result.valid ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${result.valid ? 'text-white' : 'text-red-200'}`}>
                    {result.valid ? 'Certificate Verified' : 'Verification Failed'}
                  </h3>
                  <p className={`text-sm ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Result Details */}
              {result.valid && result.credential && (
                <div className="p-6 md:p-8 bg-gray-900/40 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recipient</label>
                        <p className="text-lg text-white font-medium mt-1">{result.credential.studentName}</p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Issued By</label>
                        <p className="text-lg text-white font-medium mt-1">{result.credential.university}</p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Registration No</label>
                        <p className="text-base text-gray-300 font-mono mt-1 bg-gray-950/50 w-fit px-2 py-1 rounded border border-gray-800">
                          {result.credential.registrationNumber}
                        </p>
                     </div>
                     <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Issue Date</label>
                        <p className="text-base text-gray-300 mt-1">
                          {new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                     </div>
                     <div className="md:col-span-2 pt-4 border-t border-gray-800">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-2 mb-2">
                           <CheckCircle className="w-3 h-3 text-emerald-500" />
                           Blockchain Transaction Hash
                        </label>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:underline break-all bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20 block transition-colors"
                        >
                          {result.credential.transactionHash}
                          <ExternalLink className="w-3 h-3 inline ml-1.5 -mt-0.5" />
                        </a>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        title="Scan QR Code"
        size="md"
      >
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl">
          <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-indigo-500/50 shadow-2xl"></div>
          <p className="text-gray-400 mt-6 text-center text-sm font-medium">
            Align the QR code within the frame to scan
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VerificationPortal;
