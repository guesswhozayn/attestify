import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../shared/Button';
import { Download } from 'lucide-react';

const QRCodeDisplay = ({ studentId }) => {
  const qrValue = `${window.location.origin}/verify?studentId=${studentId}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `certificate-qr-${studentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">QR CODE</h3>
      <div className="bg-white p-4 rounded-lg inline-block">
        <QRCodeSVG
          id="qr-code"
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <Button
        onClick={downloadQR}
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        icon={Download}
      >
        Download QR Code
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
