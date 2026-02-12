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
    // studentWalletAddress can now be Wallet Address OR Credential ID
    const { studentWalletAddress } = req.body; 
    const file = req.file;

    if (!file || !studentWalletAddress) {
      return res.status(400).json({ 
        error: 'Credential ID/Wallet Address and certificate file are required' 
      });
    }

    tempFilePath = file.path;

    // Generate hash from uploaded file
    const uploadedHash = await hashService.generateSHA256(file.path);
    const mongoose = require('mongoose');

    let credential = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(studentWalletAddress);

    // 1. Try to find by ID if valid ObjectId
    if (isObjectId) {
        credential = await Credential.findById(studentWalletAddress).populate('issuedBy', 'name university email');
        // If found by ID, we must also check if the HASH matches, otherwise it's the wrong file for this ID
        if (credential && credential.certificateHash !== uploadedHash) {
             // Mismatch
             // We can fall through to "not found" or specific mismatch error?
             // Let's stick to standard flow: if hash doesn't match, verifyCredential below (or manual check) catches it.
        }
    }

    // 2. If not found by ID (or not ID), try by Wallet Address + Hash
    if (!credential) {
        credential = await Credential.findOne({ 
            studentWalletAddress: studentWalletAddress.toLowerCase(),
            certificateHash: uploadedHash
        }).populate('issuedBy', 'name university email');
    }

    if (!credential) {
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return res.json({
        valid: false,
        exists: false,
        message: 'No matching credential found for this ID/Wallet and File'
      });
    }

    // Verify on blockchain (Use ID as key)
    // We try validating with ID first (new standard)
    let isValidOnChain = await blockchainService.verifyCredential(
      credential._id.toString(),
      uploadedHash
    );

    // Fallback: If failed, try legacy wallet address (only if it wasn't revoked/invalid due to other reasons)
    if (!isValidOnChain) {
        // Only try fallback if we suspect it might be old format
        // Check if verifyCredential returned false or error? Logic says false.
        const legacyValid = await blockchainService.verifyCredential(
            credential.studentWalletAddress,
            uploadedHash
        );
        if (legacyValid) isValidOnChain = true;
    }

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
        inputIdentifier: studentWalletAddress,
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
          // registrationNumber removed
          studentWalletAddress: credential.studentWalletAddress,
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
          // registrationNumber removed
          studentWalletAddress: credential.studentWalletAddress,
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
    const { walletAddress } = req.params;

    // A wallet might have multiple credentials. This endpoint seems to be "check if ANY exist".
    // Or maybe return the latest one?
    // Let's return the list.
    const credentials = await Credential.find({ studentWalletAddress: walletAddress })
      .populate('issuedBy', 'name university')
      .lean();

    if (!credentials || credentials.length === 0) {
      return res.json({
        exists: false,
        message: 'No credentials found for this Wallet Address'
      });
    }

    res.json({
      exists: true,
      credentials: credentials.map(c => ({
        studentName: c.studentName,
        studentWalletAddress: c.studentWalletAddress,
        university: c.university,
        issueDate: c.issueDate,
        issuedBy: c.issuedBy.name,
        isRevoked: c.isRevoked,
        transactionHash: c.transactionHash,
        ipfsCID: c.ipfsCID
      }))
    });

  } catch (error) {
    console.error('Check exists error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify by hash only
exports.verifyByHash = async (req, res) => {
  try {
    // studentWalletAddress can now be Wallet Address OR Credential ID
    const { studentWalletAddress, hash } = req.body;

    if (!studentWalletAddress || !hash) {
      return res.status(400).json({ 
        error: 'Credential ID/Wallet Address and hash are required' 
      });
    }

    const mongoose = require('mongoose');
    let credential = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(studentWalletAddress);

    // 1. Try to find by ID
    if (isObjectId) {
         credential = await Credential.findById(studentWalletAddress).populate('issuedBy', 'name university email');
    }

    // 2. Fallback: Find by Wallet + Hash (only if not found by ID)
    if (!credential) {
         credential = await Credential.findOne({ 
           studentWalletAddress: studentWalletAddress.toLowerCase(),
           certificateHash: hash
         }).populate('issuedBy', 'name university email');
    }

    if (!credential) {
      return res.json({
        valid: false,
        exists: false,
        message: 'No matching credential found for this ID/Wallet and Hash'
      });
    }

    // CRITICAL FIX: Check Hash Mismatch BEFORE Revocation
    // If the provided file hash does not match the stored credential hash, it is NOT this credential (or it is tampered).
    if (credential.certificateHash !== hash) {
        return res.json({
            valid: false,
            exists: true, // Credential exists, but file is wrong
            message: 'Certificate hash does not match. The file provided does not correspond to this credential ID.'
        });
    }

    // Check revocation status
    if (credential.isRevoked) {
      return res.json({
        valid: false,
        exists: true,
        revoked: true,
        message: 'This certificate has been revoked',
        credential: {
          studentName: credential.studentName,
          // registrationNumber removed
          studentWalletAddress: credential.studentWalletAddress,
          university: credential.university,
          revokedAt: credential.revokedAt,
          revocationReason: credential.revocationReason
        }
      });
    }

    // 3. Verify on blockchain (Use ID)
    let isValidOnChain = await blockchainService.verifyCredential(
      credential._id.toString(),
      hash
    );

    // Fallback for legacy
    if (!isValidOnChain) {
        const legacyValid = await blockchainService.verifyCredential(
            credential.studentWalletAddress,
            hash
        );
        if (legacyValid) isValidOnChain = true;
    }

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
        inputIdentifier: studentWalletAddress,
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
          // registrationNumber removed
          studentWalletAddress: credential.studentWalletAddress,
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
