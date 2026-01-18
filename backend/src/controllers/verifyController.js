 const Credential = require('../models/Credential');
const AuditLog = require('../models/AuditLog');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const fs = require('fs');
const { AUDIT_ACTIONS } = require('../config/constants');

// Verify certificate with file upload
exports.verifyWithFile = async (req, res) => {
  let tempFilePath = null;

  try {
    const { studentId } = req.body;
    const file = req.file;

    if (!file || !studentId) {
      return res.status(400).json({ 
        error: 'Student ID and certificate file are required' 
      });
    }

    tempFilePath = file.path;

    // Generate hash from uploaded file
    const uploadedHash = await hashService.generateSHA256(file.path);

    // Get credential from database
    const credential = await Credential.findOne({ studentId })
      .populate('issuedBy', 'name university email');

    if (!credential) {
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return res.json({
        valid: false,
        exists: false,
        message: 'No credential found for this student ID'
      });
    }

    // Verify on blockchain
    const isValidOnChain = await blockchainService.verifyCredential(
      studentId,
      uploadedHash
    );

    // Update verification count
    credential.verificationCount += 1;
    credential.lastVerifiedAt = new Date();
    await credential.save();

    // Log verification
    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_VERIFIED,
      targetCredential: credential._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        studentId,
        hashMatch: uploadedHash === credential.certificateHash,
        blockchainValid: isValidOnChain,
        isRevoked: credential.isRevoked
      }
    });

    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Check all conditions
    if (credential.isRevoked) {
      return res.json({
        valid: false,
        exists: true,
        revoked: true,
        message: 'This certificate has been revoked',
        credential: {
          studentName: credential.studentName,
          studentId: credential.studentId,
          university: credential.university,
          revokedAt: credential.revokedAt,
          revocationReason: credential.revocationReason
        }
      });
    }

    if (isValidOnChain && uploadedHash === credential.certificateHash) {
      return res.json({
        valid: true,
        exists: true,
        message: 'Certificate is authentic and valid',
        credential: {
          studentName: credential.studentName,
          studentId: credential.studentId,
          university: credential.university,
          issueDate: credential.issueDate,
          issuedBy: credential.issuedBy.name,
          transactionHash: credential.transactionHash,
          blockNumber: credential.blockNumber,
          ipfsCID: credential.ipfsCID
        }
      });
    } else {
      return res.json({
        valid: false,
        exists: true,
        message: 'Certificate hash does not match - possible tampering detected'
      });
    }

  } catch (error) {
    console.error('Verify error:', error);

    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(500).json({ 
      valid: false,
      error: 'Verification failed',
      details: error.message 
    });
  }
};

// Check if credential exists (lightweight)
exports.checkExists = async (req, res) => {
  try {
    const { studentId } = req.params;

    const credential = await Credential.findOne({ studentId })
      .populate('issuedBy', 'name university')
      .lean();

    if (!credential) {
      return res.json({
        exists: false,
        message: 'No credential found for this student ID'
      });
    }

    res.json({
      exists: true,
      credential: {
        studentName: credential.studentName,
        studentId: credential.studentId,
        university: credential.university,
        issueDate: credential.issueDate,
        issuedBy: credential.issuedBy.name,
        isRevoked: credential.isRevoked,
        transactionHash: credential.transactionHash,
        ipfsCID: credential.ipfsCID
      }
    });

  } catch (error) {
    console.error('Check exists error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify by hash only
exports.verifyByHash = async (req, res) => {
  try {
    const { studentId, hash } = req.body;

    if (!studentId || !hash) {
      return res.status(400).json({ 
        error: 'Student ID and hash are required' 
      });
    }

    // 1. Check if credential exists in DB
    const credential = await Credential.findOne({ studentId })
      .populate('issuedBy', 'name university email');

    if (!credential) {
      return res.json({
        valid: false,
        exists: false,
        message: 'No credential found for this student ID'
      });
    }

    // 2. Check revocation status
    if (credential.isRevoked) {
      return res.json({
        valid: false,
        exists: true,
        revoked: true,
        message: 'This certificate has been revoked',
        credential: {
          studentName: credential.studentName,
          studentId: credential.studentId,
          university: credential.university,
          revokedAt: credential.revokedAt,
          revocationReason: credential.revocationReason
        }
      });
    }

    // 3. Verify on blockchain
    const isValidOnChain = await blockchainService.verifyCredential(
      studentId,
      hash
    );

    // 4. Update verification stats
    credential.verificationCount += 1;
    credential.lastVerifiedAt = new Date();
    await credential.save();

    // 5. Log verification
    await AuditLog.create({
      action: AUDIT_ACTIONS.CREDENTIAL_VERIFIED,
      targetCredential: credential._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        studentId,
        hashMatch: hash === credential.certificateHash,
        blockchainValid: isValidOnChain
      }
    });

    // 6. Return detailed result
    if (isValidOnChain && hash === credential.certificateHash) {
      return res.json({
        valid: true,
        exists: true,
        message: 'Certificate is authentic and valid',
        credential: {
          studentName: credential.studentName,
          studentId: credential.studentId,
          university: credential.university,
          issueDate: credential.issueDate,
          issuedBy: credential.issuedBy.name,
          transactionHash: credential.transactionHash,
          blockNumber: credential.blockNumber,
          ipfsCID: credential.ipfsCID
        }
      });
    } else {
      return res.json({
        valid: false,
        exists: true,
        message: 'Certificate hash does not match - possible tampering detected'
      });
    }

  } catch (error) {
    console.error('Verify by hash error:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Verification failed',
      details: error.message 
    });
  }
};
