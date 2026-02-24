const User = require('../models/User');

const jwt = require('jsonwebtoken');
const { JWT_EXPIRY } = require('../config/constants');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');
const asyncHandler = require('../middleware/asyncHandler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Free/personal email provider blocklist — issuers must use an org email
const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com',
  'hotmail.com', 'hotmail.co.uk',
  'outlook.com', 'outlook.in',
  'live.com', 'live.co.uk',
  'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'protonmail.ch', 'pm.me',
  'zoho.com',
  'mail.com', 'email.com',
  'inbox.com',
  'gmx.com', 'gmx.net', 'gmx.de',
  'tutanota.com', 'tuta.io',
  'fastmail.com',
  'yandex.com', 'yandex.ru',
]);

/**
 * Validate issuer email against domain rules:
 * 1. Must not be from a free/personal provider
 * 2. Must match the declared officialEmailDomain
 */
const validateIssuerEmail = (email, officialEmailDomain) => {
  const emailLower = email.toLowerCase().trim();
  const atIndex = emailLower.lastIndexOf('@');
  if (atIndex === -1) return { valid: false, error: 'Invalid email format.' };

  const emailDomain = emailLower.substring(atIndex + 1); // e.g. "university.edu"

  if (FREE_EMAIL_PROVIDERS.has(emailDomain)) {
    return {
      valid: false,
      error: `Issuers must register with an organizational email address. Free email providers (e.g. Gmail, Yahoo, Outlook) are not accepted. Please use your institution's official email.`
    };
  }

  if (officialEmailDomain) {
    const declaredDomain = officialEmailDomain.toLowerCase().trim().replace(/^@/, '');

    if (emailDomain !== declaredDomain) {
      return {
        valid: false,
        error: `Your email domain (@${emailDomain}) does not match the declared Official Email Domain (@${declaredDomain}). Please use an email from your institution's domain.`
      };
    }
  }

  return { valid: true };
};

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
    officialEmailDomain,
    walletAddress,
    plan
  } = req.body;

  if (role === 'ISSUER') {
    const emailCheck = validateIssuerEmail(email, officialEmailDomain);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }
  }

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
      isVerified: false,
      authorizedWalletAddress,
      officialEmailDomain,
      plan: 'STARTER',
      certificatesIssued: 0
    };
    userData.name = institutionName;
  }

  const user = await User.create(userData);

  const token = generateToken(user._id, user.role, user.tokenVersion);

  if (email) {
    emailService.sendWelcomeEmail(email, user.name).catch(err => 
      console.error(`[EmailService] Failed to send welcome email to ${email}:`, err)
    );
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
      issuerDetails: user.issuerDetails,
      avatar: user.avatar,
      tokenVersion: user.tokenVersion
    }
  });
});

const login = asyncHandler(async (req, res) => {
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
      studentId: user.studentId,
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
  user.tokenVersion += 1; // Invalidate all previous tokens on password change
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

const googleLogin = asyncHandler(async (req, res) => {
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

  const appToken = generateToken(user._id, user.role, user.tokenVersion);

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

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  googleLogin
};