const User = require('../models/User');

const jwt = require('jsonwebtoken');
const { JWT_EXPIRY } = require('../config/constants');
const emailService = require('../services/emailService');
const asyncHandler = require('../middleware/asyncHandler');

const generateToken = (userId, role, tokenVersion = 0) => {
  return jwt.sign(
    { userId, role, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    university,
    institutionName,
    authorizedWalletAddress,
    registrationNumber,
    walletAddress
  } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedWallet = walletAddress?.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (normalizedWallet) {
    const existingWallet = await User.findOne({ walletAddress: normalizedWallet });
    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet address already registered' });
    }
  }

  if (role === 'ISSUER' && registrationNumber) {
    const existingReg = await User.findOne({ 'issuerDetails.registrationNumber': registrationNumber });
    if (existingReg) {
      return res.status(400).json({ error: 'Registration number already in use by another institution.' });
    }
  }

  const userData = {
    name,
    email: normalizedEmail,
    password,
    role: role || 'STUDENT',
    university,
    walletAddress: normalizedWallet
  };

  if (role === 'ISSUER') {
    userData.issuerDetails = {
      institutionName,
      registrationNumber,
      isVerified: true,
      authorizedWalletAddress,
      certificatesIssued: 0
    };
    userData.name = institutionName;
  }

  const user = await User.create(userData);

  if (email) {
    emailService.sendWelcomeEmail(email, user.name).catch(err =>
      console.error(`[EmailService] Failed to send welcome email to ${email}:`, err)
    );
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please log in.',
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

const login = asyncHandler(async (req, res) => {
  const { email, password, selectedRole } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

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

  const token = generateToken(user._id, user.role, user.tokenVersion);

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
      issuerDetails: user.issuerDetails,
      avatar: user.avatar,
      tokenVersion: user.tokenVersion
    }
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
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
      createdAt: user.createdAt,
      avatar: user.avatar,
      tokenVersion: user.tokenVersion
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
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
  user.tokenVersion += 1;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword
};
