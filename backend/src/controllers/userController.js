const User = require('../models/User');
const Credential = require('../models/Credential');
const asyncHandler = require('../middleware/asyncHandler');

exports.updateProfile = asyncHandler(async (req, res) => {
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

exports.uploadAvatar = asyncHandler(async (req, res) => {
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

exports.getPublicStudentProfile = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    const escapedWallet = walletAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const student = await User.findOne({ 
        walletAddress: { $regex: new RegExp(`^${escapedWallet}$`, 'i') },
        role: 'STUDENT'
    }).select('name avatar university preferences');

    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Check visibility preference
    if (student.preferences && student.preferences.visibility === false) {
        return res.status(403).json({ error: 'This profile is private' });
    }

    const credentials = await Credential.find({
        studentWalletAddress: { $regex: new RegExp(`^${escapedWallet}$`, 'i') },
        isRevoked: false
    }).select('studentName university issueDate type certificationData transcriptData ipfsCID certificateHash isRevoked');

    res.json({
        success: true,
        student: {
            name: student.name,
            avatar: student.avatar,
            university: student.university,
            walletAddress: walletAddress
        },
        credentials
    });
});

exports.getPublicIssuerProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const issuer = await User.findById(id).select('name avatar issuerDetails university about email role');

    if (!issuer || issuer.role !== 'ISSUER') {
        return res.status(404).json({ error: 'Issuer not found' });
    }

    res.json({
        success: true,
        issuer: {
            _id: issuer._id,
            name: issuer.name,
            avatar: issuer.avatar,
            university: issuer.university, // Fallback if name is different
            about: issuer.about,
            email: issuer.issuerDetails?.officialEmailDomain ? `contact@${issuer.issuerDetails.officialEmailDomain}` : issuer.email, // Construct email or use account email
            details: issuer.issuerDetails
        }
    });
});

exports.searchIssuers = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const issuers = await User.find({
        role: 'ISSUER',
        $or: [
            { name: { $regex: escapedQuery, $options: 'i' } },
            { 'issuerDetails.institutionName': { $regex: escapedQuery, $options: 'i' } }
        ]
    }).select('name avatar issuerDetails.institutionName _id');

    res.json({
        success: true,
        count: issuers.length,
        issuers: issuers.map(inst => ({
            _id: inst._id,
            name: inst.issuerDetails?.institutionName || inst.name,
            avatar: inst.avatar
        }))
    });
});

exports.getPublicIssuerProfileByWallet = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    const escapedWallet = walletAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const issuer = await User.findOne({ 
        role: 'ISSUER',
        $or: [
            { walletAddress: { $regex: new RegExp(`^${escapedWallet}$`, 'i') } },
            { 'issuerDetails.authorizedWalletAddress': { $regex: new RegExp(`^${escapedWallet}$`, 'i') } }
        ]
    }).select('name avatar issuerDetails university about email role createdAt');

    if (!issuer) {
        return res.status(404).json({ error: 'Issuer not found' });
    }

    res.json({
        success: true,
        issuer: {
            _id: issuer._id,
            name: issuer.name,
            avatar: issuer.avatar,
            university: issuer.university,
            about: issuer.about,
            email: issuer.issuerDetails?.officialEmailDomain ? `contact@${issuer.issuerDetails.officialEmailDomain}` : issuer.email,
            details: issuer.issuerDetails,
            createdAt: issuer.createdAt
        }
    });
});
