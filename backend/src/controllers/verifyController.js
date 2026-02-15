const Credential = require('../models/Credential');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const fs = require('fs');
const { AUDIT_ACTIONS } = require('../config/constants');
const asyncHandler = require('../middleware/asyncHandler');
exports.verifyWithFile = asyncHandler(async (req, res) => {
  let tempFilePath = null;

  try {
    const { studentWalletAddress } = req.body; 
    const file = req.file;

    if (!file || !studentWalletAddress) {
      return res.status(400).json({ 
        error: 'Credential ID/Wallet Address and certificate file are required' 
      });
    }

    tempFilePath = file.path;

    const uploadedHash = await hashService.generateSHA256(file.path);
    const mongoose = require('mongoose');

    let credential = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(studentWalletAddress);

    if (isObjectId) {
        credential = await Credential.findById(studentWalletAddress).populate('issuedBy', 'name university email');
    }

    if (!credential) {
        credential = await Credential.findOne({ 
            studentWalletAddress: studentWalletAddress.toLowerCase(),
            certificateHash: uploadedHash
        }).populate('issuedBy', 'name university email');
    }

    if (!credential) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return res.json({
        valid: false,
        exists: false,
        message: 'No matching credential found for this ID/Wallet and File'
      });
    }

    let isValidOnChain = await blockchainService.verifyCredential(
      credential._id.toString(),
      uploadedHash
    );

    if (!isValidOnChain) {
        const legacyValid = await blockchainService.verifyCredential(
            credential.studentWalletAddress,
            uploadedHash
        );
        if (legacyValid) isValidOnChain = true;
    }

    credential.verificationCount += 1;
    credential.lastVerifiedAt = new Date();
    await credential.save();

    await credential.save();


    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (credential.isRevoked) {
      return res.json({
        valid: false,
        exists: true,
        revoked: true,
        message: 'This certificate has been revoked',
        credential: {
          studentName: credential.studentName,
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
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
});

exports.checkExists = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

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
});

exports.verifyByHash = asyncHandler(async (req, res) => {
  const { studentWalletAddress, hash } = req.body;

  if (!studentWalletAddress || !hash) {
    return res.status(400).json({ 
      error: 'Credential ID/Wallet Address and hash are required' 
    });
  }

  const mongoose = require('mongoose');
  let credential = null;
  const isObjectId = mongoose.Types.ObjectId.isValid(studentWalletAddress);

  if (isObjectId) {
       credential = await Credential.findById(studentWalletAddress).populate('issuedBy', 'name university email');
  }

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

  if (credential.certificateHash !== hash) {
      return res.json({
          valid: false,
          exists: true,
          message: 'Certificate hash does not match. The file provided does not correspond to this credential ID.'
      });
  }

  if (credential.isRevoked) {
    return res.json({
      valid: false,
      exists: true,
      revoked: true,
      message: 'This certificate has been revoked',
      credential: {
        studentName: credential.studentName,
        studentWalletAddress: credential.studentWalletAddress,
        university: credential.university,
        revokedAt: credential.revokedAt,
        revocationReason: credential.revocationReason
      }
    });
  }

  let isValidOnChain = await blockchainService.verifyCredential(
    credential._id.toString(),
    hash
  );

  if (!isValidOnChain) {
      const legacyValid = await blockchainService.verifyCredential(
          credential.studentWalletAddress,
          hash
      );
      if (legacyValid) isValidOnChain = true;
  }

  credential.verificationCount += 1;
  credential.lastVerifiedAt = new Date();
  await credential.save();

    await credential.save();


  if (isValidOnChain && hash === credential.certificateHash) {
    return res.json({
      valid: true,
      exists: true,
      message: 'Certificate is authentic and valid',
      credential: {
        studentName: credential.studentName,
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
});
