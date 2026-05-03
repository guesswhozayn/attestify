const Credential = require('../models/Credential');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const fs = require('fs');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Unified credential lookup. Tries to find by MongoDB ObjectId first (credential ID),
 * then falls back to wallet address + hash matching for backward compatibility with
 * older credentials that were indexed by wallet address on-chain.
 */
async function findCredential(identifier, certificateHash = null) {
  let credential = null;

  // Attempt 1: Treat identifier as a credential ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    credential = await Credential.findById(identifier)
      .populate('issuedBy', 'name university email');
  }

  // Attempt 2 (legacy fallback): Treat identifier as a wallet address
  if (!credential && certificateHash) {
    credential = await Credential.findOne({
      studentWalletAddress: identifier.toLowerCase(),
      certificateHash
    }).populate('issuedBy', 'name university email');
  }

  return credential;
}

/**
 * Unified on-chain verification. Tries credential._id first (current scheme),
 * then falls back to wallet address (legacy scheme).
 */
async function verifyOnChain(credential, hash) {
  let isValid = await blockchainService.verifyCredential(
    credential._id.toString(),
    hash
  );

  // Legacy fallback: older credentials may be keyed by wallet address on-chain
  if (!isValid) {
    isValid = await blockchainService.verifyCredential(
      credential.studentWalletAddress,
      hash
    );
  }

  return isValid;
}

async function checkPrivacy(credential, reqUser) {
    const isOwner = reqUser && reqUser.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
    const isIssuer = reqUser && reqUser.role === 'ISSUER' && reqUser.walletAddress?.toLowerCase() === credential.issuedBy?.walletAddress?.toLowerCase();

    if (isOwner || isIssuer) return true;

    const User = require('../models/User');
    const student = await User.findOne({ walletAddress: credential.studentWalletAddress });
    return student?.preferences?.visibility !== false;
}

/**
 * Builds the standard verification response after all checks pass.
 */
function buildVerificationResponse(credential, isValidOnChain, hash) {
  if (credential.isRevoked) {
    return {
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
    };
  }

  if (isValidOnChain && hash === credential.certificateHash) {
    return {
      valid: true,
      exists: true,
      message: 'Certificate is authentic and valid',
      credential: {
        studentName: credential.studentName,
        studentWalletAddress: credential.studentWalletAddress,
        university: credential.university,
        issueDate: credential.issueDate,
        issuedBy: credential.issuedBy?.name || 'Unknown Issuer',
        transactionHash: credential.transactionHash,
        blockNumber: credential.blockNumber,
        ipfsCID: credential.ipfsCID
      }
    };
  }

  if (hash !== credential.certificateHash) {
    return {
      valid: false,
      exists: true,
      message: 'Certificate hash does not match - possible tampering detected'
    };
  }

  return {
    valid: false,
    exists: true,
    message: 'On-chain verification failed. The credential may not be minted or the network is unreachable.'
  };
}

const verifyWithFile = asyncHandler(async (req, res) => {
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

    const credential = await findCredential(studentWalletAddress, uploadedHash);

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

    const isVisible = await checkPrivacy(credential, req.user);
    if (!isVisible) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }

    const isValidOnChain = await verifyOnChain(credential, uploadedHash);

    credential.verificationCount += 1;
    credential.lastVerifiedAt = new Date();
    await credential.save();

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    return res.json(buildVerificationResponse(credential, isValidOnChain, uploadedHash));

  } catch (error) {
    console.error('Verify error:', error);
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
});

const checkExists = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;
  const normalizedWallet = walletAddress.toLowerCase();

  let credentials = [];
  if (mongoose.Types.ObjectId.isValid(walletAddress)) {
    const cred = await Credential.findById(walletAddress)
      .populate('issuedBy', 'name university')
      .lean();
    if (cred) credentials = [cred];
  } else {
    credentials = await Credential.find({ studentWalletAddress: normalizedWallet })
      .populate('issuedBy', 'name university')
      .lean();
  }

  if (!credentials || credentials.length === 0) {
    return res.json({
      exists: false,
      message: 'No credentials found for this Wallet Address'
    });
  }

  // Security & Privacy Check: Check student visibility preference
  const User = require('../models/User');
  const actualWalletAddress = credentials[0].studentWalletAddress;
  const escapedWallet = actualWalletAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const student = await User.findOne({ 
      walletAddress: { $regex: new RegExp(`^${escapedWallet}$`, 'i') },
      role: 'STUDENT'
  });

  if (student?.preferences?.visibility === false) {
    return res.status(403).json({ 
        exists: true,
        isPrivate: true,
        message: 'This student profile is private. Credentials cannot be viewed publicly.' 
    });
  }

  res.json({
    exists: true,
    credentials: credentials.map(c => ({
      studentName: c.studentName,
      studentWalletAddress: c.studentWalletAddress,
      university: c.university,
      issueDate: c.issueDate,
      issuedBy: c.issuedBy?.name || 'Unknown Issuer',
      isRevoked: c.isRevoked,
      transactionHash: c.transactionHash,
      ipfsCID: c.ipfsCID
    }))
  });
});

const verifyByHash = asyncHandler(async (req, res) => {
  const { studentWalletAddress, hash } = req.body;

  if (!studentWalletAddress || !hash) {
    return res.status(400).json({ 
      error: 'Credential ID/Wallet Address and hash are required' 
    });
  }

  const credential = await findCredential(studentWalletAddress, hash);

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

  const isVisible = await checkPrivacy(credential, req.user);
  if (!isVisible) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
  }

  const isValidOnChain = await verifyOnChain(credential, hash);

  credential.verificationCount += 1;
  credential.lastVerifiedAt = new Date();
  await credential.save();

  return res.json(buildVerificationResponse(credential, isValidOnChain, hash));
});

module.exports = {
  verifyWithFile,
  checkExists,
  verifyByHash
};
