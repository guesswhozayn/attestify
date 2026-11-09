import { PDFDocument } from 'pdf-lib';

export const extractMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const subject = pdfDoc.getSubject()?.trim();
    const keywords = pdfDoc.getKeywords()?.trim();
    const isUUID = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const isHexAddress = (val) => /^0x[0-9a-fA-F]{40}$/.test(val);
    const isValidTarget = (val) => isUUID(val) || isHexAddress(val);

    if (subject && isValidTarget(subject)) return subject;
    if (keywords) {
      const parts = keywords.split(',').map(s => s.trim());
      const uuidMatch = parts.find(isUUID);
      if (uuidMatch) return uuidMatch;
      const walletMatch = parts.find(isHexAddress);
      if (walletMatch) return walletMatch;
    }

    return null;
  } catch (error) {
    console.error('Error parsing PDF metadata:', error);
    return null;
  }
};
