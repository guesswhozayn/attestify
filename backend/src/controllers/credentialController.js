const Credential = require('../models/Credential');
const AuditLog = require('../models/AuditLog');

const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const hashService = require('../services/hashService');
const fs = require('fs');
const { AUDIT_ACTIONS } = require('../config/constants');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const emailService = require('../services/emailService');
const axios = require('axios');
const csv = require('csv-parser');
const pdfService = require('../services/pdfService');
const asyncHandler = require('../middleware/asyncHandler');

async function ensureLogoCID(branding) {
  if (branding?.logoCID) return branding.logoCID;
  if (!branding?.logo) return null;

  if (branding.logo.includes('gateway.pinata.cloud/ipfs/')) {
    return branding.logo.split('/').pop();
  }

  if (branding.logo.includes('/uploads/')) {
    try {
      const filename = branding.logo.split('/').pop();
      const localPath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(localPath)) {
        const result = await ipfsService.uploadFile(localPath, filename);
        return result.ipfsHash;
      }
    } catch (err) {
      console.warn('Failed to upload local logo to IPFS for SBT:', err.message);
    }
  }
  return null;
}

async function prepareSBTMetadata(user, credential, ipfsCID) {
  const branding = user.issuerDetails?.branding || {};
  const logoCID = await ensureLogoCID(branding);

  const metadata = {
    name: `${credential.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'Certification'}: ${credential.studentName}`,
    description: `A verifiable digital credential issued by ${credential.university} on ${new Date(credential.issueDate).toLocaleDateString()}. Secured by Attestify.`,
    image: logoCID ? `ipfs://${logoCID}` : null,
    external_url: `${process.env.FRONTEND_URL}/dashboard`,    attributes: [
      { trait_type: "Degree Type", value: credential.type },
      { trait_type: "Issued By", value: credential.university },
      { trait_type: "Issue Date", value: new Date(credential.issueDate).toISOString().split('T')[0] },
      { trait_type: "PDF Proof", value: `ipfs://${ipfsCID}` },
      { trait_type: "Status", value: "Verified" }
    ]
  };

  const result = await ipfsService.uploadJSON(metadata, `SBT_Metadata_${credential._id}.json`);
  return `ipfs://${result.ipfsHash}`;
}

exports.issueCredential = asyncHandler(async (req, res) => {
  let tempFilePath = null;
  let tempImagePath = null;

  try {
    const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
    const studentImageFile = req.files && req.files['studentImage'] ? req.files['studentImage'][0] : null;


    let parsedTranscriptData = transcriptData;
    let parsedCertificationData = certificationData;

    try {
      if (typeof transcriptData === 'string') parsedTranscriptData = JSON.parse(transcriptData);
      if (typeof certificationData === 'string') parsedCertificationData = JSON.parse(certificationData);
    } catch (e) {
      console.warn('Failed to parse JSON data', e);
    }


    const credential = new Credential({
      studentWalletAddress,
      studentName,
      university,
      issueDate: new Date(issueDate),
      type,
      transcriptData: parsedTranscriptData,
      certificationData: parsedCertificationData,
      issuedBy: req.user._id,
      metadata: {}
    });

    const credentialId = credential._id.toString();


    const branding = req.user.issuerDetails?.branding || {};
    const assets = {
      logo: null,
      seal: null,
      signature: null
    };

    const fetchImage = async (source, type) => {
      if (!source) return null;
      

      if (fs.existsSync(source)) {
          try {
              return fs.readFileSync(source);
          } catch (err) {
              console.warn(`Failed to read local ${type}:`, err);
          }
      }


      if (source.includes('/uploads/')) {
          try {

              const filename = source.split('/uploads/')[1];
              const localPath = path.join(__dirname, '../../uploads', filename);
              if (fs.existsSync(localPath)) {
                  return fs.readFileSync(localPath);
              }
          } catch (err) {
              console.warn(`Failed to resolve local URL ${source}:`, err);
          }
      }

      try {

        const url = ipfsService.getIPFSUrl(source);
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        return response.data;
      } catch (error) {
        console.warn(`Failed to fetch ${type} asset ${source}:`, error.message);
        return null;
      }
    };


    const [logoBuffer, sealBuffer, signatureBuffer] = await Promise.all([
      fetchImage(branding.logo || branding.logoCID, 'logo'),
      fetchImage(branding.seal || branding.sealCID, 'seal'),
      fetchImage(branding.signature || branding.signatureCID, 'signature')
    ]);
    
    assets.logo = logoBuffer;
    assets.seal = sealBuffer;
    assets.signature = signatureBuffer;


    console.log('Generating PDF for:', studentWalletAddress, 'Type:', type, 'ID:', credentialId);
    

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    tempFilePath = path.join(uploadsDir, `cert_${credentialId}_${Date.now()}.pdf`);
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
    const writeStream = fs.createWriteStream(tempFilePath);
    doc.pipe(writeStream);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify/${credentialId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    const institutionName = req.user.issuerDetails?.institutionName || university || 'Attestify University';

    if (type === 'TRANSCRIPT') {
      doc.rect(0, 0, doc.page.width, 100).fill('#f9fafb');
      doc.fillColor('#000000'); 
      let headerY = 30;
      let logoAdded = false;
      if (assets.logo) {
         try {
           doc.image(assets.logo, 40, 20, { height: 60 });
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


      if (assets.seal) {
         try {
           doc.save();
           doc.opacity(0.1);
           doc.image(assets.seal, doc.page.width / 2 - 150, doc.page.height / 2 - 150, { width: 300 });
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
      doc.font('Helvetica').text(`Program:`, leftCol, infoY).font('Helvetica-Bold').text(parsedTranscriptData?.program || 'N/A', leftCol + 60, infoY);
      doc.font('Helvetica').text(`ID:`, rightCol, infoY).font('Helvetica-Bold').text(credentialId, rightCol + 60, infoY);
      
      infoY += 20;
      doc.font('Helvetica').text(`Admitted:`, leftCol, infoY).font('Helvetica-Bold').text(parsedTranscriptData?.admissionYear || 'N/A', leftCol + 60, infoY);
      doc.font('Helvetica').text(`Graduated:`, rightCol, infoY).font('Helvetica-Bold').text(parsedTranscriptData?.graduationYear || 'N/A', rightCol + 60, infoY);
      
      doc.moveDown(2);


      let tableY = infoY + 40;
      const colCode = 40;
      const colTitle = 140;
      const colGrade = 550;
      const colCredit = 650;
      const colPoints = 720;


      doc.rect(colCode - 10, tableY - 5, doc.page.width - 60, 25).fill('#f3f4f6');
      doc.fillColor('#000');

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('CODE', colCode, tableY);
      doc.text('COURSE TITLE', colTitle, tableY);
      doc.text('GRADE', colGrade, tableY);
      doc.text('CREDITS', colCredit, tableY);
      

      doc.font('Helvetica');
      let y = tableY + 30;
      
      if (parsedTranscriptData?.courses && Array.isArray(parsedTranscriptData.courses)) {
        parsedTranscriptData.courses.forEach((course, i) => {
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
      doc.text(`Cumulative GPA: ${parsedTranscriptData?.cgpa || 'N/A'}`, 40, y, { align: 'right', width: doc.page.width - 80 });
      
      
      // Footer Signatures
      y = doc.page.height - 100;
      
      // Date on Left
      doc.fontSize(10).font('Helvetica').text(`Issued: ${new Date(issueDate).toLocaleDateString()}`, 50, y + 10);
      doc.fontSize(8).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleDateString()}`, 50, y + 25);
      doc.fillColor('#000');

      // Seal in Center
      if (assets.seal) {
          try {
             doc.image(assets.seal, doc.page.width / 2 - 40, y - 30, { width: 80 });
          } catch (e) {
             console.warn('Failed to embed footer seal:', e.message); 
          }
      }

      if (assets.signature) {
          try {
            doc.image(assets.signature, doc.page.width - 160, y - 40, { width: 100 });
          } catch (e) {
            console.warn('Failed to embed signature:', e.message); 
          }
      }
      doc.moveTo(doc.page.width - 200, y).lineTo(doc.page.width - 50, y).stroke();
      doc.fontSize(10).font('Helvetica').text('Authorized Signature', doc.page.width - 200, y + 5, { width: 150, align: 'center' });


      doc.image(qrCodeDataUrl, doc.page.width - 100, 30, { width: 60 });

    } else {
      const borderWidth = 20;
      doc.lineWidth(2).strokeColor('#c084fc').rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.lineWidth(1).strokeColor('#e9d5ff').rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();
      doc.lineWidth(3).strokeColor('#9333ea')
         .moveTo(30, 60).lineTo(30, 30).lineTo(60, 30).stroke();
      doc.moveTo(doc.page.width - 60, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 60).stroke();

      let logoY = 60;
      if (assets.logo) {
         try {
           doc.image(assets.logo, doc.page.width / 2 - 60, logoY, { width: 120 });
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
      let title = parsedCertificationData?.title || 'Program Completion';
      doc.fontSize(28).font('Helvetica-Bold').text(title, { align: 'center', color: '#bea0ff' }); // Purple accent
      
      if (parsedCertificationData?.level) {
         doc.moveDown(0.5);
         doc.fontSize(16).font('Helvetica').text(`${parsedCertificationData.level}`, { align: 'center', color: '#4b5563' });
      }


      
      const footerY = doc.page.height - 100;
      doc.fontSize(12).font('Helvetica').fillColor('#374151');
      doc.text(`Issued: ${new Date(issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, 60, footerY + 10);
      

      if (assets.seal) {
          try {
             doc.image(assets.seal, doc.page.width / 2 - 40, footerY - 40, { width: 80 });
          } catch (e) {
             console.warn('Failed to embed certificate seal:', e.message); 
          }
      }

      doc.image(qrCodeDataUrl, doc.page.width / 2 - 25, footerY + 50, { width: 50 });


      if (assets.signature) {
          try {
             doc.image(assets.signature, doc.page.width - 220, footerY - 50, { width: 120 });
          } catch (e) {
             console.warn('Failed to embed certificate signature:', e.message); 
          }
      }
      doc.lineWidth(1).strokeColor('#9ca3af').moveTo(doc.page.width - 240, footerY).lineTo(doc.page.width - 60, footerY).stroke();
      doc.fontSize(10).text('Authorized Signature', doc.page.width - 240, footerY + 10, { width: 180, align: 'center' });
    }

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const certificateHash = await hashService.generateSHA256(tempFilePath);


    const ipfsResult = await ipfsService.uploadFile(
      tempFilePath,
      `Certificate_${credentialId}.pdf`
    );


    let studentImageUrl = req.body.studentImage; 
    
    if (studentImageFile) {
      try {
        tempImagePath = studentImageFile.path;
        const imageIpfsResult = await ipfsService.uploadFile(
          studentImageFile.path,
          `${credentialId}_image_${studentImageFile.originalname}`
        );
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }


    const tokenURI = `ipfs://${ipfsResult.ipfsHash}`;
    

    const certificatePromise = blockchainService.issueCertificate(
      credentialId, 
      certificateHash,
      ipfsResult.ipfsHash
    );

    const sbtPromise = (async () => {
        try {

            const metadataURI = await prepareSBTMetadata(req.user, credential, ipfsResult.ipfsHash);
            
            const res = await blockchainService.issueSoulboundCredential(
                studentWalletAddress,
                metadataURI
            );
            return res;
        } catch (sbtError) {
            console.error('Failed to mint SBT:', sbtError);
            return null;
        }
    })();


    const [blockchainResult, sbtResult] = await Promise.all([certificatePromise, sbtPromise]);


    if (sbtResult) {
        credential.tokenId = sbtResult.tokenId;
    }
    credential.studentImage = studentImageUrl;
    credential.certificateHash = certificateHash;
    credential.ipfsCID = ipfsResult.ipfsHash;
    credential.transactionHash = blockchainResult.transactionHash;
    credential.blockNumber = blockchainResult.blockNumber;
    credential.gasUsed = blockchainResult.gasUsed;
    credential.gasPrice = blockchainResult.gasPrice;
    credential.totalCost = blockchainResult.totalCost;
    credential.metadata = {
      fileSize: fs.statSync(tempFilePath).size,
      fileType: 'application/pdf',
      originalFileName: `Certificate_${credentialId}.pdf`
    };

    await credential.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_ISSUED,
      performedBy: req.user._id,
      targetCredential: credential._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        studentWalletAddress,
        transactionHash: blockchainResult.transactionHash,
        ipfsCID: ipfsResult.ipfsHash
      }
    });

    try {
        const User = require('../models/User');
        const studentUser = await User.findOne({ walletAddress: studentWalletAddress });
        
         if (studentUser && studentUser.email) {
              const instituteLogo = req.user.issuerDetails?.branding?.logo || 
                                   (req.user.issuerDetails?.branding?.logoCID ? `https://gateway.pinata.cloud/ipfs/${req.user.issuerDetails.branding.logoCID}` : null);

              const emailData = {
                 studentName,
                 university: req.user.issuerDetails?.institutionName || university,
                 issueDate,
                 transactionHash: blockchainResult.transactionHash,
                 id: credential._id,
                 ipfsCID: ipfsResult.ipfsHash,
                 certificateLink: `${process.env.FRONTEND_URL}/dashboard`,
                 loginLink: `${process.env.FRONTEND_URL}/login`,
                 tokenId: credential.tokenId,
                 instituteLogo: instituteLogo
              };
              
              emailService.sendCertificateIssued(studentUser.email, emailData).catch(err => 
                 console.error('Failed to send issuance email:', err)
              );
         }
    } catch (emailError) {
        console.error('Email service error during issuance:', emailError);
    }

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      credential: {
        id: credential._id,
        studentName: credential.studentName,
        university: credential.university,
        issueDate: credential.issueDate,
        ipfsCID: credential.ipfsCID,
        transactionHash: credential.transactionHash,
        blockNumber: credential.blockNumber
      },
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost
      },
      ipfs: {
        cid: ipfsResult.ipfsHash,
        url: ipfsService.getIPFSUrl(ipfsResult.ipfsHash)
      }
    });

  } catch (error) {
    console.error('Issue credential error:', error);
    
    try {
      const logPath = path.join(__dirname, '../../logs/issue_error.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.stack}\n\n`);
    } catch (logErr) {
      console.error('Failed to write to log file:', logErr);
    }

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (req.files && req.files['studentImage'] && req.files['studentImage'][0]) {
      const imgPath = req.files['studentImage'][0].path;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_ISSUED,
      performedBy: req.user?._id,
      status: 'failed',
      errorMessage: error.message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    throw error;
  }
});

const fetchImageFromSource = async (source, type) => {
  if (!source) return null;
  
  if (require('fs').existsSync(source)) {
      try {
          return require('fs').readFileSync(source);
      } catch (e) {
          console.warn(`Failed to read local batch ${type}:`, e);
      }
  }

  if (source.includes('/uploads/')) {
      try {
          const filename = source.split('/uploads/')[1];
          const localPath = path.join(__dirname, '../../uploads', filename);
          if (require('fs').existsSync(localPath)) {
              return require('fs').readFileSync(localPath);
          }
      } catch (err) {
           console.warn(`Failed to resolve local URL batch ${source}:`, err);
      }
  }

  try {
    const url = ipfsService.getIPFSUrl(source);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch ${type} asset ${source}:`, error.message);
    return null;
  }
};

exports.batchIssueCredentials = asyncHandler(async (req, res) => {
  const file = req.files && req.files['file'] ? req.files['file'][0] : null;
  if (!file) {
    return res.status(400).json({ error: 'No CSV file provided' });
  }

  const results = [];
  
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
  } catch (parseError) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Failed to parse CSV file', details: parseError.message });
  }

  const branding = req.user.issuerDetails?.branding || {};
  const assets = { logo: null, seal: null, signature: null };

  try {
    const [logoBuffer, sealBuffer, signatureBuffer] = await Promise.all([
      fetchImageFromSource(branding.logo || branding.logoCID, 'logo'),
      fetchImageFromSource(branding.seal || branding.sealCID, 'seal'),
      fetchImageFromSource(branding.signature || branding.signatureCID, 'signature')
    ]);
    assets.logo = logoBuffer;
    assets.seal = sealBuffer;
    assets.signature = signatureBuffer;
  } catch (assetError) {
    console.warn('Failed to fetch branding assets for batch:', assetError);
  }

  const summary = {
    total: results.length,
    success: 0,
    failed: 0,
    details: []
  };

  const processRow = async (row) => {
    let tempFilePath = null;
    try {
      if (!row.studentName || !row.studentWalletAddress) {
        throw new Error('Missing required fields: studentName or studentWalletAddress');
      }

      const type = row.type || 'CERTIFICATION';
      const issueDate = row.issueDate ? new Date(row.issueDate) : new Date();

      let transcriptData = {};
      let certificationData = {};

      if (type === 'TRANSCRIPT') {
         transcriptData = {
           program: row.program,
           department: row.department,
           admissionYear: row.admissionYear,
           graduationYear: row.graduationYear,
           cgpa: row.cgpa,
           courses: row.courses ? row.courses.split('|').map(c => {
             const [code, name, grade, credits] = c.split(';');
             return { code, name, grade, credits };
           }) : []
         };
      } else {
         certificationData = {
           title: row.title || row.certificationTitle,
           description: row.description,
           level: row.level,
           score: row.score,
           duration: row.duration
         };
      }

      const credential = new Credential({
        studentWalletAddress: row.studentWalletAddress,
        studentName: row.studentName,
        university: req.user.issuerDetails?.institutionName || row.university || 'Attestify University',
        issueDate: issueDate,
        type,
        transcriptData,
        certificationData,
        issuedBy: req.user._id,
        metadata: {}
      });

      const credentialId = credential._id.toString();
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      tempFilePath = path.join(uploadsDir, `batch_cert_${credentialId}_${Date.now()}.pdf`);

      const institutionName = req.user.issuerDetails?.institutionName || credential.university;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify/${credentialId}`;

      await pdfService.generateCredentialPDF({
        type,
        studentName: credential.studentName,
        studentWalletAddress: credential.studentWalletAddress,
        university: credential.university,
        issueDate: credential.issueDate,
        credentialId,
        transcriptData,
        certificationData,
        verificationUrl,
        institutionName
      }, assets, tempFilePath);

      const certificateHash = await hashService.generateSHA256(tempFilePath);
      const ipfsResult = await ipfsService.uploadFile(tempFilePath, `Certificate_${credentialId}.pdf`);

      const certificatePromise = blockchainService.issueCertificate(
        credentialId,
        certificateHash,
        ipfsResult.ipfsHash
      );

      const sbtPromise = (async () => {
          try {
              const metadataURI = await prepareSBTMetadata(req.user, credential, ipfsResult.ipfsHash);
              const res = await blockchainService.issueSoulboundCredential(
                  row.studentWalletAddress,
                  metadataURI
              );
              return res;
          } catch (sbtError) {
              console.error('Failed to mint Batch SBT:', sbtError);
              return null;
          }
      })();

      const [blockchainResult, sbtResult] = await Promise.all([certificatePromise, sbtPromise]);

      if (sbtResult) {
          credential.tokenId = sbtResult.tokenId;
      }
      credential.certificateHash = certificateHash;
      credential.ipfsCID = ipfsResult.ipfsHash;
      credential.transactionHash = blockchainResult.transactionHash;
      credential.blockNumber = blockchainResult.blockNumber;
      credential.gasUsed = blockchainResult.gasUsed;
      credential.gasPrice = blockchainResult.gasPrice;
      credential.totalCost = blockchainResult.totalCost;
      credential.metadata = {
        fileSize: fs.statSync(tempFilePath).size,
        fileType: 'application/pdf',
        originalFileName: `Certificate_${credentialId}.pdf`
      };

      await credential.save();

      await AuditLog.create({
        action: AUDIT_ACTIONS.CREDENTIAL_ISSUED,
        performedBy: req.user._id,
        targetCredential: credential._id,
        ipAddress: req.ip,
        details: { batch: true, studentWalletAddress: row.studentWalletAddress }
      });

      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      try {
          const User = require('../models/User');
          const studentUser = await User.findOne({ walletAddress: row.studentWalletAddress.toLowerCase() });
          
          if (studentUser && studentUser.email) {
              const instituteLogo = req.user.issuerDetails?.branding?.logo || 
                                   (req.user.issuerDetails?.branding?.logoCID ? `https://gateway.pinata.cloud/ipfs/${req.user.issuerDetails.branding.logoCID}` : null);

              const emailData = {
                  studentName: row.studentName,
                  university: req.user.issuerDetails?.institutionName || row.university || 'Attestify',
                  issueDate: credential.issueDate,
                  transactionHash: blockchainResult.transactionHash,
                  id: credential._id,
                  ipfsCID: ipfsResult.ipfsHash,
                  certificateLink: `${process.env.FRONTEND_URL}/dashboard`,
                  loginLink: `${process.env.FRONTEND_URL}/login`,
                  tokenId: credential.tokenId,
                  instituteLogo: instituteLogo
              };

              emailService.sendCertificateIssued(studentUser.email, emailData).catch(err => 
                  console.error(`Failed to send batch email to ${studentUser.email}:`, err)
              );
          }
      } catch (emailErr) {
          console.error('Batch email service error:', emailErr);
      }
 
      return { status: 'success', id: credentialId, tx: blockchainResult.transactionHash };

    } catch (error) {
       if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
       throw error;
    }
  };

  for (const row of results) {
    try {
      const res = await processRow(row);
      summary.success++;
      summary.details.push({ ...row, ...res });
    } catch (err) {
      summary.failed++;
      summary.details.push({ ...row, status: 'failed', error: err.message });
      console.error('Batch row failed:', err);
    }
  }

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  res.json({ success: true, summary });
});

exports.getCredentials = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    revoked = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  if (req.user.role === 'ISSUER') {
    query.issuedBy = req.user._id;
  } else {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User wallet address not found' });
    }
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  if (type) {
      query.type = type;
  }

  if (search) {
    query.$or = [
      { studentName: new RegExp(search, 'i') },
      { studentWalletAddress: new RegExp(search, 'i') },
      { university: new RegExp(search, 'i') }
    ];
  }

  if (revoked !== null) {
    query.isRevoked = revoked === 'true';
  }

  const credentials = await Credential.find(query)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('issuedBy', 'name email university instituteDetails')
    .lean();

  const count = await Credential.countDocuments(query);

  res.json({
    success: true,
    credentials,
    pagination: {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit)
    }
  });
});

exports.getCredentialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id)
    .populate('issuedBy', 'name email university instituteDetails')
    .populate('revokedBy', 'name email');

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  const ipfsUrl = ipfsService.getIPFSUrl(credential.ipfsCID);
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${credential.transactionHash}`;

  res.json({
    success: true,
    credential,
    ipfsUrl,
    etherscanUrl
  });
});

exports.getCredentialsByStudentWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const credentials = await Credential.find({ studentWalletAddress: walletAddress.toLowerCase() })
    .populate('issuedBy', 'name email university instituteDetails')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    credentials
  });
});

exports.revokeCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const credential = await Credential.findById(id);

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  if (credential.isRevoked) {
    return res.status(400).json({ error: 'Credential already revoked' });
  }

  const blockchainResult = await blockchainService.revokeCertificate(
    credential._id.toString()
  );

  if (credential.tokenId) {
      try {
          await blockchainService.revokeSoulboundCredential(credential.tokenId);
      } catch (sbtError) {
          console.error('Failed to revoke SBT:', sbtError);
      }
  }

  credential.isRevoked = true;
  credential.revokedAt = new Date();
  credential.revokedBy = req.user._id;
  credential.revocationReason = reason;
  credential.revocationGasUsed = blockchainResult.gasUsed;
  credential.revocationGasPrice = blockchainResult.gasPrice;
  credential.revocationTotalCost = blockchainResult.totalCost;
  await credential.save();

  await AuditLog.create({
    action: AUDIT_ACTIONS.CREDENTIAL_REVOKED,
    performedBy: req.user._id,
    targetCredential: credential._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    details: {
      studentWalletAddress: credential.studentWalletAddress,
      transactionHash: blockchainResult.transactionHash,
      reason
    }
  });

  res.json({
    success: true,
    message: 'Credential revoked successfully',
    transactionHash: blockchainResult.transactionHash,
    blockNumber: blockchainResult.blockNumber
  });
});

exports.getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isIssuer = req.user.role === 'ISSUER';
  
  const query = {};
  if (isIssuer) {
    query.issuedBy = userId;
  } else {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User wallet address not found' });
    }
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  const total = await Credential.countDocuments(query);
  const active = await Credential.countDocuments({ 
    ...query, 
    isRevoked: false 
  });
  const revoked = await Credential.countDocuments({ 
    ...query, 
    isRevoked: true 
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonth = await Credential.countDocuments({
    ...query,
    createdAt: { $gte: startOfMonth }
  });

  const recent = await Credential.find(query)
    .sort({ createdAt: -1 })
    .limit(5)
    .select('studentName university createdAt type')
    .lean();

  const walletAddress = req.user.instituteDetails?.authorizedWalletAddress || req.user.walletAddress;
  let gasBalance = '0.00';
  
  if (walletAddress) {
      try {
          gasBalance = await blockchainService.getBalance(walletAddress);
          gasBalance = parseFloat(gasBalance).toFixed(4);
      } catch (e) {
          console.warn('Failed to fetch balance:', e);
      }
  }

  res.json({
    success: true,
    stats: {
      total,
      active,
      revoked,
      thisMonth,
      gasBalance,
      today: await Credential.countDocuments({
         ...query,
         createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }),
      thisWeek: await Credential.countDocuments({
         ...query,
         createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      }),
      verificationRequests: (await Credential.aggregate([
         { $match: query },
         { $group: { _id: null, total: { $sum: "$verificationCount" } } }
      ]))[0]?.total || 0,
      networkStats: await blockchainService.getNetworkStats(),
      transactionSuccessRate: await (async () => {
         // Should calculate based on AuditLogs for the user
         const successCount = await AuditLog.countDocuments({ 
             performedBy: userId, 
             action: 'CREDENTIAL_ISSUED',
             status: 'success'
         });
         const totalAttempts = await AuditLog.countDocuments({ 
             performedBy: userId, 
             action: 'CREDENTIAL_ISSUED'
         });
         return totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 100;
      })()
    },
    recent
  });
});

exports.verifyCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id)
    .populate('issuedBy', 'name university email instituteDetails')
    .lean();

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  let blockchainData = null;
  try {
      blockchainData = await blockchainService.getCredential(id);
  } catch (blockchainError) {
      console.warn('Failed to fetch from blockchain during verification:', blockchainError.message);
  }

  const result = {
    ...credential,
    institutionName: credential.issuedBy?.instituteDetails?.institutionName || credential.university || 'Attestify Institution',
    blockchainProof: blockchainData ? {
      hashMatch: blockchainData.certificateHash === credential.certificateHash,
      onChain: true,
      isRevokedOnChain: blockchainData.isRevoked
    } : { onChain: false }
  };

  res.json({
    success: true,
    credential: result
  });
});
