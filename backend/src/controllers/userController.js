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
      const normalizedWallet = walletAddress.toLowerCase();
      // Only check if it's different from the current wallet
      if (normalizedWallet !== req.user.walletAddress?.toLowerCase()) {
          const existingWallet = await User.findOne({ 
              walletAddress: { $regex: new RegExp(`^${normalizedWallet}$`, 'i') },
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

const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
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

