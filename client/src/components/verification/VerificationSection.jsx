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
      <div className="bg-[#FAF8F5] border border-[#ECE7DE] rounded-2xl p-5 flex flex-col">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-stone-700" />
            </div>
            <div>
              <h3 className="text-stone-900 text-sm font-bold tracking-tight leading-none mb-1">Verify document</h3>
              <p className="text-[11px] text-stone-500 font-medium">Check cryptographic validity</p>
            </div>
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-[#EDF5EE] border border-[#CFE6D3] text-[11px] font-semibold text-[#25562C]">
            Instant check
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
            <div className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 ${
              file ? 'border-stone-400 bg-white' : 'border-stone-200 hover:border-stone-400 bg-white'
            }`}>
              {file ? (
                <div className="flex flex-col items-center text-stone-800 py-1">
                  <FileCheck className="w-6 h-6 mb-2 text-stone-700" />
                  <span className="text-xs font-bold truncate max-w-full px-4 text-stone-900">{file.name}</span>
                  <span className="text-[10px] text-stone-500 mt-1 font-medium">Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-stone-500 group-hover:text-stone-700 py-1">
                  <Upload className="w-6 h-6 mb-2 text-stone-400" />
                  <span className="text-xs font-bold text-stone-800">Upload PDF document</span>
                  <span className="text-[11px] text-stone-400 mt-1 font-medium">Drag and drop or click to browse</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={handleVerify}
            disabled={verifying || !file}
            className="w-full justify-center py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{verifying ? 'Verifying...' : 'Verify document'}</span>
          </button>
        </div>
      </div>

      <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="Verification result"
          size="lg"
      >
          {result && (
            <div className="space-y-6">
              <VerificationResult result={result} />

              <div className="flex justify-center pt-2">
                  <Button
                      onClick={() => setShowResultModal(false)}
                      variant="secondary"
                      className="px-8 py-2.5 text-stone-700 hover:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                      Close
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
