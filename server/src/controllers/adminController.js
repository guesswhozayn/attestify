const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const blockchainService = require('../services/blockchainService');

const formatIssuer = (user) => {
  const details = user.issuerDetails && typeof user.issuerDetails === 'object' ? user.issuerDetails : {};
  const isVerified = Boolean(details.isVerified);
  let status = details.status;
  if (!status) {
    if (!user.isActive) status = 'SUSPENDED';
    else if (isVerified) status = 'VERIFIED';
    else status = 'PENDING';
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    university: user.university,
    walletAddress: user.walletAddress,
    authorizedWalletAddress: details.authorizedWalletAddress || user.walletAddress,
    institutionName: details.institutionName || user.university || user.name,
    registrationNumber: details.registrationNumber || 'N/A',
    isVerified,
    status,
    isActive: user.isActive,
    verifiedAt: details.verifiedAt || null,
    rejectionReason: details.rejectionReason || null,
    suspendedAt: details.suspendedAt || null,
    suspensionReason: details.suspensionReason || null,
    onChainAuthorizationTx: details.onChainAuthorizationTx || null,
    branding: details.branding || null,
    totalCredentialsIssued: user._count?.issuedCredentials ?? details.certificatesIssued ?? 0,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
};

const getStats = asyncHandler(async (req, res) => {
  const [totalIssuers, allIssuers, totalCredentials, revokedCredentials] = await Promise.all([
    prisma.user.count({ where: { role: 'ISSUER' } }),
    prisma.user.findMany({
      where: { role: 'ISSUER' },
      select: { id: true, isActive: true, issuerDetails: true }
    }),
    prisma.credential.count(),
    prisma.credential.count({ where: { isRevoked: true } })
  ]);

  let pendingCount = 0;
  let verifiedCount = 0;
  let suspendedCount = 0;
  let rejectedCount = 0;

  for (const issuer of allIssuers) {
    const details = issuer.issuerDetails && typeof issuer.issuerDetails === 'object' ? issuer.issuerDetails : {};
    const status = details.status || (!issuer.isActive ? 'SUSPENDED' : (details.isVerified ? 'VERIFIED' : 'PENDING'));

    if (status === 'PENDING') pendingCount++;
    else if (status === 'VERIFIED') verifiedCount++;
    else if (status === 'SUSPENDED') suspendedCount++;
    else if (status === 'REJECTED') rejectedCount++;
  }

  res.json({
    success: true,
    stats: {
      totalIssuers,
      pendingCount,
      verifiedCount,
      suspendedCount,
      rejectedCount,
      totalCredentials,
      revokedCredentials
    }
  });
});

const getIssuers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  const where = { role: 'ISSUER' };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { university: { contains: term, mode: 'insensitive' } },
      { walletAddress: { contains: term, mode: 'insensitive' } },
      { issuerDetails: { path: ['institutionName'], string_contains: term } },
      { issuerDetails: { path: ['registrationNumber'], string_contains: term } },
      { issuerDetails: { path: ['authorizedWalletAddress'], string_contains: term } }
    ];
  }

  const allMatching = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { issuedCredentials: true }
      }
    }
  });

  let formatted = allMatching.map(formatIssuer);

  if (status && status !== 'ALL') {
    formatted = formatted.filter(i => i.status.toUpperCase() === status.toUpperCase());
  }

  const total = formatted.length;
  const paginated = formatted.slice(skip, skip + limit);

  res.json({
    success: true,
    issuers: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getIssuerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { issuedCredentials: true } },
      issuedCredentials: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          studentName: true,
          type: true,
          issueDate: true,
          isRevoked: true,
          certificateHash: true,
          transactionHash: true
        }
      }
    }
  });

  if (!user || user.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer not found' });
  }

  const formatted = formatIssuer(user);

  let onChainAuthorized = false;
  if (formatted.authorizedWalletAddress && ethers.isAddress(formatted.authorizedWalletAddress)) {
    try {
      onChainAuthorized = await blockchainService.isAuthorizedIssuer(formatted.authorizedWalletAddress);
    } catch {}
  }

  res.json({
    success: true,
    issuer: {
      ...formatted,
      onChainAuthorized,
      recentCredentials: user.issuedCredentials
    }
  });
});

const approveIssuer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object' ? targetUser.issuerDetails : {};
  const issuerWallet = currentDetails.authorizedWalletAddress || targetUser.walletAddress;

  let onChainTxHash = currentDetails.onChainAuthorizationTx || null;
  let onChainError = null;

  if (issuerWallet && ethers.isAddress(issuerWallet)) {
    try {
      const authResult = await blockchainService.authorizeIssuer(issuerWallet);
      if (authResult?.transactionHash) {
        onChainTxHash = authResult.transactionHash;
      }
    } catch (err) {
      onChainError = err.message;
      console.warn('[Admin] On-chain authorization warning:', err.message);
    }
  }

  const updatedDetails = {
    ...currentDetails,
    isVerified: true,
    status: 'VERIFIED',
    verifiedAt: new Date().toISOString(),
    rejectionReason: null,
    ...(onChainTxHash ? { onChainAuthorizationTx: onChainTxHash } : {})
  };

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: true,
      issuerDetails: updatedDetails
    },
    include: {
      _count: { select: { issuedCredentials: true } }
    }
  });

  res.json({
    success: true,
    message: 'Issuer approved successfully.',
    onChainTxHash,
    onChainError,
    issuer: formatIssuer(updated)
  });
});

const rejectIssuer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object' ? targetUser.issuerDetails : {};

  const updatedDetails = {
    ...currentDetails,
    isVerified: false,
    status: 'REJECTED',
    rejectedAt: new Date().toISOString(),
    rejectionReason: (reason && reason.trim()) || 'Institutional registration requirements were not fulfilled.'
  };

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      issuerDetails: updatedDetails
    },
    include: {
      _count: { select: { issuedCredentials: true } }
    }
  });

  res.json({
    success: true,
    message: 'Issuer application rejected.',
    issuer: formatIssuer(updated)
  });
});

const suspendIssuer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object' ? targetUser.issuerDetails : {};
  const issuerWallet = currentDetails.authorizedWalletAddress || targetUser.walletAddress;

  let revokeTxHash = null;
  let onChainError = null;

  if (issuerWallet && ethers.isAddress(issuerWallet)) {
    try {
      const revokeResult = await blockchainService.revokeIssuer(issuerWallet);
      if (revokeResult?.transactionHash) {
        revokeTxHash = revokeResult.transactionHash;
      }
    } catch (err) {
      onChainError = err.message;
      console.warn('[Admin] On-chain revocation warning:', err.message);
    }
  }

  const updatedDetails = {
    ...currentDetails,
    isVerified: false,
    status: 'SUSPENDED',
    suspendedAt: new Date().toISOString(),
    suspensionReason: (reason && reason.trim()) || 'Administrative review suspension.',
    ...(revokeTxHash ? { onChainRevocationTx: revokeTxHash } : {})
  };

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      issuerDetails: updatedDetails
    },
    include: {
      _count: { select: { issuedCredentials: true } }
    }
  });

  res.json({
    success: true,
    message: 'Issuer suspended successfully.',
    onChainRevocationTx: revokeTxHash,
    onChainError,
    issuer: formatIssuer(updated)
  });
});

const reactivateIssuer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object' ? targetUser.issuerDetails : {};
  const issuerWallet = currentDetails.authorizedWalletAddress || targetUser.walletAddress;

  let onChainTxHash = null;
  let onChainError = null;

  if (issuerWallet && ethers.isAddress(issuerWallet)) {
    try {
      const authResult = await blockchainService.authorizeIssuer(issuerWallet);
      if (authResult?.transactionHash) {
        onChainTxHash = authResult.transactionHash;
      }
    } catch (err) {
      onChainError = err.message;
      console.warn('[Admin] On-chain re-authorization warning:', err.message);
    }
  }

  const updatedDetails = {
    ...currentDetails,
    isVerified: true,
    status: 'VERIFIED',
    reactivatedAt: new Date().toISOString(),
    suspensionReason: null,
    ...(onChainTxHash ? { onChainAuthorizationTx: onChainTxHash } : {})
  };

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: true,
      issuerDetails: updatedDetails
    },
    include: {
      _count: { select: { issuedCredentials: true } }
    }
  });

  res.json({
    success: true,
    message: 'Issuer reactivated successfully.',
    onChainTxHash,
    onChainError,
    issuer: formatIssuer(updated)
  });
});

const syncBlockchainAuth = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.role !== 'ISSUER') {
    return res.status(404).json({ error: 'Issuer account not found.' });
  }

  const currentDetails = targetUser.issuerDetails && typeof targetUser.issuerDetails === 'object' ? targetUser.issuerDetails : {};
  const issuerWallet = currentDetails.authorizedWalletAddress || targetUser.walletAddress;

  if (!issuerWallet || !ethers.isAddress(issuerWallet)) {
    return res.status(400).json({ error: 'No valid Ethereum wallet address associated with this issuer.' });
  }

  const isAuthorized = await blockchainService.isAuthorizedIssuer(issuerWallet);
  let txHash = currentDetails.onChainAuthorizationTx || null;

  if (!isAuthorized) {
    const authResult = await blockchainService.authorizeIssuer(issuerWallet);
    if (authResult?.transactionHash) {
      txHash = authResult.transactionHash;
      await prisma.user.update({
        where: { id },
        data: {
          issuerDetails: {
            ...currentDetails,
            onChainAuthorizationTx: txHash
          }
        }
      });
    }
  }

  res.json({
    success: true,
    onChainAuthorized: true,
    transactionHash: txHash,
    message: isAuthorized ? 'Issuer is already authorized on-chain.' : 'Issuer authorized on-chain successfully.'
  });
});

module.exports = {
  getStats,
  getIssuers,
  getIssuerById,
  approveIssuer,
  rejectIssuer,
  suspendIssuer,
  reactivateIssuer,
  syncBlockchainAuth
};

