const fs = require('fs');
const crypto = require('crypto');
const csv = require('csv-parser');
const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const asyncHandler = require('../middleware/asyncHandler');
const { enqueueIssuanceJob, enqueueBulkIssuanceJobs } = require('../services/queueService');
const { isValidCalendarDate } = require('../middleware/validator');

const issueCredential = asyncHandler(async (req, res) => {
  const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
  const studentImageFile = req.files?.['studentImage']?.[0];

  if (!studentWalletAddress || !ethers.isAddress(studentWalletAddress.trim())) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch (e) {}
    }
    return res.status(400).json({ error: 'Invalid or missing student Ethereum wallet address' });
  }

  if (new Date(issueDate) > new Date()) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch (e) {}
    }
    return res.status(400).json({ error: 'Issue date cannot be in the future.' });
  }

  let parsedTranscriptData = transcriptData;
  let parsedCertificationData = certificationData;
  try {
    if (typeof transcriptData === 'string') parsedTranscriptData = JSON.parse(transcriptData);
    if (typeof certificationData === 'string') parsedCertificationData = JSON.parse(certificationData);
  } catch (e) {
    console.warn('Failed to parse JSON data', e);
  }

  const credentialId = crypto.randomUUID();

  const data = {
    studentWalletAddress, studentName, university, issueDate, type,
    transcriptData: parsedTranscriptData,
    certificationData: parsedCertificationData,
    studentImagePath: studentImageFile ? studentImageFile.path : null,
    studentImageName: studentImageFile ? studentImageFile.originalname : null,
    credentialId
  };

  await prisma.credential.create({
    data: {
      id: credentialId,
      studentWalletAddress: studentWalletAddress.toLowerCase().trim(),
      studentName,
      university: req.user.issuerDetails?.institutionName || university || 'Attestify',
      issueDate: new Date(issueDate),
      type,
      issuedById: req.user.id,
      certificateHash: 'PENDING_' + credentialId,
      status: 'PENDING'
    }
  });

  try {
    const job = await enqueueIssuanceJob({ data, user: req.user });
    await prisma.credential.update({
      where: { id: credentialId },
      data: { jobId: job.id }
    });

    res.status(202).json({
      success: true,
      message: 'Credential issuance added to processing queue',
      jobId: job.id,
      credentialId
    });
  } catch (queueErr) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch (e) {}
    }
    await prisma.credential.update({
      where: { id: credentialId },
      data: {
        status: 'FAILED',
        processingError: 'Failed to enqueue issuance job: ' + queueErr.message
      }
    });
    throw queueErr;
  }
});

const batchIssueCredentials = asyncHandler(async (req, res) => {
  const file = req.files?.['file']?.[0];
  if (!file) return res.status(400).json({ error: 'No CSV file provided' });

  let rows = [];
  try {
    const stream = fs.createReadStream(file.path).pipe(csv());
    for await (const row of stream) rows.push(row);
  } catch (parseError) {
    return res.status(400).json({ error: 'Failed to process CSV file', details: parseError.message });
  } finally {
    if (fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
  }

  const MAX_BATCH_SIZE = 500;
  if (rows.length > MAX_BATCH_SIZE) {
    return res.status(400).json({ error: `Batch size exceeds maximum limit of ${MAX_BATCH_SIZE} records per upload.` });
  }

  if (rows.length === 0) {
    return res.status(400).json({ error: 'The uploaded CSV file is empty.' });
  }

  const validDbRecords = [];
  const validQueueJobs = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    try {
      if (!row.studentName?.trim() || !row.studentWalletAddress?.trim()) {
        throw new Error('Missing studentName or studentWalletAddress');
      }
      if (!ethers.isAddress(row.studentWalletAddress.trim())) {
        throw new Error(`Invalid student wallet address: ${row.studentWalletAddress}`);
      }

      const type = row.type?.trim().toUpperCase() === 'TRANSCRIPT' ? 'TRANSCRIPT' : 'CERTIFICATION';
      if (row.issueDate && !isValidCalendarDate(row.issueDate)) {
        throw new Error(`Invalid issueDate: ${row.issueDate}`);
      }
      const parsedDate = row.issueDate ? new Date(row.issueDate) : new Date();
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid issueDate: ${row.issueDate}`);
      }
      if (parsedDate > new Date()) {
        throw new Error('Issue date cannot be in the future');
      }

      let transcriptData = {};
      let certificationData = {};

      if (type === 'TRANSCRIPT') {
        transcriptData = {
          program: row.program || '',
          department: row.department || '',
          admissionYear: row.admissionYear || '',
          graduationYear: row.graduationYear || '',
          cgpa: row.cgpa || '',
          courses: row.courses ? row.courses.split('|').map(c => {
            const [code, name, grade, credits] = c.split(';');
            return { code: code || '', name: name || '', grade: grade || '', credits: credits || '' };
          }) : []
        };
      } else {
        certificationData = {
          title: row.title || row.certificationTitle || 'Academic Certificate',
          description: row.description || '',
          level: row.level || 'Intermediate',
          score: row.score || '',
          duration: row.duration || ''
        };
      }

      const credentialId = crypto.randomUUID();
      const university = row.university || req.user.issuerDetails?.institutionName || 'Attestify University';
      const studentWallet = row.studentWalletAddress.toLowerCase().trim();

      validDbRecords.push({
        id: credentialId,
        studentWalletAddress: studentWallet,
        studentName: row.studentName.trim(),
        university,
        issueDate: parsedDate,
        type,
        issuedById: req.user.id,
        certificateHash: 'PENDING_' + credentialId,
        status: 'PENDING'
      });

      validQueueJobs.push({
        data: {
          studentWalletAddress: studentWallet,
          studentName: row.studentName.trim(),
          university,
          issueDate: parsedDate.toISOString(),
          type,
          transcriptData,
          certificationData,
          studentImagePath: null,
          studentImageName: null,
          credentialId
        },
        user: req.user
      });
    } catch (err) {
      errors.push({ row: rowNum, error: err.message });
    }
  });

  if (validDbRecords.length > 0) {
    await prisma.credential.createMany({ data: validDbRecords });
    try {
      const enqueued = await enqueueBulkIssuanceJobs(validQueueJobs);
      if (Array.isArray(enqueued) && enqueued.length === validDbRecords.length) {
        await Promise.all(
          enqueued.map((job, i) =>
            prisma.credential.update({
              where: { id: validDbRecords[i].id },
              data: { jobId: job.id }
            })
          )
        );
      }
    } catch (queueErr) {
      console.error('Failed to enqueue bulk issuance jobs:', queueErr);
      const failedIds = validDbRecords.map(r => r.id);
      await prisma.credential.updateMany({
        where: { id: { in: failedIds } },
        data: { status: 'FAILED', processingError: 'Failed to enqueue: ' + queueErr.message }
      });
      return res.status(500).json({
        error: 'Failed to enqueue batch credentials',
        details: queueErr.message
      });
    }
  }

  const summary = {
    total: rows.length,
    queued: validDbRecords.length,
    success: validDbRecords.length,
    failed: errors.length,
    errors: errors.slice(0, 20),
    message: `Batch processed: ${validDbRecords.length} records queued for issuance, ${errors.length} rejected.`
  };

  res.json({ success: true, summary });
});

const getCredentials = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, search = '', revoked = null,
    type = null, sortBy = 'createdAt', sortOrder = 'desc'
  } = req.query;

  const where = {};
  if (req.user.role === 'ISSUER') {
    where.issuedById = req.user.id;
  } else {
    if (!req.user.walletAddress) return res.status(400).json({ error: 'User wallet address not found' });
    where.studentWalletAddress = { equals: req.user.walletAddress.toLowerCase().trim(), mode: 'insensitive' };
  }

  if (type) where.type = type;
  if (revoked !== null) where.isRevoked = revoked === 'true';

  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: 'insensitive' } },
      { studentWalletAddress: { contains: search, mode: 'insensitive' } },
      { university: { contains: search, mode: 'insensitive' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;
  const allowedSortFields = new Set(['createdAt', 'issueDate', 'studentName', 'university', 'type']);
  const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : 'createdAt';
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const [credentials, count] = await Promise.all([
    prisma.credential.findMany({
      where,
      orderBy: { [safeSortBy]: safeSortOrder },
      skip,
      take,
      include: {
        issuedBy: {
          select: { id: true, name: true, email: true, university: true, issuerDetails: true }
        }
      }
    }),
    prisma.credential.count({ where })
  ]);

  res.json({
    success: true,
    credentials,
    pagination: {
      total: count,
      totalPages: Math.ceil(count / take),
      currentPage: pageNum,
      perPage: take
    }
  });
});

const getCredentialById = asyncHandler(async (req, res) => {
  const credential = await prisma.credential.findUnique({
    where: { id: req.params.id },
    include: {
      issuedBy: { select: { id: true, name: true, email: true, university: true, issuerDetails: true } },
      revokedByUser: { select: { id: true, name: true, email: true } }
    }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = req.user?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user?.role === 'ISSUER' && req.user.id === credential.issuedById;

  if (!isOwner && !isIssuer) {
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  res.json({
    success: true,
    credential,
    ipfsUrl: credential.ipfsCID ? ipfsService.getIPFSUrl(credential.ipfsCID) : null,
    etherscanUrl: credential.transactionHash ? `https://sepolia.etherscan.io/tx/${credential.transactionHash}` : null
  });
});

const getCredentialsByStudentWallet = asyncHandler(async (req, res) => {
  const currentWallet = req.user.walletAddress?.toLowerCase().trim();
  const targetWallet = req.params.walletAddress.toLowerCase().trim();

  if (req.user.role !== 'ISSUER' && currentWallet !== targetWallet) {
    return res.status(403).json({ error: 'Unauthorized access to credentials' });
  }

  if (req.user.role === 'ISSUER' && currentWallet !== targetWallet) {
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: targetWallet, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This student profile is private.' });
    }
  }

  const credentials = await prisma.credential.findMany({
    where: { studentWalletAddress: { equals: targetWallet, mode: 'insensitive' } },
    include: {
      issuedBy: { select: { id: true, name: true, email: true, university: true, issuerDetails: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, credentials });
});

const revokeCredential = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const credential = await prisma.credential.findUnique({
    where: { id: req.params.id },
    include: { issuedBy: true }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });
  if (credential.issuedById !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized: Only the original issuer can revoke this credential.' });
  }
  if (credential.isRevoked) return res.status(400).json({ error: 'Credential already revoked' });
  if (credential.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Only credentials in COMPLETED status can be revoked on-chain.' });
  }

  const blockchainResult = await blockchainService.revokeCertificate(credential.id);

  if (credential.tokenId) {
    try {
      await blockchainService.revokeSoulboundCredential(credential.tokenId);
    } catch (sbtError) {
      console.error('Failed to revoke SBT:', sbtError);
    }
  }

  await prisma.credential.update({
    where: { id: credential.id },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedById: req.user.id,
      revocationReason: reason,
      revocationGasUsed: blockchainResult.gasUsed,
      revocationGasPrice: blockchainResult.gasPrice,
      revocationTotalCost: blockchainResult.totalCost
    }
  });

  res.json({
    success: true,
    message: 'Credential revoked successfully',
    transactionHash: blockchainResult.transactionHash,
    blockNumber: blockchainResult.blockNumber
  });
});

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const isIssuer = req.user.role === 'ISSUER';

  const where = {};
  if (isIssuer) {
    where.issuedById = userId;
  } else {
    if (!req.user.walletAddress) return res.status(400).json({ error: 'User wallet address not found' });
    where.studentWalletAddress = { equals: req.user.walletAddress.toLowerCase().trim(), mode: 'insensitive' };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const walletAddress = req.user.issuerDetails?.authorizedWalletAddress || req.user.walletAddress;

  const [
    total, active, revoked, thisMonth, today, thisWeek,
    recent, totalCompleted, totalFailed, verificationsAgg, gasBalance, networkStats
  ] = await Promise.all([
    prisma.credential.count({ where }),
    prisma.credential.count({ where: { ...where, isRevoked: false } }),
    prisma.credential.count({ where: { ...where, isRevoked: true } }),
    prisma.credential.count({ where: { ...where, createdAt: { gte: startOfMonth } } }),
    prisma.credential.count({ where: { ...where, createdAt: { gte: startOfDay } } }),
    prisma.credential.count({ where: { ...where, createdAt: { gte: startOfWeek } } }),
    prisma.credential.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { studentName: true, university: true, createdAt: true, type: true }
    }),
    prisma.credential.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.credential.count({ where: { ...where, status: 'FAILED' } }),
    prisma.credential.aggregate({
      where,
      _sum: { verificationCount: true }
    }),
    (async () => {
      if (!walletAddress) return '0.00';
      try {
        return parseFloat(await blockchainService.getBalance(walletAddress)).toFixed(4);
      } catch (e) {
        console.warn('Failed to fetch balance:', e);
        return '0.00';
      }
    })(),
    Promise.race([
      blockchainService.getNetworkStats(),
      new Promise(resolve => setTimeout(() => resolve({ blockNumber: 0, gasPrice: '0', connected: false, timeout: true }), 5000))
    ])
  ]);

  const totalProcessed = totalCompleted + totalFailed;

  res.json({
    success: true,
    stats: {
      total, active, revoked, thisMonth, gasBalance, today, thisWeek,
      verificationRequests: verificationsAgg._sum.verificationCount || 0,
      networkStats,
      transactionSuccessRate: totalProcessed > 0 ? Math.round((totalCompleted / totalProcessed) * 100) : 100
    },
    recent
  });
});

const verifyCredential = asyncHandler(async (req, res) => {
  const credential = await prisma.credential.findUnique({
    where: { id: req.params.id },
    include: {
      issuedBy: { select: { id: true, name: true, university: true, email: true, issuerDetails: true } }
    }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = req.user?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user?.role === 'ISSUER' && (
    req.user.id === credential.issuedById ||
    req.user.walletAddress?.toLowerCase() === credential.issuedBy?.walletAddress?.toLowerCase()
  );

  if (!isOwner && !isIssuer) {
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  let blockchainData = null;
  try {
    blockchainData = await blockchainService.getCredential(req.params.id);
  } catch (blockchainError) {
    console.warn('Failed to fetch from blockchain during verification:', blockchainError.message);
  }

  res.json({
    success: true,
    credential: {
      ...credential,
      isRevoked: credential.isRevoked || (blockchainData?.isRevoked ?? false),
      institutionName: credential.issuedBy?.issuerDetails?.institutionName || credential.university || 'Attestify Institution',
      blockchainProof: blockchainData ? {
        hashMatch: blockchainData.certificateHash === credential.certificateHash,
        onChain: true,
        isRevokedOnChain: blockchainData.isRevoked
      } : { onChain: false }
    }
  });
});

const getCredentialStatus = asyncHandler(async (req, res) => {
  const credential = await prisma.credential.findUnique({
    where: { id: req.params.id },
    select: { id: true, status: true, processingError: true, certificateHash: true, transactionHash: true, ipfsCID: true }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isCompleted = credential.status === 'COMPLETED';
  res.json({
    success: true,
    status: credential.status,
    credential: {
      id: credential.id,
      error: credential.processingError,
      certificateHash: isCompleted ? credential.certificateHash : null,
      transactionHash: isCompleted ? credential.transactionHash : null,
      ipfsCID: isCompleted ? credential.ipfsCID : null,
    }
  });
});

module.exports = {
  issueCredential, batchIssueCredentials, getCredentials, getCredentialById,
  getCredentialsByStudentWallet, revokeCredential, getStats, verifyCredential, getCredentialStatus
};
