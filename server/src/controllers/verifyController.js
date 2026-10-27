const fs = require('fs');
const isIdentifier = (val) => typeof val === 'string' && (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) || /^[0-9a-fA-F]{24}$/.test(val));
const { prisma } = require('../config/database');
const hashService = require('../services/hashService');
const blockchainService = require('../services/blockchainService');
const asyncHandler = require('../middleware/asyncHandler');

const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) { console.warn('Failed to delete temp file:', filePath, e.message); }
  }
};

const recordVerification = (credentialId) =>
  prisma.credential.update({
    where: { id: credentialId },
    data: {
      verificationCount: { increment: 1 },
      lastVerifiedAt: new Date()
    }
  });

async function findCredential(identifier, certificateHash = null) {
  if (isIdentifier(identifier)) {
    const cred = await prisma.credential.findUnique({
      where: { id: identifier },
      include: { issuedBy: { select: { id: true, name: true, university: true, email: true, walletAddress: true } } }
    });
    if (cred) return cred;
  }

  if (certificateHash) {
    return prisma.credential.findFirst({
      where: {
        studentWalletAddress: { equals: identifier.toLowerCase().trim(), mode: 'insensitive' },
        certificateHash
      },
      include: { issuedBy: { select: { id: true, name: true, university: true, email: true, walletAddress: true } } }
    });
  }

  return null;
}

async function checkPrivacy(credential, reqUser) {
  const isOwner = reqUser?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = reqUser?.role === 'ISSUER' && (
    reqUser.id === credential.issuedById ||
    reqUser.walletAddress?.toLowerCase() === credential.issuedBy?.walletAddress?.toLowerCase()
  );

  if (isOwner || isIssuer) return true;

  const student = await prisma.user.findFirst({
    where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
  });
  return student?.preferences?.visibility !== false;
}

function buildVerificationResponse(credential, isValidOnChain, hash) {
  if (credential.isRevoked) {
    return {
      valid: false, exists: true, revoked: true,
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
      valid: true, exists: true,
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
      valid: false, exists: true,
      message: 'Certificate hash does not match - possible tampering detected'
    };
  }

  return {
    valid: false, exists: true,
    message: 'On-chain verification failed. The credential may not be minted or the network is unreachable.'
  };
}

const verifyWithFile = asyncHandler(async (req, res) => {
  let tempFilePath = null;
  try {
    const { studentWalletAddress } = req.body;
    const file = req.file;

    if (!file || !studentWalletAddress) {
      return res.status(400).json({ error: 'Credential ID/Wallet Address and certificate file are required' });
    }

    tempFilePath = file.path;
    const uploadedHash = await hashService.generateSHA256(file.path);
    const credential = await findCredential(studentWalletAddress, uploadedHash);

    if (!credential) {
      safeUnlink(tempFilePath);
      return res.json({ valid: false, exists: false, message: 'No matching credential found for this ID/Wallet and File' });
    }

    if (!await checkPrivacy(credential, req.user)) {
      safeUnlink(tempFilePath);
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }

    const isValidOnChain = await blockchainService.verifyCredential(credential.id, uploadedHash);
    await recordVerification(credential.id);
    safeUnlink(tempFilePath);

    return res.json(buildVerificationResponse(credential, isValidOnChain, uploadedHash));
  } catch (error) {
    console.error('Verify error:', error);
    safeUnlink(tempFilePath);
    throw error;
  }
});

const checkExists = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;
  const normalizedWallet = walletAddress.toLowerCase().trim();

  let credentials = [];
  if (isIdentifier(walletAddress)) {
    const cred = await prisma.credential.findUnique({
      where: { id: walletAddress },
      include: { issuedBy: { select: { name: true, university: true } } }
    });
    if (cred) credentials = [cred];
  } else {
    credentials = await prisma.credential.findMany({
      where: { studentWalletAddress: { equals: normalizedWallet, mode: 'insensitive' } },
      include: { issuedBy: { select: { name: true, university: true } } }
    });
  }

  if (!credentials.length) {
    return res.json({ exists: false, message: 'No credentials found for this Wallet Address' });
  }

  const actualWalletAddress = credentials[0].studentWalletAddress;
  const student = await prisma.user.findFirst({
    where: {
      walletAddress: { equals: actualWalletAddress, mode: 'insensitive' },
      role: 'STUDENT'
    }
  });

  if (student?.preferences?.visibility === false) {
    return res.status(403).json({
      exists: true, isPrivate: true,
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
    return res.status(400).json({ error: 'Credential ID/Wallet Address and hash are required' });
  }

  const credential = await findCredential(studentWalletAddress, hash);
  if (!credential) {
    return res.json({ valid: false, exists: false, message: 'No matching credential found for this ID/Wallet and Hash' });
  }

  if (credential.certificateHash !== hash) {
    return res.json({
      valid: false, exists: true,
      message: 'Certificate hash does not match. The file provided does not correspond to this credential ID.'
    });
  }

  if (!await checkPrivacy(credential, req.user)) {
    return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
  }

  const isValidOnChain = await blockchainService.verifyCredential(credential.id, hash);
  await recordVerification(credential.id);

  return res.json(buildVerificationResponse(credential, isValidOnChain, hash));
});

module.exports = { verifyWithFile, checkExists, verifyByHash };
