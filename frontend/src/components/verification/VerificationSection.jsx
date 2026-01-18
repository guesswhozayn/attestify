import React, { useState } from 'react';
import Button from '../shared/Button';
import { Upload, Check, Loader2 } from 'lucide-react';
import { verifyAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const VerificationSection = ({ certificate }) => {
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      formData.append('studentId', certificate.studentId);

      const response = await verifyAPI.verifyWithFile(formData);

      if (response.data.valid) {
        showNotification('Certificate verified successfully!', 'success');
      } else {
        showNotification('Certificate verification failed - hash mismatch', 'error');
      }
    } catch (error) {
      showNotification('Verification error', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">VERIFY</h3>
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <p className="text-gray-400">Verify the certificate</p>
        
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
          />
          {file && (
            <p className="text-purple-400 text-sm mt-2 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              {file.name}
            </p>
          )}
        </div>

        <p className="text-gray-400 text-sm">
          Upload the certificate to verify if the hash matches.
        </p>

        <p className="text-gray-500 text-xs">
          Verification process is for free (i.e., without paying gas fees).
        </p>

        <Button
          onClick={handleVerify}
          loading={verifying}
          disabled={verifying || !file}
          variant="secondary"
          className="w-full"
          icon={verifying ? Loader2 : Check}
        >
          Verify Certificate
        </Button>
      </div>
    </div>
  );
};

export default VerificationSection;
