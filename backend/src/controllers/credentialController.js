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

// Issue new credential
exports.issueCredential = async (req, res) => {
  let tempFilePath = null;
  let tempImagePath = null;

  try {
    const { studentId, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
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

    // Check if credential already exists
    const existing = await Credential.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ 
        error: 'Credential already exists for this student ID' 
      });
    }

    // Generate PDF
    console.log('Generating PDF for:', studentId, 'Type:', type);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    tempFilePath = path.join(uploadsDir, `cert_${studentId}_${Date.now()}.pdf`);
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const writeStream = fs.createWriteStream(tempFilePath);
    doc.pipe(writeStream);

    // Generate QR Code Data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify/${studentId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    if (type === 'TRANSCRIPT') {
      // --- TRANSCRIPT LAYOUT ---
      // Header
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      
      doc.fontSize(24).font('Helvetica-Bold').text(university || 'Attestify University', { align: 'center' });
      doc.fontSize(16).text('OFFICIAL ACADEMIC TRANSCRIPT', { align: 'center' });
      doc.moveDown();

      // Student Details
      doc.fontSize(12).font('Helvetica');
      const startX = 50;
      let currentY = doc.y;
      
      doc.text(`Student Name: ${studentName}`, startX, currentY);
      doc.text(`Registration No: ${studentId}`, startX + 300, currentY);
      currentY += 20;
      doc.text(`Program: ${parsedTranscriptData?.program || 'N/A'}`, startX, currentY);
      doc.text(`Department: ${parsedTranscriptData?.department || 'N/A'}`, startX + 300, currentY);
      currentY += 20;
      doc.text(`Admission Year: ${parsedTranscriptData?.admissionYear || 'N/A'}`, startX, currentY);
      doc.text(`Graduation Year: ${parsedTranscriptData?.graduationYear || 'N/A'}`, startX + 300, currentY);
      
      doc.moveDown(2);

      // Course Table Header
      const tableTop = doc.y + 10;
      const col1 = 50;  // Code
      const col2 = 150; // Course Name
      const col3 = 500; // Grade
      const col4 = 600; // Credits

      doc.font('Helvetica-Bold');
      doc.text('Code', col1, tableTop);
      doc.text('Course Title', col2, tableTop);
      doc.text('Grade', col3, tableTop);
      doc.text('Credits', col4, tableTop);
      
      doc.moveTo(40, tableTop + 15).lineTo(750, tableTop + 15).stroke();
      
      // Course List
      doc.font('Helvetica');
      let y = tableTop + 25;
      
      if (parsedTranscriptData?.courses && Array.isArray(parsedTranscriptData.courses)) {
        parsedTranscriptData.courses.forEach(course => {
          if (y > 500) { // New page if needed
            doc.addPage({ layout: 'landscape', size: 'A4' });
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
            y = 50;
          }
          doc.text(course.code || '', col1, y);
          doc.text(course.name || '', col2, y);
          doc.text(course.grade || '', col3, y);
          doc.text(course.credits || '', col4, y);
          y += 20;
        });
      }

      doc.moveTo(40, y).lineTo(750, y).stroke();
      y += 20;

      // Summary
      doc.font('Helvetica-Bold').fontSize(14);
      doc.text(`CGPA / GPA: ${parsedTranscriptData?.cgpa || 'N/A'}`, col3 - 50, y);
      
      // Footer / Verification
      y = doc.page.height - 120;
      doc.fontSize(10).font('Helvetica');
      doc.text(`Issue Date: ${new Date(issueDate).toLocaleDateString()}`, 50, y);
      
      doc.image(qrCodeDataUrl, doc.page.width - 120, y - 20, { width: 80 });
      doc.text('Scan to Verify', doc.page.width - 120, y + 65, { width: 80, align: 'center' });

    } else {
      // --- CERTIFICATION LAYOUT ---
      // 1. Background / Border (Simple rectangle)
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      
      // 2. Header
      doc.fontSize(30).text(university || 'Attestify University', { align: 'center', valign: 'center' });
      doc.moveDown();
      doc.fontSize(20).text('Certificate of Completion', { align: 'center' });
      doc.moveDown();
      
      // 3. Body
      doc.fontSize(15).text('This is to certify that', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(25).font('Helvetica-Bold').text(studentName, { align: 'center' });
      doc.font('Helvetica').fontSize(15).moveDown(0.5);
      doc.text(`Registration No: ${studentId}`, { align: 'center' });
      doc.moveDown();
      doc.text('Has successfully completed the requirements for', { align: 'center' });
      doc.moveDown(0.5);

      let title = parsedCertificationData?.title || 'Program Completion';
      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      
      if (parsedCertificationData?.level) {
         doc.moveDown(0.5);
         doc.fontSize(14).font('Helvetica').text(`Level: ${parsedCertificationData.level}`, { align: 'center' });
      }

      doc.font('Helvetica').moveDown(2);
      
      doc.fontSize(12).text(`Issued on: ${new Date(issueDate).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // 4. QR Code
      doc.image(qrCodeDataUrl, doc.page.width / 2 - 50, doc.y, { width: 100 });
      doc.fontSize(10).text('Scan to Verify', doc.page.width / 2 - 50, doc.y + 105, { width: 100, align: 'center' });
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
      `Certificate_${studentId}.pdf`
    );
    console.log('Uploaded to IPFS:', ipfsResult.ipfsHash);

    // 2.5 Upload Student Image to IPFS (if provided)
    let studentImageUrl = req.body.studentImage; 
    
    if (studentImageFile) {
      try {
        tempImagePath = studentImageFile.path;
        const imageIpfsResult = await ipfsService.uploadFile(
          studentImageFile.path,
          `${studentId}_image_${studentImageFile.originalname}`
        );
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
        console.log('Uploaded student image to IPFS:', imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }

    // 3. Issue on blockchain
    const blockchainResult = await blockchainService.issueCertificate(
      studentId,
      certificateHash,
      ipfsResult.ipfsHash
    );
    console.log('Blockchain transaction:', blockchainResult.transactionHash);

    // 4. Save to database
    const credential = new Credential({
      studentId,
      studentName,
      university,
      issueDate: new Date(issueDate),
      type,
      transcriptData: parsedTranscriptData,
      certificationData: parsedCertificationData,
      studentImage: studentImageUrl,
      certificateHash,
      ipfsCID: ipfsResult.ipfsHash,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber,
      gasUsed: blockchainResult.gasUsed,
      gasPrice: blockchainResult.gasPrice,
      totalCost: blockchainResult.totalCost,
      issuedBy: req.user._id,
      metadata: {
        fileSize: fs.statSync(tempFilePath).size,
        fileType: 'application/pdf',
        originalFileName: `Certificate_${studentId}.pdf`
      }
    });

    await credential.save();

    // 5. Log action
    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_ISSUED,
      performedBy: req.user._id,
      targetCredential: credential._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        studentId,
        transactionHash: blockchainResult.transactionHash,
        ipfsCID: ipfsResult.ipfsHash
      }
    });

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
        studentId: credential.studentId,
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { issuedBy: req.user._id };

    if (search) {
      query.$or = [
        { studentName: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
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

// Get credential by student ID
exports.getCredentialByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const credential = await Credential.findOne({ studentId })
      .populate('issuedBy', 'name email university');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({
      success: true,
      credential
    });

  } catch (error) {
    console.error('Get credential by student ID error:', error);
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
      credential.studentId
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
        studentId: credential.studentId,
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
      .select('studentName studentId university createdAt')
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
