import React, { useState } from 'react';
import Button from '../shared/Button';
import { Upload, CheckCircle, ShieldCheck, FileCheck, XCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import { verifyAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../shared/Modal';
import { generateFileHash } from '../../utils/hash';
import VerificationResult from './VerificationResult';

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
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
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
              file ? 'border-indigo-500/40 bg-indigo-500/[0.05]' : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.03]'
            }`}>
              {file ? (
                <div className="flex flex-col items-center text-indigo-300">
                  <FileCheck className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium truncate max-w-full px-2">{file.name}</span>
                  <span className="text-xs text-indigo-400/70 mt-1">Click to change</span>
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

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
            <p className="text-indigo-300 text-xs flex items-start">
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
            className="w-full justify-center py-3"
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
    </>
  );
};

export default VerificationSection;
