import React, { useState } from 'react';
import Button from '../shared/Button';
import { Upload, CheckCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { verifyAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../shared/Modal';
import { generateFileHash } from '../../utils/hash';
import VerificationResult from './VerificationResult';

const VerificationSection = React.memo(({ certificate }) => {
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

      const fileHash = await generateFileHash(file);

      const response = await verifyAPI.verifyByHash(certificate._id, fileHash);

      setResult(response.data);
      setShowResultModal(true);

    } catch (error) {
       console.error(error);
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
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white text-sm font-bold tracking-tight leading-none mb-1">Verify Proof</h3>
              <p className="text-[10px] text-gray-500 font-medium">Validate file hash locally</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-bold text-emerald-500">
            Gas Free
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
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
              file ? 'border-indigo-500/30 bg-indigo-500/[0.04]' : 'border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.02]'
            }`}>
              {file ? (
                <div className="flex flex-col items-center text-indigo-300 py-1">
                  <FileCheck className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold truncate max-w-full px-4">{file.name}</span>
                  <span className="text-[10px] text-gray-550 mt-1 font-medium opacity-60">Click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500 group-hover:text-gray-400 py-1">
                  <Upload className="w-7 h-7 mb-2 opacity-40" />
                  <span className="text-xs font-bold">Upload PDF Proof</span>
                  <span className="text-[10px] text-gray-600 mt-1 font-medium">Drag and drop here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={verifying || !file}
            variant="white"
            className="w-full justify-center py-2.5"
            icon={CheckCircle}
          >
            {verifying ? 'Verifying...' : 'Authenticate Now'}
          </Button>
        </div>
      </div>

      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="Verification Analysis"
          size="lg"
      >
          {result && (
            <div className="space-y-6">
              <VerificationResult result={result} />

              <div className="flex justify-center pt-2">
                  <Button
                      onClick={() => setShowResultModal(false)}
                      variant="secondary"
                      className="px-8 py-2.5 text-gray-300 hover:text-white text-xs font-bold rounded-xl border-white/5"
                  >
                      Close Report
                  </Button>
              </div>
            </div>
          )}
      </Modal>
    </>
  );
});

VerificationSection.displayName = 'VerificationSection';

export default VerificationSection;
