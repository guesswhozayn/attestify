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

const normalizeSha256Hash = (val) => {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim().toLowerCase();
  const withPrefix = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
  return /^0x[0-9a-f]{64}$/.test(withPrefix) ? withPrefix : null;
};

async function findCredential(identifier, certificateHash = null) {
  const normalizedHash = certificateHash ? normalizeSha256Hash(certificateHash) : null;
  const trimmedId = typeof identifier === 'string' ? identifier.trim() : '';

  if (trimmedId && isIdentifier(trimmedId)) {
    return prisma.credential.findUnique({
      where: { id: trimmedId },
      include: { issuedBy: { select: { id: true, name: true, university: true, walletAddress: true } } }
    });
  }

  if (normalizedHash) {
    if (trimmedId && /^0x[0-9a-fA-F]{40}$/.test(trimmedId)) {
      return prisma.credential.findFirst({
        where: {
          studentWalletAddress: { equals: trimmedId.toLowerCase(), mode: 'insensitive' },
          certificateHash: { equals: normalizedHash, mode: 'insensitive' }
        },
        include: { issuedBy: { select: { id: true, name: true, university: true, walletAddress: true } } }
      });
    }

    if (!trimmedId || trimmedId === 'credential') {
      return prisma.credential.findFirst({
        where: { certificateHash: { equals: normalizedHash, mode: 'insensitive' } },
        include: { issuedBy: { select: { id: true, name: true, university: true, walletAddress: true } } }
      });
    }
  }

  return null;
}

async function checkPrivacy(credential, reqUser) {
  const isOwner = Boolean(
    reqUser?.walletAddress &&
    credential.studentWalletAddress &&
    reqUser.walletAddress.toLowerCase() === credential.studentWalletAddress.toLowerCase()
  );
  const isIssuer = reqUser?.role === 'ISSUER' && (
    reqUser.id === credential.issuedById ||
    Boolean(
      reqUser.walletAddress &&
      credential.issuedBy?.walletAddress &&
      reqUser.walletAddress.toLowerCase() === credential.issuedBy.walletAddress.toLowerCase()
    )
  );

  if (isOwner || isIssuer) return true;

  const student = await prisma.user.findFirst({
    where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
  });
  return student?.preferences?.visibility !== false;
}

function buildVerificationResponse(credential, isValidOnChain, hash, includeHash = false) {
  const courseOrTitle = credential.certificationData?.title ||
    credential.transcriptData?.program ||
    credential.course ||
    credential.title ||
    'Academic Credential';

  const credentialData = {
    id: credential.id,
    _id: credential.id,
    type: credential.type,
    course: courseOrTitle,
    title: courseOrTitle,
    studentName: credential.studentName,
    studentWalletAddress: credential.studentWalletAddress,
    university: credential.university,
    issueDate: credential.issueDate,
    issuedBy: credential.issuedBy?.name || 'Unknown Issuer',
    transactionHash: credential.transactionHash,
    blockNumber: credential.blockNumber,
    ipfsCID: includeHash ? credential.ipfsCID : undefined,
    certificateHash: includeHash ? credential.certificateHash : undefined,
    isRevoked: credential.isRevoked,
    status: credential.status
  };

  if (credential.status && credential.status !== 'COMPLETED') {
    return {
      valid: false,
      exists: true,
      revoked: false,
      onChainVerified: false,
      message: credential.status === 'FAILED'
        ? 'Credential issuance failed and was not recorded on the blockchain.'
        : 'Credential issuance is still pending blockchain confirmation.',
      credential: credentialData
    };
  }

  if (credential.isRevoked) {
    return {
      valid: false,
      exists: true,
      revoked: true,
      message: 'This certificate has been revoked',
      credential: {
        ...credentialData,
        revokedAt: credential.revokedAt,
        revocationReason: credential.revocationReason
      }
    };
  }

  if (hash && normalizeSha256Hash(hash) !== normalizeSha256Hash(credential.certificateHash)) {
    return {
      valid: false,
      exists: true,
      revoked: false,
      message: 'Certificate hash does not match - possible tampering detected'
    };
  }

  if (isValidOnChain) {
    return {
      valid: true,
      exists: true,
      revoked: false,
      message: 'Certificate is authentic and valid',
      credential: credentialData
    };
  }

  return {
    valid: false,
    exists: true,
    revoked: false,
    onChainVerified: false,
    message: credential.status === 'COMPLETED'
      ? 'Institutional record exists, but on-chain blockchain proof could not be verified.'
      : 'On-chain verification failed. The credential may not be minted or the network is unreachable.',
    credential: credentialData
  };
}

const verifyWithFile = asyncHandler(async (req, res) => {
  const tempFilePath = req.file?.path;
  try {
    const { studentWalletAddress } = req.body;
    const file = req.file;

    if (!file || !studentWalletAddress) {
      safeUnlink(tempFilePath);
      return res.status(400).json({ error: 'Credential ID/Wallet Address and certificate file are required' });
    }

    const header = Buffer.alloc(5);
    const fd = fs.openSync(file.path, 'r');
    try {
      fs.readSync(fd, header, 0, 5, 0);
    } finally {
      fs.closeSync(fd);
    }
    if (header.toString('ascii') !== '%PDF-') {
      safeUnlink(tempFilePath);
      return res.status(400).json({ error: 'Invalid PDF file content' });
    }

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

    const isValidOnChain = credential.status === 'COMPLETED'
      ? await blockchainService.verifyCredential(credential.id, uploadedHash)
      : false;
    if (!credential.isRevoked && isValidOnChain) {
      await recordVerification(credential.id);
    }
    safeUnlink(tempFilePath);

    return res.json({
      ...buildVerificationResponse(credential, isValidOnChain, uploadedHash, true),
      onChainVerified: isValidOnChain,
      verificationTier: 'CRYPTOGRAPHIC_HASH'
    });
  } catch (error) {
    console.error('Verify error:', error);
    safeUnlink(tempFilePath);
    throw error;
  }
});

const checkExists = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;
  const normalizedWallet = walletAddress.toLowerCase().trim();

  if (isIdentifier(walletAddress)) {
    const cred = await prisma.credential.findUnique({
      where: { id: walletAddress },
      include: { issuedBy: { select: { id: true, name: true, university: true, walletAddress: true } } }
    });

    if (!cred) {
      return res.status(404).json({ valid: false, exists: false, message: 'No credential found with this ID' });
    }

    const isOwner = Boolean(
      req.user?.walletAddress &&
      cred.studentWalletAddress &&
      req.user.walletAddress.toLowerCase() === cred.studentWalletAddress.toLowerCase()
    );
    const isIssuer = req.user?.role === 'ISSUER' && (
      req.user.id === cred.issuedById ||
      Boolean(
        req.user.walletAddress &&
        cred.issuedBy?.walletAddress &&
        req.user.walletAddress.toLowerCase() === cred.issuedBy.walletAddress.toLowerCase()
      )
    );
    if (!isOwner && !isIssuer && cred.status !== 'COMPLETED') {
      return res.status(404).json({ valid: false, exists: false, message: 'No credential found with this ID' });
    }

    if (!await checkPrivacy(cred, req.user)) {
      return res.status(403).json({
        exists: true,
        isPrivate: true,
        message: 'This student profile is private. Credentials cannot be viewed publicly.'
      });
    }

    const providedHash = req.query.h || req.query.hash;
    const normalizedProvidedHash = providedHash ? normalizeSha256Hash(providedHash) : null;
    if (providedHash && (!normalizedProvidedHash || normalizedProvidedHash !== normalizeSha256Hash(cred.certificateHash))) {
      return res.json({
        valid: false,
        exists: true,
        revoked: cred.isRevoked,
        message: 'Certificate hash does not match - possible tampering detected'
      });
    }

    let isValidOnChain = false;
    if (cred.status === 'COMPLETED') {
      try {
        isValidOnChain = await blockchainService.verifyCredential(cred.id, cred.certificateHash);
      } catch (e) {
        console.warn('Blockchain verify check failed:', e.message);
      }
    }

    if (!cred.isRevoked && isValidOnChain) {
      await recordVerification(cred.id);
    }
    const verificationResp = buildVerificationResponse(cred, isValidOnChain, cred.certificateHash, Boolean(normalizedProvidedHash));

    return res.json({
      ...verificationResp,
      onChainVerified: isValidOnChain,
      verificationTier: normalizedProvidedHash ? 'CRYPTOGRAPHIC_HASH' : (isValidOnChain ? 'ON_CHAIN_REGISTRY' : 'REGISTRY_RECORD')
    });
  }

  const credentials = await prisma.credential.findMany({
    where: {
      studentWalletAddress: { equals: normalizedWallet, mode: 'insensitive' },
      status: 'COMPLETED'
    },
    include: { issuedBy: { select: { id: true, name: true, university: true, walletAddress: true } } }
  });

  if (!credentials.length) {
    return res.status(404).json({ valid: false, exists: false, message: 'No credentials found for this Wallet Address' });
  }

  const actualWalletAddress = credentials[0].studentWalletAddress;
  const isOwner = req.user?.walletAddress?.toLowerCase() === actualWalletAddress.toLowerCase();
  let visibleCredentials = credentials;

  if (!isOwner) {
    const student = await prisma.user.findFirst({
      where: {
        walletAddress: { equals: actualWalletAddress, mode: 'insensitive' },
        role: 'STUDENT'
      }
    });

    if (student?.preferences?.visibility === false) {
      visibleCredentials = req.user?.role === 'ISSUER'
        ? credentials.filter(c => c.issuedById === req.user.id)
        : [];

      if (!visibleCredentials.length) {
        return res.status(403).json({
          exists: true,
          isPrivate: true,
          message: 'This student profile is private. Credentials cannot be viewed publicly.'
        });
      }
    }
  }

  const mappedCredentials = visibleCredentials.map(c => {
    const courseOrTitle = c.certificationData?.title ||
      c.transcriptData?.program ||
      c.course ||
      c.title ||
      'Academic Credential';

    return {
      id: c.id,
      _id: c.id,
      type: c.type,
      course: courseOrTitle,
      title: courseOrTitle,
      studentName: c.studentName,
      studentWalletAddress: c.studentWalletAddress,
      university: c.university,
      issueDate: c.issueDate,
      issuedBy: c.issuedBy?.name || 'Unknown Issuer',
      isRevoked: c.isRevoked,
      transactionHash: c.transactionHash,
      ipfsCID: (isOwner || (req.user?.role === 'ISSUER' && c.issuedById === req.user.id)) ? c.ipfsCID : undefined
    };
  });

  const primaryCredential = mappedCredentials.find(c => !c.isRevoked) || mappedCredentials[0];

  res.json({
    valid: !primaryCredential.isRevoked,
    exists: true,
    revoked: primaryCredential.isRevoked,
    credential: primaryCredential,
    credentials: mappedCredentials,
    hasActiveCredentials: mappedCredentials.some(c => !c.isRevoked),
    hasRevokedCredentials: mappedCredentials.some(c => c.isRevoked),
    verificationTier: 'REGISTRY_RECORD'
  });
});

const verifyByHash = asyncHandler(async (req, res) => {
  const { studentWalletAddress, hash } = req.body;
  const normalizedHash = normalizeSha256Hash(hash);

  if (!normalizedHash) {
    return res.status(400).json({ error: 'A valid SHA-256 certificate hash is required' });
  }

  const credential = await findCredential(studentWalletAddress, normalizedHash);
  if (!credential) {
    return res.json({ valid: false, exists: false, message: 'No matching credential found for this ID/Wallet and Hash' });
  }

  if (!await checkPrivacy(credential, req.user)) {
    return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
  }

  if (normalizeSha256Hash(credential.certificateHash) !== normalizedHash) {
    return res.json({
      valid: false, exists: true,
      message: 'Certificate hash does not match. The file provided does not correspond to this credential ID.'
    });
  }

  const isValidOnChain = credential.status === 'COMPLETED'
    ? await blockchainService.verifyCredential(credential.id, normalizedHash)
    : false;
  if (!credential.isRevoked && isValidOnChain) {
    await recordVerification(credential.id);
  }

  return res.json({
    ...buildVerificationResponse(credential, isValidOnChain, normalizedHash, true),
    onChainVerified: isValidOnChain,
    verificationTier: 'CRYPTOGRAPHIC_HASH'
  });
});

module.exports = { verifyWithFile, checkExists, verifyByHash };
