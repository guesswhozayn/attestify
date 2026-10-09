import { PDFDocument } from 'pdf-lib';

export const extractMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const subject = pdfDoc.getSubject();
    if (subject?.trim()) return subject.trim();

    const keywords = pdfDoc.getKeywords();
    if (keywords?.trim()) return keywords.split(',')[0].trim();

    return null;
  } catch (error) {
    console.error('Error parsing PDF metadata:', error);
    return null;
  }
};
