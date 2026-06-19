const User = require('../models/User');
const Credential = require('../models/Credential');
const asyncHandler = require('../middleware/asyncHandler');

const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, university, about, walletAddress, issuerDetails } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (title) updateFields.title = title;
  if (university) updateFields.university = university;
  if (about) updateFields.about = about;

  if (walletAddress) {
      if (req.user.role === 'ISSUER') {
          return res.status(400).json({ error: 'Institutional wallet addresses cannot be changed through the profile. Please contact support for administrative wallet migration.' });
      }

      const normalizedWallet = walletAddress.toLowerCase().trim();

      if (normalizedWallet !== req.user.walletAddress?.toLowerCase()) {
          const escapedWallet = normalizedWallet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const existingWallet = await User.findOne({
              walletAddress: { $regex: new RegExp(`^${escapedWallet}$`, 'i') },
              _id: { $ne: req.user._id }
          });
          if (existingWallet) {
              return res.status(400).json({ error: 'Wallet address is already associated with another account' });
          }
          updateFields.walletAddress = normalizedWallet;
      }
  }
  if (req.body.preferences) {
      updateFields.preferences = {
          ...req.user.preferences?.toObject(),
          ...req.body.preferences
      };
  }

  if (issuerDetails) {
      if (issuerDetails.institutionName) updateFields['issuerDetails.institutionName'] = issuerDetails.institutionName;
      if (issuerDetails.registrationNumber) updateFields['issuerDetails.registrationNumber'] = issuerDetails.registrationNumber;

      if (issuerDetails.plan) {
         const validPlans = ['STARTER', 'PRO', 'ENTERPRISE'];
         if (!validPlans.includes(issuerDetails.plan.toUpperCase())) {
             return res.status(400).json({ error: 'Invalid plan selected.' });
         }
         updateFields['issuerDetails.plan'] = issuerDetails.plan.toUpperCase();
      }
  }

  const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user
  });
});

const fs = require('fs');
const path = require('path');

const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    if (req.user.avatar) {
        try {
            const urlParts = req.user.avatar.split('/uploads/avatars/');
            if (urlParts.length === 2) {
                const oldFilename = urlParts[1];
                const oldPath = path.join(__dirname, '../../uploads/avatars', oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        } catch (err) {
            console.error('Failed to delete old avatar:', err);
        }
    }

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true }
    );

    res.json({
        success: true,
        avatar: avatarUrl,
        user
    });
});

module.exports = {
  updateProfile,
  uploadAvatar
};
