const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');


exports.generateCredentialPDF = async (data, brandingAssets, outputPath) => {
  const { 
    type, 
    studentName, 
    studentWalletAddress, 
    university, 
    issueDate, 
    credentialId, 
    transcriptData, 
    certificationData,
    verificationUrl,
    institutionName 
  } = data;

  const { logo, seal, signature } = brandingAssets;

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);


      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

      if (type === 'TRANSCRIPT') {


        doc.rect(0, 0, doc.page.width, 100).fill('#f9fafb');
        doc.fillColor('#000000');
        let headerY = 30;
        let logoAdded = false;
        if (logo) {
           try {
             doc.image(logo, 40, 20, { height: 60 });
             logoAdded = true;
           } catch (e) {
             console.warn('Failed to embed logo:', e.message);
           }
        }
        
        if (logoAdded) {
           doc.fontSize(24).font('Helvetica-Bold').text(institutionName, 120, headerY);
        } else {
           doc.fontSize(24).font('Helvetica-Bold').text(institutionName, 40, headerY);
        }
        
        doc.fontSize(10).font('Helvetica').text('OFFICIAL ACADEMIC TRANSCRIPT', 40, 85, { 
            width: doc.page.width - 80, 
            align: 'right' 
        });
  

        if (seal) {
           try {
             doc.save();
             doc.opacity(0.1);
             doc.image(seal, doc.page.width / 2 - 150, doc.page.height / 2 - 150, { width: 300 });
             doc.restore();
           } catch (e) {
              console.warn('Failed to embed watermark seal:', e.message);
              doc.restore();
           }
        }
  
        doc.moveDown(4);
  

        doc.fontSize(10).font('Helvetica-Bold');
        const leftCol = 40;
        const rightCol = 400;
        let infoY = 120;
        
        doc.text('STUDENT DETAILS', leftCol, infoY);
        doc.rect(leftCol, infoY + 15, doc.page.width - 80, 1).fill('#e5e7eb');
        doc.fillColor('#000');
        
        infoY += 30;
        doc.text(`Name:`, leftCol, infoY).font('Helvetica-Bold').text(studentName, leftCol + 60, infoY);
        doc.font('Helvetica').text(`Wallet:`, rightCol, infoY).font('Helvetica-Bold').text(studentWalletAddress.substring(0, 10) + '...', rightCol + 60, infoY);
        
        infoY += 20;
        doc.font('Helvetica').text(`Program:`, leftCol, infoY).font('Helvetica-Bold').text(transcriptData?.program || 'N/A', leftCol + 60, infoY);
        doc.font('Helvetica').text(`ID:`, rightCol, infoY).font('Helvetica-Bold').text(credentialId, rightCol + 60, infoY); 
  
        infoY += 20;
        doc.font('Helvetica').text(`Admitted:`, leftCol, infoY).font('Helvetica-Bold').text(transcriptData?.admissionYear || 'N/A', leftCol + 60, infoY);
        doc.font('Helvetica').text(`Graduated:`, rightCol, infoY).font('Helvetica-Bold').text(transcriptData?.graduationYear || 'N/A', rightCol + 60, infoY);
        
        doc.moveDown(2);
  

        let tableY = infoY + 40;
        const colCode = 40;
        const colTitle = 140;
        const colGrade = 550;
        const colCredit = 650;
  

        doc.rect(colCode - 10, tableY - 5, doc.page.width - 60, 25).fill('#f3f4f6');
        doc.fillColor('#000');
  
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('CODE', colCode, tableY);
        doc.text('COURSE TITLE', colTitle, tableY);
        doc.text('GRADE', colGrade, tableY);
        doc.text('CREDITS', colCredit, tableY);
        
      // Course List
        doc.font('Helvetica');
        let y = tableY + 30;
        
        if (transcriptData?.courses && Array.isArray(transcriptData.courses)) {
          transcriptData.courses.forEach((course, i) => {
            if (y > doc.page.height - 100) {
              doc.addPage({ layout: 'landscape', size: 'A4', margin: 40 });
              y = 50;
            }
            

            if (i % 2 === 1) {
                doc.rect(colCode - 10, y - 5, doc.page.width - 60, 20).fill('#fafafa');
                doc.fillColor('#000');
            }
  
            doc.text(course.code || '', colCode, y);
            doc.text(course.name || '', colTitle, y);
            doc.text(course.grade || '', colGrade, y);
            doc.text(course.credits || '', colCredit, y);
            y += 20;
          });
        }
  
        y += 20;
        doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#e5e7eb').stroke();
        
        // Summary & Footer
        y += 20;
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Cumulative GPA: ${transcriptData?.cgpa || 'N/A'}`, 40, y, { align: 'right', width: doc.page.width - 80 });
        
        // Footer section alignment
        const footerY = doc.page.height - 100;
        
        // 1. LEFT: Issued Date & Info
        doc.fontSize(10).font('Helvetica').fillColor('#1f2937')
           .text(`Issued: ${new Date(issueDate).toLocaleDateString()}`, 50, footerY);
        doc.fontSize(8).fillColor('#64748b')
           .text(`Credential ID: ${credentialId.substring(0, 16)}...`, 50, footerY + 15)
           .text(`Generated: ${new Date().toLocaleDateString()}`, 50, footerY + 25);
        doc.fillColor('#000');
  

        doc.image(qrCodeDataUrl, doc.page.width / 2 - 30, footerY - 20, { width: 60 });
        doc.fontSize(8).font('Helvetica').fillColor('#64748b')
           .text('SCAN TO VERIFY', 0, footerY + 45, { align: 'center', width: doc.page.width });
  
        // 3. RIGHT: Seal & Signature
        const rightEdge = doc.page.width - 50;
        const signatureWidth = 140;
        const signatureX = rightEdge - signatureWidth;


        if (seal) {
            try {
               doc.save();
               doc.opacity(0.8);
               doc.image(seal, signatureX - 40, footerY - 40, { width: 70 });
               doc.restore();
            } catch (e) {
               console.warn('Failed to embed footer seal:', e.message); 
            }
        }
  

        if (signature) {
            try {
              doc.image(signature, signatureX, footerY - 45, { width: signatureWidth, height: 40, fit: [signatureWidth, 40] });
            } catch (e) {
              console.warn('Failed to embed signature:', e.message); 
            }
        }
        
        doc.lineWidth(1).strokeColor('#e2e8f0').moveTo(signatureX, footerY).lineTo(rightEdge, footerY).stroke();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1f2937')
           .text('Authorized Signature', signatureX, footerY + 10, { width: signatureWidth, align: 'center' });
  
      } else {

        

        doc.lineWidth(2).strokeColor('#c084fc').rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        doc.lineWidth(1).strokeColor('#e9d5ff').rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();
        

        doc.lineWidth(3).strokeColor('#9333ea')
           .moveTo(30, 60).lineTo(30, 30).lineTo(60, 30).stroke();
        
        doc.moveTo(doc.page.width - 60, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 60).stroke();
  
        // 3. Header & Logo
        let logoY = 60;
        if (logo) {
           try {
             doc.image(logo, doc.page.width / 2 - 60, logoY, { width: 120 });
             logoY += 140; 
           } catch (e) {
             console.warn('Failed to embed certificate logo:', e.message);
             logoY += 40;
           }
        } else {
           logoY += 40;
        }
        
        doc.fillColor('#1f2937');
        doc.fontSize(36).font('Helvetica-Bold').text(institutionName, 0, logoY, { align: 'center' });
        
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica').text('CERTIFICATE OF COMPLETION', { align: 'center', characterSpacing: 2 });
        

        doc.moveDown(2);
        doc.fontSize(16).font('Helvetica-Oblique').text('This is to certify that', { align: 'center', color: '#4b5563' });
        
        doc.moveDown(1);
        doc.fontSize(32).font('Helvetica-Bold').text(studentName, { align: 'center', color: '#111827' });
        
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Wallet: ${studentWalletAddress}`, { align: 'center', color: '#6b7280' });
        
        doc.moveDown(1.5);
        doc.fontSize(16).text('Has successfully completed the requirements for', { align: 'center', color: '#4b5563' });
        
        doc.moveDown(1);
        let title = certificationData?.title || 'Program Completion';
        doc.fontSize(28).font('Helvetica-Bold').text(title, { align: 'center', color: '#bea0ff' }); 
        
        if (certificationData?.level) {
           doc.moveDown(0.5);
           doc.fontSize(16).font('Helvetica').text(`${certificationData.level}`, { align: 'center', color: '#4b5563' });
        }
  
        // 5. Footer & Signatures
        const footerY = doc.page.height - 100;
        const sideMargin = 80;
        if (seal) {
            try {
               doc.image(seal, sideMargin, footerY - 40, { width: 80 });
            } catch (e) {
               console.warn('Failed to embed certificate seal:', e.message); 
            }
        }
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
           .text(`Issued: ${new Date(issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, sideMargin, footerY + 50);

        doc.image(qrCodeDataUrl, doc.page.width / 2 - 30, footerY - 10, { width: 60 });
        doc.fontSize(8).font('Helvetica').fillColor('#64748b')
           .text('SCAN TO VERIFY', 0, footerY + 55, { align: 'center', width: doc.page.width });
        const sigWidth = 150;
        const sigX = doc.page.width - sideMargin - sigWidth;

        if (signature) {
            try {
               doc.image(signature, sigX, footerY - 45, { width: sigWidth, height: 45, fit: [sigWidth, 45] });
            } catch (e) {
               console.warn('Failed to embed certificate signature:', e.message); 
            }
        }
        
        doc.lineWidth(1).strokeColor('#9ca3af').moveTo(sigX, footerY + 5).lineTo(sigX + sigWidth, footerY + 5).stroke();
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1f2937')
           .text('Authorized Signature', sigX, footerY + 15, { width: sigWidth, align: 'center' });
           
        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
           .text(`Credential ID: ${credentialId}`, sigX, footerY + 30, { width: sigWidth, align: 'center' });
      }
  
      doc.end();
  
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
