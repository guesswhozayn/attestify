const User = require('../models/User');
// const AuditLog = require('../models/AuditLog'); // Removed for Audit Log Refinement
const jwt = require('jsonwebtoken');
const { AUDIT_ACTIONS, JWT_EXPIRY } = require('../config/constants');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      university,
      registrationNumber,
      // Institute specific fields
      institutionName,
      authorizedWalletAddress,
      officialEmailDomain,
      walletAddress // Add this to destructuring
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check wallet address if provided
    if (walletAddress) {
      const existingWallet = await User.findOne({ walletAddress });
      if (existingWallet) {
        return res.status(400).json({ error: 'Wallet address already registered' });
      }
    }

    // Create user based on role
    const userData = {
      name,
      email,
      password,
      role: role || 'STUDENT',
      university,
      walletAddress
    };

    if (role === 'INSTITUTE') {
      userData.instituteDetails = {
        institutionName,
        registrationNumber,
        authorizedWalletAddress,
        officialEmailDomain
      };
      // Use Institution Name as the main Name for the user
      userData.name = institutionName;
    } else {
      // Use registrationNumber as studentId if studentId isn't explicitly provided
      userData.registrationNumber = registrationNumber;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send Welcome Email
    try {
      if (email) {
        // Run in background, don't await
        emailService.sendWelcomeEmail(email, user.name).catch(err => 
          console.error('Failed to send welcome email:', err)
        );
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        registrationNumber: user.registrationNumber,
        instituteDetails: user.instituteDetails
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify Role
    if (selectedRole && user.role !== selectedRole) {
      return res.status(403).json({ error: `Access denied. You are not registered as a ${selectedRole.toLowerCase()}.` });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Log action removed (Audit Log Refinement)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        studentId: user.studentId,
        instituteDetails: user.instituteDetails
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        walletAddress: user.walletAddress,
        registrationNumber: user.registrationNumber,
        instituteDetails: user.instituteDetails,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Log action removed (Audit Log Refinement)

    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, university, walletAddress } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (university) user.university = university;
    if (walletAddress) user.walletAddress = walletAddress;

    // Update institute details if role is INSTITUTE
    if (user.role === 'INSTITUTE' && req.body.instituteDetails) {
      const { branding, authorizedWalletAddress } = req.body.instituteDetails;
      
      if (!user.instituteDetails) {
        user.instituteDetails = {};
      }

      if (branding) {
        user.instituteDetails.branding = {
          ...user.instituteDetails.branding,
          ...branding
        };
      }
      
      if (authorizedWalletAddress) {
        user.instituteDetails.authorizedWalletAddress = authorizedWalletAddress;
      }
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        instituteDetails: user.instituteDetails
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log action removed (Audit Log Refinement)

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google Token
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but no googleId (legacy email user), link it?
      // For safety, we'll just update the googleId if it's missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // User does not exist - Do NOT create automatically
      // We require Wallet Address and Registration Number which Google doesn't provide
      return res.status(404).json({ 
        error: 'Account not found. Please register via the form to set up your Wallet Address and Profile.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const appToken = generateToken(user._id, user.role);

    // Log action removed (Audit Log Refinement)

    res.json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        walletAddress: user.walletAddress,
        registrationNumber: user.registrationNumber,
        instituteDetails: user.instituteDetails,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: error.message });
  }
};