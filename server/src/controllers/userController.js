const crypto = require('crypto');
const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const blockchainService = require('../services/blockchainService');
const asyncHandler = require('../middleware/asyncHandler');

const isValidAdminKey = (provided, expected) => {
  if (!provided || !expected) return false;
  const a = crypto.createHash('sha256').update(String(provided)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
};

const ALLOWED_PREF_KEYS = ['visibility', 'notifications', 'theme'];
const ALLOWED_STUDENT_KEYS = ['studentId', 'graduationYear', 'degreeLevel', 'enrollmentStatus', 'linkedin', 'github'];
const ALLOWED_ISSUER_KEYS = ['institutionName', 'registrationNumber', 'website', 'contactEmail', 'phone', 'address', 'accreditation', 'description'];

const pickAllowed = (source, allowedKeys) => {
  const result = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      result[key] = typeof source[key] === 'string' ? source[key].slice(0, 500) : source[key];
    }
  }
  return result;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
};

const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, university, about, walletAddress, preferences, issuerDetails } = req.body;
  const currentIssuerDetails = (req.user.issuerDetails && typeof req.user.issuerDetails === 'object') ? req.user.issuerDetails : {};

  const data = {};
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 150) {
      return res.status(400).json({ error: 'Name must be a non-empty string up to 150 characters.' });
    }
    const trimmedName = name.trim();
    if (req.user.role === 'ISSUER' && currentIssuerDetails.isVerified) {
      const lockedName = currentIssuerDetails.institutionName || req.user.name;
      if (trimmedName !== lockedName) {
        return res.status(400).json({ error: 'Verified institution names cannot be altered. Please contact administrative support.' });
      }
    }
    data.name = trimmedName;
  }
  if (title !== undefined) {
    if (typeof title !== 'string' || title.length > 150) {
      return res.status(400).json({ error: 'Title cannot exceed 150 characters.' });
    }
    data.title = title.trim();
  }
  if (university !== undefined) {
    if (typeof university !== 'string' || university.length > 150) {
      return res.status(400).json({ error: 'University cannot exceed 150 characters.' });
    }
    data.university = university.trim();
  }
  if (about !== undefined) {
    if (typeof about !== 'string' || about.length > 1000) {
      return res.status(400).json({ error: 'About description cannot exceed 1000 characters.' });
    }
    data.about = about.trim();
  }

  if (walletAddress) {
    const normalizedWallet = walletAddress.toLowerCase().trim();
    if (!ethers.isAddress(normalizedWallet)) {
      return res.status(400).json({ error: 'Invalid Ethereum wallet address format' });
    }

    const currentWallet = req.user.issuerDetails?.authorizedWalletAddress || req.user.walletAddress;
    if (req.user.role === 'ISSUER' && currentWallet && currentWallet.toLowerCase() !== normalizedWallet) {
      return res.status(400).json({ error: 'Institutional wallet addresses cannot be changed through the profile. Please contact support for administrative wallet migration.' });
    }

    if (normalizedWallet !== currentWallet?.toLowerCase()) {
      const existingWallet = await prisma.user.findFirst({
        where: {
          OR: [
            { walletAddress: { equals: normalizedWallet, mode: 'insensitive' } },
            { issuerDetails: { path: ['authorizedWalletAddress'], equals: normalizedWallet } }
          ],
          id: { not: req.user.id }
        }
      });
      if (existingWallet) {
        return res.status(400).json({ error: 'Wallet address is already associated with another account' });
      }
      data.walletAddress = normalizedWallet;
      if (req.user.role === 'ISSUER' && !issuerDetails) {
        const currentDetails = (req.user.issuerDetails && typeof req.user.issuerDetails === 'object') ? req.user.issuerDetails : {};
        data.issuerDetails = {
          ...currentDetails,
          authorizedWalletAddress: normalizedWallet
        };
      }
    }
  }

  if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
    const currentPrefs = (req.user.preferences && typeof req.user.preferences === 'object') ? req.user.preferences : {};
    const safePrefs = pickAllowed(preferences, ALLOWED_PREF_KEYS);
    if (typeof safePrefs.visibility !== 'undefined') {
      safePrefs.visibility = Boolean(safePrefs.visibility);
    }
    data.preferences = { ...currentPrefs, ...safePrefs };
  }

  const rawStudentDetails = req.body.studentDetails || preferences?.studentDetails;
  if (rawStudentDetails && typeof rawStudentDetails === 'object' && !Array.isArray(rawStudentDetails)) {
    const currentStudentDetails = (req.user.preferences?.studentDetails && typeof req.user.preferences.studentDetails === 'object')
      ? req.user.preferences.studentDetails
      : {};
    const updatedStudentDetails = { ...currentStudentDetails, ...pickAllowed(rawStudentDetails, ALLOWED_STUDENT_KEYS) };
    const currentPrefs = (data.preferences || req.user.preferences || {});
    data.preferences = { ...currentPrefs, studentDetails: updatedStudentDetails };
  }

  if (issuerDetails) {
    if (req.user.role !== 'ISSUER') {
      return res.status(403).json({ error: 'Only institutional accounts may update issuer details.' });
    }

    const currentDetails = (req.user.issuerDetails && typeof req.user.issuerDetails === 'object') ? req.user.issuerDetails : {};
    const safeIssuerDetails = pickAllowed(issuerDetails, ALLOWED_ISSUER_KEYS);
    for (const k of Object.keys(safeIssuerDetails)) {
      if (typeof safeIssuerDetails[k] === 'string') {
        safeIssuerDetails[k] = safeIssuerDetails[k].trim();
      }
    }

    if (safeIssuerDetails.institutionName !== undefined) {
      if (typeof safeIssuerDetails.institutionName !== 'string' || !safeIssuerDetails.institutionName || safeIssuerDetails.institutionName.length > 150) {
        return res.status(400).json({ error: 'Institution name must be a non-empty string up to 150 characters.' });
      }
      if (currentDetails.isVerified && safeIssuerDetails.institutionName !== currentDetails.institutionName) {
        return res.status(400).json({ error: 'Verified institution names cannot be altered. Please contact administrative support.' });
      }
    }

    if (safeIssuerDetails.registrationNumber !== undefined) {
      if (typeof safeIssuerDetails.registrationNumber !== 'string' || !safeIssuerDetails.registrationNumber || safeIssuerDetails.registrationNumber.length > 100) {
        return res.status(400).json({ error: 'Registration number must be a non-empty string up to 100 characters.' });
      }
      if (safeIssuerDetails.registrationNumber !== currentDetails.registrationNumber) {
        const existingReg = await prisma.user.findFirst({
          where: {
            issuerDetails: { path: ['registrationNumber'], equals: safeIssuerDetails.registrationNumber },
            id: { not: req.user.id }
          }
        });
        if (existingReg) {
          return res.status(400).json({ error: 'Registration number already in use by another institution.' });
        }
      }
    }

    if (!currentDetails.isVerified && data.name && !safeIssuerDetails.institutionName) {
      safeIssuerDetails.institutionName = data.name;
    } else if (!currentDetails.isVerified && safeIssuerDetails.institutionName && !data.name) {
      data.name = safeIssuerDetails.institutionName;
    }
    if (!currentDetails.isVerified && (data.name || safeIssuerDetails.institutionName)) {
      data.university = safeIssuerDetails.institutionName || data.name;
    }

    const updatedIssuerDetails = {
      ...currentDetails,
      ...safeIssuerDetails,
      isVerified: currentDetails.isVerified ?? false,
      certificatesIssued: currentDetails.certificatesIssued ?? 0,
      authorizedWalletAddress: data.walletAddress || currentDetails.authorizedWalletAddress || req.user.walletAddress
    };

    data.issuerDetails = updatedIssuerDetails;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    res.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (err) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return res.status(400).json({ error: `This ${field === 'walletAddress' ? 'wallet address' : 'email'} is already associated with another account` });
    }
    throw err;
  }
});

const verifyIssuer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminKey = req.headers['x-admin-key'];

  if (!isValidAdminKey(adminKey, process.env.ADMIN_API_KEY)) {
    return res.status(403).json({ error: 'Administrative authority required to verify institutions.' });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = (targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object') ? targetUser.issuerDetails : {};
  const issuerWallet = currentDetails.authorizedWalletAddress || targetUser.walletAddress;
  let onChainTxHash = currentDetails.onChainAuthorizationTx || null;
  if (issuerWallet && ethers.isAddress(issuerWallet)) {
    try {
      const authResult = await blockchainService.authorizeIssuer(issuerWallet);
      if (authResult?.transactionHash) {
        onChainTxHash = authResult.transactionHash;
      }
    } catch (chainErr) {
      console.warn('On-chain issuer authorization skipped or failed:', chainErr.message);
    }
  }

  const updatedIssuerDetails = {
    ...currentDetails,
    isVerified: true,
    verifiedAt: new Date().toISOString(),
    ...(onChainTxHash ? { onChainAuthorizationTx: onChainTxHash } : {})
  };

  const updated = await prisma.user.update({
    where: { id },
    data: { issuerDetails: updatedIssuerDetails }
  });

  res.json({ success: true, message: 'Issuer verified successfully.', user: sanitizeUser(updated) });
});

module.exports = { updateProfile, verifyIssuer };
