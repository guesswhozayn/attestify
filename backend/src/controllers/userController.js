const User = require('../models/User');
const Credential = require('../models/Credential');
const asyncHandler = require('../middleware/asyncHandler');

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, title, university, about, walletAddress, instituteDetails } = req.body;
  
  const updateFields = {};
  if (name) updateFields.name = name;
  if (title) updateFields.title = title;
  if (university) updateFields.university = university;
  if (about) updateFields.about = about;
  if (walletAddress) updateFields.walletAddress = walletAddress;
  if (req.body.preferences) {
      updateFields.preferences = {
          ...req.user.preferences?.toObject(),
          ...req.body.preferences
      };
  }
  
  if (instituteDetails) {
      if (instituteDetails.branding) {
          for (const [key, value] of Object.entries(instituteDetails.branding)) {
              updateFields[`instituteDetails.branding.${key}`] = value;
          }
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

exports.uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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

exports.updateBranding = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    const updateFields = {};

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const ipfsService = require('../services/ipfsService');
    const fs = require('fs');

    const processFile = async (fileKey, brandingKey) => {
      if (files[fileKey] && files[fileKey][0]) {
        const file = files[fileKey][0];
        try {
          const fileUrl = `${req.protocol}://${req.get('host')}/${file.path}`;
          updateFields[`instituteDetails.branding.${brandingKey}`] = fileUrl;
        } catch (err) {
          console.error(`Failed to process ${fileKey}:`, err);
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }
    };

    await Promise.all([
      processFile('logo', 'logo'),
      processFile('seal', 'seal'),
      processFile('signature', 'signature')
    ]);

    if (Object.keys(updateFields).length === 0) {
       return res.status(500).json({ error: 'Failed to process any files' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Update branding error:', error);
    throw error;
  }
});

exports.deleteBranding = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['logo', 'seal', 'signature'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid branding type' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
       return res.status(404).json({ error: 'User not found' });
    }

    const brandingKey = type;
    const cidKey = `${type}CID`;

    const brandingPath = user.instituteDetails?.branding?.[brandingKey];
    const brandingCID = user.instituteDetails?.branding?.[cidKey];

    if (brandingPath) {
        const fs = require('fs');
        if (fs.existsSync(brandingPath)) {
            try {
                fs.unlinkSync(brandingPath);
            } catch (err) {
                console.error('Failed to delete local file:', err);
            }
        }
    }

    if (brandingCID) {
        const ipfsService = require('../services/ipfsService');
        try {
            await ipfsService.unpinFile(brandingCID);
        } catch (err) {
            console.error('Failed to unpin file from IPFS:', err);
        }
    }
    
    const updatePathLocal = `instituteDetails.branding.${brandingKey}`;
    const updatePathCID = `instituteDetails.branding.${cidKey}`;
    
    const updateQuery = { 
        $unset: { 
            [updatePathLocal]: "",
            [updatePathCID]: "" 
        } 
    };

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateQuery,
        { new: true }
    );

    res.json({
        success: true,
        user: updatedUser
    });

  } catch (error) {
    console.error('Delete branding error:', error);
    throw error;
  }
});

exports.getPublicStudentProfile = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    const student = await User.findOne({ 
        walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') },
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
        studentWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') },
        status: 'issued'
    }).select('studentName university issueDate type certificationData transcriptData ipfsCID certificateHash');

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
