const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { JWT_EXPIRY } = require('../config/constants');
const asyncHandler = require('../middleware/asyncHandler');

const generateToken = (userId, role, tokenVersion = 0) =>
  jwt.sign({ userId, role, tokenVersion }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

const formatUserResponse = (user) => ({
  id: user.id,
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
  tokenVersion: user.tokenVersion
});

const register = asyncHandler(async (req, res) => {
  const {
    name, email, password, role, university,
    institutionName, authorizedWalletAddress, registrationNumber, walletAddress
  } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedWallet = walletAddress?.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (normalizedWallet) {
    const existingWallet = await prisma.user.findFirst({
      where: { walletAddress: { equals: normalizedWallet, mode: 'insensitive' } }
    });
    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet address already registered' });
    }
  }

  if (role === 'ISSUER' && registrationNumber) {
    const existingReg = await prisma.user.findFirst({
      where: { issuerDetails: { path: ['registrationNumber'], equals: registrationNumber } }
    });
    if (existingReg) {
      return res.status(400).json({ error: 'Registration number already in use by another institution.' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = {
    name: role === 'ISSUER' && institutionName ? institutionName : (name || 'Anonymous'),
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'STUDENT',
    university: university || 'Not Specified',
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
  }

  const user = await prisma.user.create({ data: userData });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please log in.',
    user: formatUserResponse(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, selectedRole } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password' });
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (selectedRole && user.role !== selectedRole) {
    return res.status(403).json({ error: `Access denied. You are not registered as a ${selectedRole.toLowerCase()}.` });
  }
  if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  res.json({
    success: true,
    token: generateToken(updatedUser.id, updatedUser.role, updatedUser.tokenVersion),
    user: formatUserResponse(updatedUser)
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ success: true, user: formatUserResponse(user) });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } }
    });
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(400).json({ error: 'Invalid current password' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 }
    }
  });

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getCurrentUser, logout, changePassword };
