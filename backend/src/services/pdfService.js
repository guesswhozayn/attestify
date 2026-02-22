const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

const COLORS = {
  primary: '#6366f1',
  dark: '#0f172a',
  secondary: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
  lightGray: '#f8fafc',
  tableHeader: '#f1f5f9',
  textMain: '#1e293b',
};

exports.generateCredentialPDF = async (data, outputPath) => {
  const { 
    type, 
  } = data;

  return new Promise(async (resolve, reject) => {
    try {
      const isTranscript = type === 'TRANSCRIPT';
      const { 
        studentWalletAddress, 
        credentialId, 
        institutionName 
      } = data;

      const doc = new PDFDocument({ 
        layout: isTranscript ? 'portrait' : 'landscape', 
        size: 'A4', 
        margin: 0,
        bufferPages: true,
        info: {
          Title: isTranscript ? `${institutionName} - Academic Transcript` : `${institutionName} - Certification`,
          Author: institutionName,
          Subject: studentWalletAddress,
          Keywords: credentialId,
          Creator: 'Attestify Protocol',
          Producer: 'Attestify PDF Engine'
        }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      if (isTranscript) {
        await drawTranscript(doc, data);
      } else {
        await drawCertificate(doc, data);
      }

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

async function drawTranscript(doc, data) {
  const { 
    studentName, 
    studentWalletAddress, 
    credentialId, 
    transcriptData, 
    issueDate,
    verificationUrl,
    institutionName,
    issuerWalletAddress,
    issuerRegistration,
    ipfsUrl
  } = data;

  const margin = 50;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - (margin * 2);

  doc.rect(0, 0, pageWidth, 120).fill(COLORS.lightGray);
  
  let headerContentY = 40;
  let textX = margin;

  doc.fillColor(COLORS.dark);
  doc.fontSize(22).font('Helvetica-Bold').text(institutionName, textX, 40);
  
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.secondary)
     .text('OFFICIAL ACADEMIC TRANSCRIPT', textX, 70, { charSpacing: 1 });

  const badgeWidth = 120;
  doc.roundedRect(pageWidth - margin - badgeWidth, 40, badgeWidth, 24, 12)
     .fill(COLORS.white);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.primary)
     .text('VERIFIED CREDENTIAL', pageWidth - margin - badgeWidth, 48, { width: badgeWidth, align: 'center' });

  doc.lineWidth(2).strokeColor(COLORS.primary).moveTo(0, 118).lineTo(pageWidth, 118).stroke();



  const gridY = 140;
  const col1X = margin;
  const col2X = margin + 250;

  doc.fillColor(COLORS.textMain);

  const drawLabelValue = (label, value, x, y) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.secondary).text(label.toUpperCase(), x, y);
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.dark).text(value, x, y + 12);
  };

  drawLabelValue('Student Name', studentName, col1X, gridY);
  drawLabelValue('Student ID / Wallet', studentWalletAddress.substring(0, 20) + '...', col2X, gridY);

  drawLabelValue('Program', transcriptData?.program || 'N/A', col1X, gridY + 40);
  drawLabelValue('Credential ID', credentialId, col2X, gridY + 40);

  drawLabelValue('Admission Year', transcriptData?.admissionYear || 'N/A', col1X, gridY + 80);
  drawLabelValue('Graduation Year', transcriptData?.graduationYear || 'N/A', col2X, gridY + 80);

  
  let tableY = gridY + 120;
  
  const tableWidth = contentWidth;
  const col1 = margin;
  const col2 = margin + (tableWidth * 0.15);
  const col3 = margin + (tableWidth * 0.65);
  const col4 = margin + (tableWidth * 0.85);


  const rowHeight = 20;
  doc.rect(margin, tableY, tableWidth, rowHeight).fill(COLORS.tableHeader);
  
  doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold');
  const headerTextY = tableY + 6;
  doc.text('CODE', col1 + 10, headerTextY);
  doc.text('COURSE TITLE', col2 + 10, headerTextY);
  doc.text('GRADE', col3 + 10, headerTextY);
  doc.text('CREDITS', col4 + 10, headerTextY);


  let y = tableY + rowHeight;
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMain);

  if (transcriptData?.courses && Array.isArray(transcriptData.courses)) {
      transcriptData.courses.forEach((course, index) => {
          if (y > doc.page.height - 120) {
              doc.addPage();
              y = 50;
              doc.rect(margin, y, tableWidth, rowHeight).fill(COLORS.tableHeader);
              doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold');
              const hY = y + 6;
              doc.text('CODE', col1 + 10, hY);
              doc.text('COURSE TITLE', col2 + 10, hY);
              doc.text('GRADE', col3 + 10, hY);
              doc.text('CREDITS', col4 + 10, hY);
              y += rowHeight;
              doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMain);
          }

          if (index % 2 !== 0) {
              doc.rect(margin, y, tableWidth, rowHeight).fill(COLORS.lightGray);
          }

          doc.fillColor(COLORS.textMain);
          const textY = y + 5;
          doc.text(course.code, col1 + 10, textY);
          doc.text(course.name, col2 + 10, textY);
          doc.font('Helvetica-Bold').text(course.grade, col3 + 10, textY).font('Helvetica');
          doc.text(course.credits, col4 + 10, textY);

          y += rowHeight;
      });
  }

  y += 10;
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(COLORS.border).stroke();
  
  y += 15;
  const cgpaBoxWidth = 150;
  const cgpaBoxX = pageWidth - margin - cgpaBoxWidth;
  doc.rect(cgpaBoxX, y, cgpaBoxWidth, 30).fill(COLORS.lightGray);
  doc.rect(cgpaBoxX, y, cgpaBoxWidth, 30).strokeColor(COLORS.primary).lineWidth(0.5).stroke();
  
  doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
     .text(`Cumulative GPA: ${transcriptData?.cgpa || 'N/A'}`, cgpaBoxX, y + 10, { width: cgpaBoxWidth, align: 'center' });


  // --- FOOTER ---
  const footerHeight = 120;
  const footerY = doc.page.height - footerHeight;

  doc.fontSize(9).font('Helvetica').fillColor(COLORS.secondary)
     .text(`Issued On: ${new Date(issueDate).toLocaleDateString()}`, margin, footerY + 40);
  
  doc.fontSize(8).text(`Generated via Attestify Protocol`, margin, footerY + 55);
  
  if (issuerRegistration) {
      doc.text(`Reg. No: ${issuerRegistration}`, margin, footerY + 70);
  }
  if (issuerWalletAddress) {
      doc.text(`Issuer Wallet: ${issuerWalletAddress}`, margin, footerY + 85, { width: 250 });
  }

  const qrSize = 50; 
  let qrY = footerY + 10;
  const qrTarget = ipfsUrl || verificationUrl;
  
  if(qrTarget){
    try {
        const qrData = await QRCode.toDataURL(qrTarget);
        doc.image(qrData, (pageWidth - qrSize) / 2, qrY, { width: qrSize });
    } catch (e) { console.warn('QR Code generation failed', e); }
  }
  
  doc.fontSize(7).fillColor(COLORS.secondary)
     .text('SCAN TO VERIFY', 0, qrY + qrSize + 5, { align: 'center', width: pageWidth });


  const brandText = 'attestify.';
  doc.fontSize(10).font('Helvetica-Bold');
  const brandWidth = doc.widthOfString(brandText);
  const brandX = (pageWidth - brandWidth) / 2;
  const brandY = qrY + qrSize + 20;
  
  doc.fillColor(COLORS.dark).text('attestify', brandX, brandY, { continued: true });
  doc.fillColor(COLORS.primary).text('.');


  const sigX = pageWidth - margin - 150;
  doc.lineWidth(1).strokeColor(COLORS.border).moveTo(sigX, footerY + 55).lineTo(sigX + 150, footerY + 55).stroke();
  doc.fontSize(9).font('Helvetica-Bold').text('Authorized Signature', pageWidth - margin - 130, footerY + 60, { width: 130, align: 'center' });

}

async function drawCertificate(doc, data) {
  const {
      studentName,
      studentWalletAddress,
      certificationData,
      issueDate,
      verificationUrl,
      institutionName,
      issuerWalletAddress,
      issuerRegistration,
      ipfsUrl
  } = data;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  doc.lineWidth(1).strokeColor(COLORS.primary)
     .rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

  // Corner decorations
  const cornerLen = 40;
  const inset = 35;
  doc.lineWidth(3).strokeColor(COLORS.primary);
  
  // TL
  doc.moveTo(inset, inset + cornerLen).lineTo(inset, inset).lineTo(inset + cornerLen, inset).stroke();
  // TR
  doc.moveTo(pageWidth - inset - cornerLen, inset).lineTo(pageWidth - inset, inset).lineTo(pageWidth - inset, inset + cornerLen).stroke();
  // BR
  doc.moveTo(pageWidth - inset, pageHeight - inset - cornerLen).lineTo(pageWidth - inset, pageHeight - inset).lineTo(pageWidth - inset - cornerLen, pageHeight - inset).stroke();
  // BL
  doc.moveTo(inset + cornerLen, pageHeight - inset).lineTo(inset, pageHeight - inset).lineTo(inset, pageHeight - inset - cornerLen).stroke();


  let cursorY = 80;

  doc.fillColor(COLORS.dark).font('Helvetica-Bold').fontSize(28)
     .text(institutionName.toUpperCase(), 0, cursorY, { align: 'center' });
  
  cursorY += 45; // Increased from 35
  doc.fillColor(COLORS.primary).font('Helvetica').fontSize(10)
     .text('VERIFIED BLOCKCHAIN CREDENTIAL', 0, cursorY, { align: 'center', charSpacing: 2 });

  cursorY += 60;
  doc.fillColor(COLORS.secondary).font('Helvetica-Oblique').fontSize(14)
     .text('This verifies that', 0, cursorY, { align: 'center' });

  cursorY += 40; // Increased from 30
  doc.fillColor(COLORS.dark).font('Helvetica-Bold').fontSize(36)
     .text(studentName, 0, cursorY, { align: 'center' });

  cursorY += 50; // Increased from 30
  doc.fillColor(COLORS.secondary).font('Helvetica').fontSize(10)
     .text(studentWalletAddress, 0, cursorY, { align: 'center' });

  cursorY += 35;
  doc.fillColor(COLORS.secondary).font('Helvetica-Oblique').fontSize(14)
     .text('Has successfully completed the requirements for', 0, cursorY, { align: 'center' });

  cursorY += 30;
  const title = certificationData?.title || 'Certification';
  doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(24)
     .text(title, 0, cursorY, { align: 'center' });

  if (certificationData?.level) {
      cursorY += 25;
      doc.fillColor(COLORS.secondary).font('Helvetica').fontSize(14)
         .text(certificationData.level, 0, cursorY, { align: 'center' });
  }


  const footerY = pageHeight - 130; // Moved down from -150

  // Left Side: Date & Issuer Details
  doc.fillColor(COLORS.textMain).font('Helvetica-Bold').fontSize(9)
     .text('DATE ISSUED', 100, footerY + 30);
  doc.font('Helvetica').fontSize(9)
     .text(new Date(issueDate).toLocaleDateString(), 100, footerY + 42);

  doc.fontSize(7).fillColor(COLORS.secondary);
  let detailY = footerY + 60;
  if (issuerRegistration) {
      doc.text(`Reg. No: ${issuerRegistration}`, 100, detailY);
      detailY += 10;
  }
  if (issuerWalletAddress) {
      doc.text(`Issuer Wallet: ${issuerWalletAddress}`, 100, detailY, { width: 220 });
  }

  const qrSize = 50; 
  let qrY = footerY + 10;
  const qrTarget = ipfsUrl || verificationUrl;
  
  if(qrTarget){
    try {
        const qrData = await QRCode.toDataURL(qrTarget);
        doc.image(qrData, (pageWidth - qrSize) / 2, qrY, { width: qrSize });
    } catch (e) { prevConsole.warn('QR Code generation failed', e); }
  }
  
  doc.fontSize(7).fillColor(COLORS.secondary)
     .text('SCAN TO VERIFY', 0, qrY + qrSize + 5, { align: 'center', width: pageWidth });


  const brandTextCert = 'attestify.';
  doc.fontSize(10).font('Helvetica-Bold');
  const brandWidthCert = doc.widthOfString(brandTextCert);
  const brandXCert = (pageWidth - brandWidthCert) / 2;
  const brandYCert = qrY + qrSize + 20;

  doc.fillColor(COLORS.dark).text('attestify', brandXCert, brandYCert, { continued: true });
  doc.fillColor(COLORS.primary).text('.');


  const sigX = pageWidth - 200;
  doc.lineWidth(1).strokeColor(COLORS.secondary).moveTo(sigX, footerY + 40).lineTo(sigX + 120, footerY + 40).stroke();
  doc.fontSize(9).font('Helvetica-Bold').text('AUTHORIZED SIGNATURE', sigX, footerY + 50, { width: 120, align: 'center' });

}
