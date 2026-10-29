import { PDFDocument } from 'pdf-lib';

export const extractMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const subject = pdfDoc.getSubject()?.trim();
    const keywords = pdfDoc.getKeywords()?.trim();
    const isUUID = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    if (subject && isUUID(subject)) return subject;
    if (keywords) {
      const match = keywords.split(',').map(s => s.trim()).find(isUUID);
      if (match) return match;
    }

    return subject || (keywords ? keywords.split(',')[0].trim() : null);
  } catch (error) {
    console.error('Error parsing PDF metadata:', error);
    return null;
  }
};
