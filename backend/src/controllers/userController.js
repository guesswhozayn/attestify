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
