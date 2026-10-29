const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const blockchainService = require('../services/blockchainService');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, university, about, walletAddress, preferences, issuerDetails } = req.body;

  const data = {};
  if (name !== undefined) data.name = name;
  if (title !== undefined) data.title = title;
  if (university !== undefined) data.university = university;
  if (about !== undefined) data.about = about;

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
    data.preferences = { ...currentPrefs, ...preferences };
  }

  if (req.body.studentDetails && typeof req.body.studentDetails === 'object' && !Array.isArray(req.body.studentDetails)) {
    const currentStudentDetails = (req.user.preferences?.studentDetails && typeof req.user.preferences.studentDetails === 'object')
      ? req.user.preferences.studentDetails
      : {};
    const updatedStudentDetails = { ...currentStudentDetails, ...req.body.studentDetails };
    const currentPrefs = (data.preferences || req.user.preferences || {});
    data.preferences = { ...currentPrefs, studentDetails: updatedStudentDetails };
  }

  if (issuerDetails) {
    if (req.user.role !== 'ISSUER') {
      return res.status(403).json({ error: 'Only institutional accounts may update issuer details.' });
    }

    const currentDetails = (req.user.issuerDetails && typeof req.user.issuerDetails === 'object') ? req.user.issuerDetails : {};

    if (currentDetails.isVerified && issuerDetails.institutionName && issuerDetails.institutionName !== currentDetails.institutionName) {
      return res.status(400).json({ error: 'Verified institution names cannot be altered. Please contact administrative support.' });
    }

    if (issuerDetails.registrationNumber && issuerDetails.registrationNumber !== currentDetails.registrationNumber) {
      const existingReg = await prisma.user.findFirst({
        where: {
          issuerDetails: { path: ['registrationNumber'], equals: issuerDetails.registrationNumber },
          id: { not: req.user.id }
        }
      });
      if (existingReg) {
        return res.status(400).json({ error: 'Registration number already in use by another institution.' });
      }
    }

    const { isVerified, certificatesIssued, authorizedWalletAddress, ...safeIssuerDetails } = issuerDetails;

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
  const isAdminSecret = Boolean(process.env.ADMIN_API_KEY && adminKey === process.env.ADMIN_API_KEY);
  const isAdminWallet = Boolean(
    req.user?.walletAddress &&
    blockchainService.wallet?.address &&
    req.user.walletAddress.toLowerCase() === blockchainService.wallet.address.toLowerCase()
  );

  if (!isAdminSecret && !isAdminWallet) {
    return res.status(403).json({ error: 'Administrative authority required to verify institutions.' });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = (targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object') ? targetUser.issuerDetails : {};
  const updatedIssuerDetails = {
    ...currentDetails,
    isVerified: true,
    verifiedAt: new Date().toISOString()
  };

  const updated = await prisma.user.update({
    where: { id },
    data: { issuerDetails: updatedIssuerDetails }
  });

  res.json({ success: true, message: 'Issuer verified successfully.', user: sanitizeUser(updated) });
});

module.exports = { updateProfile, verifyIssuer };
