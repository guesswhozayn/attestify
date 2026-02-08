import React, { useState } from 'react';
import Button from '../shared/Button';
import { Upload, CheckCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { verifyAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const VerificationSection = ({ certificate }) => {
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
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

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('registrationNumber', certificate.registrationNumber);

      // Verify the file hash against the blockchain record
      const response = await verifyAPI.verifyWithFile(formData);

      if (response.data.valid) {
        showNotification('Certificate verified successfully! Hash matches.', 'success');
      } else {
        showNotification(response.data.message || 'Verification failed.', 'error');
      }
    } catch (error) {
       console.error(error);
      showNotification(error.response?.data?.message || 'Verification error occurred', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
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
  );
};

export default VerificationSection;
