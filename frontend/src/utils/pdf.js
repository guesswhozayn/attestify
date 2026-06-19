import { PDFDocument } from 'pdf-lib';

export const extractMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();

    if (subject && subject.trim().length > 0) {
        return subject.trim();
    }

    if (keywords && keywords.trim().length > 0) {

        const parts = keywords.split(',');
        return parts[0].trim();
    }

    return null;
  } catch (error) {
    console.error('Error parsing PDF metadata:', error);
    return null;
  }
};
