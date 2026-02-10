const User = require('../models/User');

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, title, instituteDetails } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (title) updateFields.title = title;
    
    // Handle institute details deep merge if needed, or simple replace
    if (instituteDetails) {
        // For simplicity, we might need to be careful not to overwrite verify branding if not provided
        // But typically the frontend sends the whole structure or we use $set with dot notation
        
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        // Construct the URL (assuming static serve setup)
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
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
};

// Update branding assets
exports.updateBranding = async (req, res) => {
  try {
    const files = req.files;
    const updateFields = {};

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const ipfsService = require('../services/ipfsService');
    const fs = require('fs');

    // Process each file type
    const processFile = async (fileKey, brandingKey) => {
      if (files[fileKey] && files[fileKey][0]) {
        const file = files[fileKey][0];
        try {
          // Upload to IPFS
          const result = await ipfsService.uploadFile(file.path, file.originalname);
          updateFields[`instituteDetails.branding.${brandingKey}CID`] = result.ipfsHash;
          
          // Clean up local file
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Failed to process ${fileKey}:`, err);
          // Try to clean up even if failed
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
    res.status(500).json({ error: 'Failed to update branding assets' });
  }
};

// Delete branding asset
exports.deleteBranding = async (req, res) => {
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

    const brandingKey = type; // e.g., 'logo'
    const cidKey = `${type}CID`; // e.g., 'logoCID'

    const currentCID = user.instituteDetails?.branding?.[cidKey];

    if (currentCID) {
        const ipfsService = require('../services/ipfsService');
        // Unpin from IPFS
        try {
            await ipfsService.unpinFile(currentCID);
        } catch (err) {
            console.error('Failed to unpin file from IPFS:', err);
            // Continue to remove link even if unpin fails
        }
    }

    // Remove link from user profile
    const updatePath = `instituteDetails.branding.${cidKey}`;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { [updatePath]: "" } },
        { new: true }
    );

    res.json({
        success: true,
        user: updatedUser
    });

  } catch (error) {
    console.error('Delete branding error:', error);
    res.status(500).json({ error: 'Failed to delete branding asset' });
  }
};
