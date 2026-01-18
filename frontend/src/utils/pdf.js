import { PDFDocument } from 'pdf-lib';

export const extractMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Attempt to look for Student ID in common metadata fields
    // Strategy: Check Subject first, then Keywords
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    
    // You might customize this logic based on how you generate PDFs
    // For now, we return the Subject if it looks like a student ID, 
    // otherwise check keywords.
    
    if (subject && subject.trim().length > 0) {
        return subject.trim();
    }
    
    if (keywords && keywords.trim().length > 0) {
        // Keywords might be a comma separated list. 
        // Logic: Return the first keyword or the whole string?
        // Let's assume the ID is the first keyword.
        const parts = keywords.split(',');
        return parts[0].trim();
    }

    return null;
  } catch (error) {
    console.error('Error parsing PDF metadata:', error);
    return null;
  }
};
