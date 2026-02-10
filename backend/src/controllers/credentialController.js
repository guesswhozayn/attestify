const Credential = require('../models/Credential');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification'); // Import Notification model
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const hashService = require('../services/hashService');
const fs = require('fs');
const { AUDIT_ACTIONS } = require('../config/constants');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const emailService = require('../services/emailService');

// Issue new credential
exports.issueCredential = async (req, res) => {
  let tempFilePath = null;
  let tempImagePath = null;

  try {
    const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
    const studentImageFile = req.files && req.files['studentImage'] ? req.files['studentImage'][0] : null;

    // Parse JSON strings if they come from FormData
    let parsedTranscriptData = transcriptData;
    let parsedCertificationData = certificationData;

    try {
      if (typeof transcriptData === 'string') parsedTranscriptData = JSON.parse(transcriptData);
      if (typeof certificationData === 'string') parsedCertificationData = JSON.parse(certificationData);
    } catch (e) {
      console.warn('Failed to parse JSON data', e);
    }

    // Prepare Credential Object EARLY to get the ID
    const credential = new Credential({
      studentWalletAddress,
      studentName,
      university,
      issueDate: new Date(issueDate),
      type,
      transcriptData: parsedTranscriptData,
      certificationData: parsedCertificationData,
      issuedBy: req.user._id,
      // Metadata (will be updated after PDF gen)
      metadata: {}
    });

    // Use credential._id as the unique identifier for blockchain and QR
    const credentialId = credential._id.toString();

    // Check if credential already exists (optional - maybe allow multiples?)
    // For now, let's allow multiple credentials per wallet
    // const existing = await Credential.findOne({ studentWalletAddress, type });

    // Generate PDF
    // Fetch Branding Assets
    const branding = req.user.instituteDetails?.branding || {};
    const assets = {
      logo: null,
      seal: null,
      signature: null
    };

    const axios = require('axios'); // Ensure axios is required

    const fetchImage = async (cid) => {
      if (!cid) return null;
      try {
        const url = ipfsService.getIPFSUrl(cid);
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
      } catch (error) {
        console.warn(`Failed to fetch asset ${cid}:`, error.message);
        return null;
      }
    };

    // Parallel fetch for speed
    const [logoBuffer, sealBuffer, signatureBuffer] = await Promise.all([
      fetchImage(branding.logoCID),
      fetchImage(branding.sealCID),
      fetchImage(branding.signatureCID)
    ]);
    
    assets.logo = logoBuffer;
    assets.seal = sealBuffer;
    assets.signature = signatureBuffer;

    // Generate PDF
    console.log('Generating PDF for:', studentWalletAddress, 'Type:', type, 'ID:', credentialId);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    tempFilePath = path.join(uploadsDir, `cert_${credentialId}_${Date.now()}.pdf`);
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
    const writeStream = fs.createWriteStream(tempFilePath);
    doc.pipe(writeStream);

    // Generate QR Code Data (Point to specific credential verify)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Use credential ID in verification URL if supported, otherwise falling back to wallet logic for now
    // But logically we want to verify THIS credential.
    const verificationUrl = `${frontendUrl}/verify/${credentialId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    const institutionName = req.user.instituteDetails?.institutionName || university || 'Attestify University';

    if (type === 'TRANSCRIPT') {
      // --- TRANSCRIPT LAYOUT ---
      // Header Background
      doc.rect(0, 0, doc.page.width, 100).fill('#f9fafb');
      doc.fillColor('#000000'); // Reset fill
      
      // Branding Header
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

      // Watermark (Seal)
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

      // Student Details Grid
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
      doc.font('Helvetica').text(`ID:`, rightCol, infoY).font('Helvetica-Bold').text(credentialId, rightCol + 60, infoY); // Use ID instead of Dept optional

      infoY += 20;
      doc.font('Helvetica').text(`Admitted:`, leftCol, infoY).font('Helvetica-Bold').text(parsedTranscriptData?.admissionYear || 'N/A', leftCol + 60, infoY);
      doc.font('Helvetica').text(`Graduated:`, rightCol, infoY).font('Helvetica-Bold').text(parsedTranscriptData?.graduationYear || 'N/A', rightCol + 60, infoY);
      
      doc.moveDown(2);

      // Course Table Header
      let tableY = infoY + 40;
      const colCode = 40;
      const colTitle = 140;
      const colGrade = 550;
      const colCredit = 650;
      const colPoints = 720;

      // Table Header Background
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
      
      if (parsedTranscriptData?.courses && Array.isArray(parsedTranscriptData.courses)) {
        parsedTranscriptData.courses.forEach((course, i) => {
          if (y > doc.page.height - 100) { // New page if needed
            doc.addPage({ layout: 'landscape', size: 'A4', margin: 40 });
            y = 50;
            // Re-draw header if needed
          }
          
          // Row shading
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
      
      if (assets.signature) {
          try {
            doc.image(assets.signature, 50, y - 40, { width: 100 });
          } catch (e) {
            console.warn('Failed to embed signature:', e.message); 
          }
      }
      doc.moveTo(50, y).lineTo(200, y).stroke();
      doc.fontSize(8).font('Helvetica').text('Authorized Signature', 50, y + 5);

      if (assets.seal) {
          try {
             doc.image(assets.seal, doc.page.width / 2 - 40, y - 30, { width: 80 });
          } catch (e) {
             console.warn('Failed to embed footer seal:', e.message); 
          }
      }

      // QR Verification
      doc.image(qrCodeDataUrl, doc.page.width - 120, y - 30, { width: 70 });
      doc.text('Scan to Verify', doc.page.width - 120, y + 45, { width: 70, align: 'center' });
      
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 30, { align: 'center', width: doc.page.width - 100, color: '#9ca3af' });

    } else {
      // --- CERTIFICATION LAYOUT ---
      
      // 1. Decorative Border
      const borderWidth = 20;
      doc.lineWidth(2).strokeColor('#c084fc').rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.lineWidth(1).strokeColor('#e9d5ff').rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();
      
      // 2. Corner Ornaments (Simple lines for now)
      // Top Left
      doc.lineWidth(3).strokeColor('#9333ea')
         .moveTo(30, 60).lineTo(30, 30).lineTo(60, 30).stroke();
      // Bottom Right
      doc.moveTo(doc.page.width - 60, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 30).lineTo(doc.page.width - 30, doc.page.height - 60).stroke();

      // 3. Header & Logo
      let logoY = 60;
      if (assets.logo) {
         try {
           doc.image(assets.logo, doc.page.width / 2 - 40, logoY, { width: 80 });
           logoY += 100;
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
      
      // 4. Body Content
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

      doc.moveDown(1);
      doc.fontSize(14).text(`Issued on ${new Date(issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center', color: '#374151' });
      
      // 5. Footer & Signatures
      const footerY = doc.page.height - 120;
      
      // Signature Line
      if (assets.signature) {
          try {
             doc.image(assets.signature, 100, footerY - 50, { width: 120 });
          } catch (e) {
             console.warn('Failed to embed certificate signature:', e.message); 
          }
      }
      doc.lineWidth(1).strokeColor('#9ca3af').moveTo(80, footerY).lineTo(280, footerY).stroke();
      doc.fontSize(10).text('Authorized Signature', 80, footerY + 10, { width: 200, align: 'center' });
      
      // Seal
      if (assets.seal) {
          try {
             doc.image(assets.seal, doc.page.width / 2 - 50, footerY - 40, { width: 100 });
          } catch (e) {
             console.warn('Failed to embed certificate seal:', e.message); 
          }
      }

      // QR & Verification
      doc.image(qrCodeDataUrl, doc.page.width - 200, footerY - 20, { width: 70 });
      doc.text('Scan to Verify', doc.page.width - 200, footerY + 55, { width: 70, align: 'center' });
    }

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log('PDF generated at:', tempFilePath);

    // --- Continuation of Issuance Process ---

    // 1. Generate SHA-256 hash of the generated PDF
    const certificateHash = await hashService.generateSHA256(tempFilePath);
    console.log('Generated hash:', certificateHash);

    // 2. Upload PDF to IPFS
    const ipfsResult = await ipfsService.uploadFile(
      tempFilePath,
      `Certificate_${credentialId}.pdf`
    );
    console.log('Uploaded to IPFS:', ipfsResult.ipfsHash);

    // 2.5 Upload Student Image to IPFS (if provided)
    let studentImageUrl = req.body.studentImage; 
    
    if (studentImageFile) {
      try {
        tempImagePath = studentImageFile.path;
        const imageIpfsResult = await ipfsService.uploadFile(
          studentImageFile.path,
          `${credentialId}_image_${studentImageFile.originalname}`
        );
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
        console.log('Uploaded student image to IPFS:', imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }

    // 3. Issue on blockchain
    // USE CREDENTIAL ID as the "studentId" key
    const blockchainResult = await blockchainService.issueCertificate(
      credentialId, // <--- Key Change
      certificateHash,
      ipfsResult.ipfsHash
    );
    console.log('Blockchain transaction:', blockchainResult.transactionHash);

    // 4. Update and Save to database
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

    // 6. Log action
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

    // 7. Create Notification
    await Notification.create({
        recipient: req.user._id,
        message: `Credential issued successfully to ${studentName} (${studentWalletAddress})`,
        type: 'success',
        relatedId: credential._id
    });

    // 8. Send Email Notification
    try {
        // Attempt to find student user by wallet address to get email
        // We need to require User model if not already (it is NOT imported in credentialController yet)
        // Ignoring User import for now to keep this atomic, assuming I'll add it or use a service.
        // Actually, better to fetch the user here.
        const User = require('../models/User'); // specific import to avoid circular dep issues if any
        const studentUser = await User.findOne({ walletAddress: studentWalletAddress });
        
        if (studentUser && studentUser.email) {
             const emailData = {
                studentName,
                university: req.user.instituteDetails?.institutionName || university,
                issueDate,
                transactionHash: blockchainResult.transactionHash,
                id: credential._id,
                ipfsCID: ipfsResult.ipfsHash,
                certificateLink: `${process.env.FRONTEND_URL}/certificate/${credential._id}`,
                loginLink: `${process.env.FRONTEND_URL}/login`
             };
             
             emailService.sendCertificateIssued(studentUser.email, emailData).catch(err => 
                console.error('Failed to send issuance email:', err)
             );
        } else {
            console.log('No registered user found for wallet ' + studentWalletAddress + ', skipping email.');
        }

    } catch (emailError) {
        console.error('Email service error during issuance:', emailError);
    }

    // 6. Clean up temp files
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
        registrationNumber: credential.registrationNumber,
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
    if (error.stack) console.error(error.stack);
    
    try {
      const logPath = path.join(__dirname, '../../logs/issue_error.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.stack}\n\n`);
    } catch (logErr) {
      console.error('Failed to write to log file:', logErr);
    }

    // Clean up temp files on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (req.files && req.files['studentImage'] && req.files['studentImage'][0]) {
      const imgPath = req.files['studentImage'][0].path;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    // Log failed action
    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_ISSUED,
      performedBy: req.user?._id,
      status: 'failed',
      errorMessage: error.message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(500).json({ 
      error: 'Failed to issue credential',
      details: error.message 
    });
  }
};

// Get all credentials
exports.getCredentials = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      revoked = null,
      type = null, // Add type parameter
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { issuedBy: req.user._id };

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

    // Execute query with pagination
    const credentials = await Credential.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('issuedBy', 'name email university')
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

  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get credential by ID
exports.getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id)
      .populate('issuedBy', 'name email university')
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

  } catch (error) {
    console.error('Get credential error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get credentials by Student Wallet Address
exports.getCredentialsByStudentWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const credentials = await Credential.find({ studentWalletAddress: walletAddress.toLowerCase() })
      .populate('issuedBy', 'name email university')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      credentials
    });

  } catch (error) {
    console.error('Get credentials by wallet error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Revoke credential
exports.revokeCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const credential = await Credential.findById(id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    if (credential.isRevoked) {
      return res.status(400).json({ error: 'Credential already revoked' });
    }

    // Revoke on blockchain
    const blockchainResult = await blockchainService.revokeCertificate(
      credential.studentWalletAddress
    );

    // Update database
    credential.isRevoked = true;
    credential.revokedAt = new Date();
    credential.revokedBy = req.user._id;
    credential.revocationReason = reason;
    credential.revocationGasUsed = blockchainResult.gasUsed;
    credential.revocationGasPrice = blockchainResult.gasPrice;
    credential.revocationTotalCost = blockchainResult.totalCost;
    await credential.save();

    // Log action
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

    // Create Notification
    await Notification.create({
        recipient: req.user._id,
        message: `Credential revoked: ${credential.studentName} (${credential.studentWalletAddress})`,
        type: 'warning',
        relatedId: credential._id
    });

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber
    });

  } catch (error) {
    console.error('Revoke credential error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Credential.countDocuments({ issuedBy: userId });
    const active = await Credential.countDocuments({ 
      issuedBy: userId, 
      isRevoked: false 
    });
    const revoked = await Credential.countDocuments({ 
      issuedBy: userId, 
      isRevoked: true 
    });

    // Get this month's count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await Credential.countDocuments({
      issuedBy: userId,
      createdAt: { $gte: startOfMonth }
    });

    // Get recent credentials
    const recent = await Credential.find({ issuedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('studentName university createdAt')
      .lean();

    res.json({
      success: true,
      stats: {
        total,
        active,
        revoked,
        thisMonth
      },
      recent
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
