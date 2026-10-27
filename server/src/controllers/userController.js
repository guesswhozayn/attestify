const { prisma } = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');

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
    const currentWallet = req.user.issuerDetails?.authorizedWalletAddress || req.user.walletAddress;
    if (req.user.role === 'ISSUER' && currentWallet && currentWallet.toLowerCase() !== walletAddress.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Institutional wallet addresses cannot be changed through the profile. Please contact support for administrative wallet migration.' });
    }

    const normalizedWallet = walletAddress.toLowerCase().trim();
    if (normalizedWallet !== currentWallet?.toLowerCase()) {
      const existingWallet = await prisma.user.findFirst({
        where: {
          walletAddress: { equals: normalizedWallet, mode: 'insensitive' },
          id: { not: req.user.id }
        }
      });
      if (existingWallet) {
        return res.status(400).json({ error: 'Wallet address is already associated with another account' });
      }
      data.walletAddress = normalizedWallet;
    }
  }

  if (preferences) {
    const currentPrefs = (req.user.preferences && typeof req.user.preferences === 'object') ? req.user.preferences : {};
    data.preferences = { ...currentPrefs, ...preferences };
  }

  if (issuerDetails) {
    const currentDetails = (req.user.issuerDetails && typeof req.user.issuerDetails === 'object') ? req.user.issuerDetails : {};
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

    const updatedIssuerDetails = { ...currentDetails, ...issuerDetails };
    if (data.walletAddress && req.user.role === 'ISSUER') {
      updatedIssuerDetails.authorizedWalletAddress = data.walletAddress;
    }
    data.issuerDetails = updatedIssuerDetails;
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data
  });

  res.json({ success: true, user: sanitizeUser(updatedUser) });
});

module.exports = { updateProfile };
