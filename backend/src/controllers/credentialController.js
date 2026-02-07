const Credential = require('../models/Credential');
const AuditLog = require('../models/AuditLog');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const hashService = require('../services/hashService');
const fs = require('fs');
const { AUDIT_ACTIONS } = require('../config/constants');

// Issue new credential
exports.issueCredential = async (req, res) => {
  let tempFilePath = null;

  try {
    const { studentId, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
    const certificateFile = req.files['certificate'] ? req.files['certificate'][0] : null;
    const studentImageFile = req.files['studentImage'] ? req.files['studentImage'][0] : null;

    // Parse JSON strings if they come from FormData
    let parsedTranscriptData = transcriptData;
    let parsedCertificationData = certificationData;

    try {
      if (typeof transcriptData === 'string') parsedTranscriptData = JSON.parse(transcriptData);
      if (typeof certificationData === 'string') parsedCertificationData = JSON.parse(certificationData);
    } catch (e) {
      console.warn('Failed to parse JSON data', e);
    }

    if (!certificateFile) {
      return res.status(400).json({ error: 'Certificate file is required' });
    }

    tempFilePath = certificateFile.path;

    // Check if credential already exists
    const existing = await Credential.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ 
        error: 'Credential already exists for this student ID' 
      });
    }

    console.log('Processing certificate for student:', studentId);

    // 1. Generate SHA-256 hash
    const certificateHash = await hashService.generateSHA256(certificateFile.path);
    console.log('Generated hash:', certificateHash);

    // 2. Upload to IPFS
    const ipfsResult = await ipfsService.uploadFile(
      certificateFile.path,
      `${studentId}_${certificateFile.originalname}`
    );
    console.log('Uploaded to IPFS:', ipfsResult.ipfsHash);

    // 2.5 Upload Student Image to IPFS (if provided)
    let studentImageUrl = req.body.studentImage; // Fallback to URL if string provided
    let tempImagePath = null;

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
        // We continue even if image upload fails, or you could return error
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
        fileSize: certificateFile.size,
        fileType: certificateFile.mimetype,
        originalFileName: certificateFile.originalname
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

    // 7. Send email notification (optional)
    // await emailService.sendCertificateIssued(studentEmail, credential);

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
    // Note: tempImagePath is block-scoped above, so we can't access it here easily 
    // without wider scope or checking req.files again. 
    // Let's check req.files directly for cleanup safety.
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
