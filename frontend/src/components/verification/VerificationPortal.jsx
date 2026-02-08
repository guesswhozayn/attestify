import React, { useState, useRef } from 'react';
import { Upload, Search, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Verify Certificate</h1>
          <p className="text-xl text-gray-400">
            Select a certificate or scan QR code to verify its authenticity
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Select Section */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-green-500 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select Certificate</h3>
              <p className="text-gray-400 mb-4">Select file to verify (processed locally)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
              />
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              {file && (
                <p className="text-green-400 text-sm mt-4">{file.name}</p>
              )}
            </div>

            {/* QR Scan Section */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
              <p className="text-gray-400 mb-4">Use your camera to scan</p>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setShowScanner(true)}
              >
                Open Scanner
              </Button>
            </div>
          </div>

          {/* Student ID Search */}
          <div className="mb-8">
            <Input
              placeholder="Enter Registration Number to verify..."
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              icon={Search}
            />
          </div>

          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={verifying || (!file && !registrationNumber)}
            className="w-full"
            size="lg"
          >
            Verify Certificate
          </Button>

          {/* Verification Result */}
          {result && (
            <div className={`mt-8 p-6 rounded-lg border-2 ${
              result.valid 
                ? 'bg-green-500 bg-opacity-10 border-green-500' 
                : 'bg-red-500 bg-opacity-10 border-red-500'
            }`}>
              <div className="flex items-start space-x-3">
                {result.valid ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${
                    result.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.valid ? 'Certificate Verified ✓' : 'Verification Failed ✗'}
                  </h4>
                  <p className="text-gray-300 mb-4">{result.message}</p>
                  
                  {result.credential && (
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Student Name: </span>
                        <span className="text-white font-medium">{result.credential.studentName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Registration Number: </span>
                        <span className="text-white font-medium">{result.credential.registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">University: </span>
                        <span className="text-white font-medium">{result.credential.university}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Issue Date: </span>
                        <span className="text-white font-medium">
                          {new Date(result.credential.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {result.credential.transactionHash && (
                        <div>
                          <span className="text-gray-400">Transaction: </span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs break-all"
                          >
                            {result.credential.transactionHash}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p className="font-medium text-white mb-1">Note:</p>
              <p>Verification process is free (no gas fees required). The certificate hash is compared with the blockchain record to ensure authenticity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        title="Scan QR Code"
        size="md"
      >
        <div className="flex flex-col items-center">
          <div id="reader" width="100%"></div>
          <p className="text-gray-400 mt-4 text-center text-sm">
            Point your camera at the QR code on the certificate
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VerificationPortal;
