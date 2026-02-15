const User = require('../models/User');

const jwt = require('jsonwebtoken');
const { JWT_EXPIRY } = require('../config/constants');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');
const asyncHandler = require('../middleware/asyncHandler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    university,
    institutionName,
    authorizedWalletAddress,
    officialEmailDomain,
    walletAddress
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (walletAddress) {
    const existingWallet = await User.findOne({ walletAddress });
    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet address already registered' });
    }
  }

  const userData = {
    name,
    email,
    password,
    role: role || 'STUDENT',
    university,
    walletAddress
  };

  if (role === 'ISSUER') {
    userData.issuerDetails = {
      institutionName,
      registrationNumber: req.body.registrationNumber,
      authorizedWalletAddress,
      officialEmailDomain
    };
    userData.name = institutionName;
  }

  const user = await User.create(userData);

  const token = generateToken(user._id, user.role);

  try {
    if (email) {
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
      title: user.title,
      about: user.about,
      isActive: user.isActive,
      isActive: user.isActive,
      issuerDetails: user.issuerDetails
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, selectedRole } = req.body;

  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (selectedRole && user.role !== selectedRole) {
    return res.status(403).json({ error: `Access denied. You are not registered as a ${selectedRole.toLowerCase()}.` });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  const isValidPassword = await user.comparePassword(password);
  
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

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
      title: user.title,
      about: user.about,
      isActive: user.isActive,
      studentId: user.studentId,
      issuerDetails: user.issuerDetails
    }
  });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
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
      title: user.title,
      about: user.about,
      isActive: user.isActive,
      issuerDetails: user.issuerDetails,
      createdAt: user.createdAt
    }
  });
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, university, walletAddress, title, about } = req.body;
  
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (university) user.university = university;
  if (title !== undefined) user.title = title;
  if (about !== undefined) user.about = about;

  if (user.role === 'ISSUER' && req.body.issuerDetails) {
    const { branding, authorizedWalletAddress } = req.body.issuerDetails;
    
    if (!user.issuerDetails) {
      user.issuerDetails = {};
    }

    if (branding) {
      user.issuerDetails.branding = {
        ...user.issuerDetails.branding,
        ...branding
      };
    }
    
    if (authorizedWalletAddress) {
      user.issuerDetails.authorizedWalletAddress = authorizedWalletAddress;
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
      title: user.title,
      isActive: user.isActive,
      issuerDetails: user.issuerDetails
    }
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid current password' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }
  } else {
    return res.status(404).json({ 
      error: 'Account not found. Please register via the form to set up your Wallet Address and Profile.' 
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  user.lastLogin = new Date();
  await user.save();

  const appToken = generateToken(user._id, user.role);

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
      title: user.title,
      about: user.about,
      isActive: user.isActive,
      issuerDetails: user.issuerDetails,
      avatar: user.avatar
    }
  });
});