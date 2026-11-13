const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const FONT_PATHS = {
  bold: path.join(__dirname, '../assets/fonts/SpaceGrotesk-Bold.ttf'),
  regular: path.join(__dirname, '../assets/fonts/SpaceGrotesk-Regular.ttf')
};

const hasSpaceGrotesk = fs.existsSync(FONT_PATHS.bold) && fs.existsSync(FONT_PATHS.regular);
const FONT_BRAND_BOLD = hasSpaceGrotesk ? 'SpaceGrotesk-Bold' : 'Helvetica-Bold';
const FONT_BRAND_REGULAR = hasSpaceGrotesk ? 'SpaceGrotesk' : 'Helvetica';

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

function drawAttestifyLogo(doc, x, y, size = 12) {
  doc.save();
  const s = size / 48;
  doc.translate(x, y);
  doc.scale(s);
  const grad1 = doc.linearGradient(0, 0, 48, 48);
  grad1.stop(0, '#818cf8').stop(0.5, '#6366f1').stop(1, '#9333ea');
  doc.polygon(
    [0, 48], [0, 32], [16, 32], [16, 16], [32, 16], [32, 0],
    [48, 0], [48, 16], [32, 16], [32, 32], [16, 32], [16, 48]
  ).fill(grad1);

  const grad2 = doc.linearGradient(32, 48, 48, 32);
  grad2.stop(0, '#4f46e5').stop(0.5, '#7c3aed').stop(1, '#c084fc');
  doc.roundedRect(32, 32, 16, 16, 2.5).fill(grad2);
  doc.restore();
}

async function drawQRCodeAndBrand(doc, targetUrl, pageWidth, footerY) {
  const qrSize = 50;
  const qrY = footerY + 8;

  if (targetUrl) {
    try {
      const qrData = await QRCode.toDataURL(targetUrl);
      doc.image(qrData, (pageWidth - qrSize) / 2, qrY, { width: qrSize });
    } catch (e) {
      console.warn('QR Code generation failed', e);
    }
  }

  doc.fontSize(7).font(FONT_BRAND_REGULAR).fillColor(COLORS.secondary)
     .text('SCAN TO VERIFY', 0, qrY + qrSize + 4, { align: 'center', width: pageWidth });

  const logoSize = 12;
  const brandFontSize = 11;
  doc.font(FONT_BRAND_BOLD).fontSize(brandFontSize);
  const brandText = 'attestify';
  const textWidth = doc.widthOfString(brandText, { characterSpacing: -0.3 });
  const gap = 4.5;
  const totalWidth = logoSize + gap + textWidth;
  const brandX = (pageWidth - totalWidth) / 2;
  const brandY = qrY + qrSize + 18;
  const logoY = brandY + 0.8;

  drawAttestifyLogo(doc, brandX, logoY, logoSize);
  doc.fillColor(COLORS.dark).text(brandText, brandX + logoSize + gap, brandY, {
    characterSpacing: -0.3,
    lineBreak: false
  });
}

function drawLabelValue(doc, label, value, x, y) {
  doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.secondary).text(label.toUpperCase(), x, y);
  doc.fontSize(11).font('Helvetica').fillColor(COLORS.dark).text(value, x, y + 12);
}

exports.generateCredentialPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const isTranscript = data.type === 'TRANSCRIPT';
      const { studentWalletAddress, credentialId, institutionName } = data;

      const doc = new PDFDocument({
        layout: isTranscript ? 'portrait' : 'landscape',
        size: 'A4',
        margin: 0,
        bufferPages: true,
        info: {
          Title: `${institutionName} - ${isTranscript ? 'Academic Transcript' : 'Certification'}`,
          Author: institutionName,
          Subject: credentialId,
          Keywords: `${credentialId}, ${studentWalletAddress}`,
          Creator: 'attestify',
          Producer: 'attestify pdf engine'
        }
      });

      if (hasSpaceGrotesk) {
        doc.registerFont('SpaceGrotesk-Bold', FONT_PATHS.bold);
        doc.registerFont('SpaceGrotesk', FONT_PATHS.regular);
      }

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      (isTranscript ? drawTranscript(doc, data) : drawCertificate(doc, data))
        .then(() => doc.end())
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

async function drawTranscript(doc, data) {
  const {
    studentName, studentWalletAddress, credentialId, transcriptData,
    issueDate, verificationUrl, institutionName, issuerWalletAddress,
    issuerRegistration, ipfsUrl
  } = data;

  const margin = 50;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  doc.rect(0, 0, pageWidth, 120).fill(COLORS.lightGray);

  doc.fillColor(COLORS.dark);
  doc.fontSize(22).font('Helvetica-Bold').text(institutionName, margin, 40);
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.secondary)
     .text('OFFICIAL ACADEMIC TRANSCRIPT', margin, 70, { charSpacing: 1 });

  const badgeWidth = 120;
  doc.roundedRect(pageWidth - margin - badgeWidth, 40, badgeWidth, 24, 12).fill(COLORS.white);
  doc.fontSize(8).font(FONT_BRAND_BOLD).fillColor(COLORS.primary)
     .text('VERIFIED CREDENTIAL', pageWidth - margin - badgeWidth, 48, { width: badgeWidth, align: 'center' });

  doc.lineWidth(2).strokeColor(COLORS.primary).moveTo(0, 118).lineTo(pageWidth, 118).stroke();

  const gridY = 140;
  const col2X = margin + 250;

  drawLabelValue(doc, 'Student Name', studentName, margin, gridY);
  drawLabelValue(doc, 'Student ID / Wallet', studentWalletAddress.substring(0, 20) + '...', col2X, gridY);
  drawLabelValue(doc, 'Program', transcriptData?.program || 'N/A', margin, gridY + 40);
  drawLabelValue(doc, 'Credential ID', credentialId, col2X, gridY + 40);
  drawLabelValue(doc, 'Admission Year', transcriptData?.admissionYear || 'N/A', margin, gridY + 80);
  drawLabelValue(doc, 'Graduation Year', transcriptData?.graduationYear || 'N/A', col2X, gridY + 80);

  let tableY = gridY + 120;
  const col1 = margin;
  const col2 = margin + contentWidth * 0.15;
  const col3 = margin + contentWidth * 0.65;
  const col4 = margin + contentWidth * 0.85;
  const rowHeight = 20;

  const drawTableHeader = (y) => {
    doc.rect(margin, y, contentWidth, rowHeight).fill(COLORS.tableHeader);
    doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold');
    const hY = y + 6;
    doc.text('CODE', col1 + 10, hY);
    doc.text('COURSE TITLE', col2 + 10, hY);
    doc.text('GRADE', col3 + 10, hY);
    doc.text('CREDITS', col4 + 10, hY);
  };

  drawTableHeader(tableY);

  let y = tableY + rowHeight;
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMain);

  if (Array.isArray(transcriptData?.courses)) {
    transcriptData.courses.forEach((course, index) => {
      if (y > doc.page.height - 180) {
        doc.addPage();
        y = 50;
        drawTableHeader(y);
        y += rowHeight;
        doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMain);
      }

      if (index % 2 !== 0) {
        doc.rect(margin, y, contentWidth, rowHeight).fill(COLORS.lightGray);
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

  const footerY = doc.page.height - 120;

  doc.fontSize(9).font('Helvetica').fillColor(COLORS.secondary)
     .text(`Issued On: ${new Date(issueDate).toLocaleDateString()}`, margin, footerY + 40);
  doc.fontSize(8).font(FONT_BRAND_REGULAR).text('Generated via Attestify', margin, footerY + 55);
  if (issuerRegistration) doc.text(`Reg. No: ${issuerRegistration}`, margin, footerY + 70);
  if (issuerWalletAddress) doc.text(`Issuer Wallet: ${issuerWalletAddress}`, margin, footerY + 85, { width: 250 });

  await drawQRCodeAndBrand(doc, ipfsUrl || verificationUrl, pageWidth, footerY);

  const sigX = pageWidth - margin - 150;
  doc.lineWidth(1).strokeColor(COLORS.border).moveTo(sigX, footerY + 55).lineTo(sigX + 150, footerY + 55).stroke();
  doc.fontSize(9).font('Helvetica-Bold').text('Authorized Signature', pageWidth - margin - 130, footerY + 60, { width: 130, align: 'center' });
}

async function drawCertificate(doc, data) {
  const {
    studentName, studentWalletAddress, credentialId, certificationData, issueDate,
    verificationUrl, institutionName, issuerWalletAddress, issuerRegistration, ipfsUrl
  } = data;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const inset = 35;
  const cornerLen = 40;

  doc.lineWidth(1).strokeColor(COLORS.primary)
     .rect(inset, inset, pageWidth - 70, pageHeight - 70).stroke();

  doc.lineWidth(3).strokeColor(COLORS.primary);
  doc.moveTo(inset, inset + cornerLen).lineTo(inset, inset).lineTo(inset + cornerLen, inset).stroke();
  doc.moveTo(pageWidth - inset - cornerLen, inset).lineTo(pageWidth - inset, inset).lineTo(pageWidth - inset, inset + cornerLen).stroke();
  doc.moveTo(pageWidth - inset, pageHeight - inset - cornerLen).lineTo(pageWidth - inset, pageHeight - inset).lineTo(pageWidth - inset - cornerLen, pageHeight - inset).stroke();
  doc.moveTo(inset + cornerLen, pageHeight - inset).lineTo(inset, pageHeight - inset).lineTo(inset, pageHeight - inset - cornerLen).stroke();

  let cursorY = 80;

  doc.fillColor(COLORS.dark).font('Helvetica-Bold').fontSize(28)
     .text(institutionName.toUpperCase(), 0, cursorY, { align: 'center' });

  cursorY += 45;
  doc.fillColor(COLORS.primary).font(FONT_BRAND_BOLD).fontSize(10)
     .text('VERIFIED BLOCKCHAIN CREDENTIAL', 0, cursorY, { align: 'center', charSpacing: 2 });

  cursorY += 60;
  doc.fillColor(COLORS.secondary).font('Helvetica-Oblique').fontSize(14)
     .text('This verifies that', 0, cursorY, { align: 'center' });

  cursorY += 40;
  doc.fillColor(COLORS.dark).font('Helvetica-Bold').fontSize(36)
     .text(studentName, 0, cursorY, { align: 'center' });

  cursorY += 50;
  doc.fillColor(COLORS.secondary).font('Helvetica').fontSize(10)
     .text(studentWalletAddress, 0, cursorY, { align: 'center' });

  cursorY += 35;
  doc.fillColor(COLORS.secondary).font('Helvetica-Oblique').fontSize(14)
     .text('Has successfully completed the requirements for', 0, cursorY, { align: 'center' });

  cursorY += 30;
  doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(24)
     .text(certificationData?.title || 'Certification', 0, cursorY, { align: 'center' });

  if (certificationData?.level) {
    cursorY += 25;
    doc.fillColor(COLORS.secondary).font('Helvetica').fontSize(14)
       .text(certificationData.level, 0, cursorY, { align: 'center' });
  }

  const footerY = pageHeight - 130;

  doc.fillColor(COLORS.textMain).font('Helvetica-Bold').fontSize(9).text('DATE ISSUED', 100, footerY + 30);
  doc.font('Helvetica').fontSize(9).text(new Date(issueDate).toLocaleDateString(), 100, footerY + 42);

  doc.fontSize(7).fillColor(COLORS.secondary);
  let detailY = footerY + 56;
  if (credentialId) { doc.text(`Certificate ID: ${credentialId}`, 100, detailY); detailY += 10; }
  if (issuerRegistration) { doc.text(`Reg. No: ${issuerRegistration}`, 100, detailY); detailY += 10; }
  if (issuerWalletAddress) doc.text(`Issuer Wallet: ${issuerWalletAddress}`, 100, detailY, { width: 220 });

  await drawQRCodeAndBrand(doc, ipfsUrl || verificationUrl, pageWidth, footerY);

  const sigX = pageWidth - 200;
  doc.lineWidth(1).strokeColor(COLORS.secondary).moveTo(sigX, footerY + 40).lineTo(sigX + 120, footerY + 40).stroke();
  doc.fontSize(9).font('Helvetica-Bold').text('AUTHORIZED SIGNATURE', sigX, footerY + 50, { width: 120, align: 'center' });
}
