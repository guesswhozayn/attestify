import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

const QRScanner = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Here you would use a QR code scanning library like jsQR
      // For now, we'll just simulate a scan
      const mockStudentId = '12345';
      onScan(mockStudentId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan QR Code" size="lg">
      <div className="space-y-4">
        {error ? (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 text-center">
            <Camera className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <Button onClick={startCamera} className="mt-4" variant="primary">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-green-500 border-opacity-50 m-8 rounded-lg pointer-events-none" />
            </div>

            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Position the QR code within the frame
              </p>
              <Button onClick={captureFrame} size="lg" className="w-full">
                Capture & Scan
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QRScanner;
