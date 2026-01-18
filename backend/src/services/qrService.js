const QRCode = require('qrcode');

class QRService {
  async generateQR(data) {
    try {
      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300
      });
      return qrCode;
    } catch (error) {
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }

  async generateQRBuffer(data) {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'H',
        type: 'png',
        quality: 0.92,
        margin: 1,
        width: 300
      });
      return buffer;
    } catch (error) {
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }
}

module.exports = new QRService();
