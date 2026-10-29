import { QRCodeSVG } from 'qrcode.react';
import Button from '../shared/Button';
import { Download } from 'lucide-react';

const QRCodeDisplay = ({ credentialId }) => {
  if (!credentialId) return null;
  const qrValue = `${window.location.origin}/verify/${credentialId}`;

  const elementId = `qr-code-${credentialId}`;

  const downloadQR = () => {
    const svg = document.getElementById(elementId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `certificate-qr-${credentialId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = svgUrl;
  };

  return (
    <div className="flex flex-col items-center sm:items-start">
      <h3 className="text-stone-900 font-bold mb-4 text-sm tracking-tight">QR code verification</h3>
      <div className="bg-white p-4 rounded-2xl inline-block border border-[#ECE7DE] shadow-2xs">
        <QRCodeSVG
          id={elementId}
          value={qrValue}
          size={180}
          level="H"
          includeMargin={false}
        />
      </div>
      <Button
        onClick={downloadQR}
        variant="secondary"
        size="sm"
        className="mt-3.5 w-full justify-center"
        icon={Download}
      >
        Download QR
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
