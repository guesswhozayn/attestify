const fs = require('fs');
const crypto = require('crypto');
const csv = require('csv-parser');
const Credential = require('../models/Credential');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const asyncHandler = require('../middleware/asyncHandler');
const { enqueueIssuanceJob } = require('../services/queueService');

const issueCredential = asyncHandler(async (req, res) => {
  const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;

  if (new Date(issueDate) > new Date()) {
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

  const studentImageFile = req.files?.['studentImage']?.[0];
  let studentImageBuffer = null;
  let studentImageName = null;

  if (studentImageFile) {
    studentImageBuffer = fs.readFileSync(studentImageFile.path);
    studentImageName = studentImageFile.originalname;
    fs.unlinkSync(studentImageFile.path);
  }

  const credentialId = crypto.randomUUID();

  const data = {
    studentWalletAddress, studentName, university, issueDate, type,
    transcriptData: parsedTranscriptData,
    certificationData: parsedCertificationData,
    studentImageBuffer, studentImageName, credentialId
  };

  await Credential.create({
    _id: credentialId,
    studentWalletAddress: studentWalletAddress.toLowerCase(),
    studentName,
    university: req.user.issuerDetails?.institutionName || university || 'Attestify',
    issueDate: new Date(issueDate),
    type,
    issuedBy: req.user._id,
    certificateHash: 'PENDING_' + credentialId,
    status: 'PENDING'
  });

  const job = await enqueueIssuanceJob({ data, user: req.user });
  await Credential.findByIdAndUpdate(credentialId, { jobId: job.id });

  res.status(202).json({
    success: true,
    message: 'Credential issuance added to processing queue',
    jobId: job.id,
    credentialId
  });
});

const batchIssueCredentials = asyncHandler(async (req, res) => {
  const file = req.files?.['file']?.[0];
  if (!file) return res.status(400).json({ error: 'No CSV file provided' });

  let rows = [];
  try {
    const stream = fs.createReadStream(file.path).pipe(csv());
    for await (const row of stream) rows.push(row);
  } catch (parseError) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Failed to process CSV file', details: parseError.message });
  }

  const summary = { total: rows.length, success: 0, failed: 0, message: '' };

  for (const row of rows) {
    try {
      if (!row.studentName || !row.studentWalletAddress) throw new Error('Missing required fields');

      const type = row.type || 'CERTIFICATION';
      const issueDate = row.issueDate ? new Date(row.issueDate) : new Date();
      if (issueDate > new Date()) throw new Error('Issue date cannot be in the future');

      let transcriptData = {};
      let certificationData = {};

      if (type === 'TRANSCRIPT') {
        transcriptData = {
          program: row.program,
          department: row.department,
          admissionYear: row.admissionYear,
          graduationYear: row.graduationYear,
          cgpa: row.cgpa,
          courses: row.courses ? row.courses.split('|').map(c => {
            const [code, name, grade, credits] = c.split(';');
            return { code, name, grade, credits };
          }) : []
        };
      } else {
        certificationData = {
          title: row.title || row.certificationTitle,
          description: row.description,
          level: row.level,
          score: row.score,
          duration: row.duration
        };
      }

      const credentialId = crypto.randomUUID();
      const data = {
        studentWalletAddress: row.studentWalletAddress,
        studentName: row.studentName,
        university: row.university || req.user.issuerDetails?.institutionName || 'Attestify University',
        issueDate: issueDate.toISOString(),
        type, transcriptData, certificationData,
        studentImageBuffer: null, studentImageName: null, credentialId
      };

      await Credential.create({
        _id: credentialId,
        studentWalletAddress: data.studentWalletAddress.toLowerCase(),
        studentName: data.studentName,
        university: data.university,
        issueDate: new Date(data.issueDate),
        type: data.type,
        issuedBy: req.user._id,
        certificateHash: 'PENDING_' + credentialId,
        status: 'PENDING'
      });

      try {
        const job = await enqueueIssuanceJob({ data, user: req.user });
        await Credential.findByIdAndUpdate(credentialId, { jobId: job.id });
        summary.success++;
      } catch (queueErr) {
        console.error('Failed to enqueue job for credential:', credentialId, queueErr);
        await Credential.findByIdAndUpdate(credentialId, {
          status: 'FAILED',
          processingError: 'Failed to add to processing queue: ' + queueErr.message
        });
        summary.failed++;
      }
    } catch (rowError) {
      console.error('Validation error for CSV row:', rowError.message);
      summary.failed++;
    }
  }

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  summary.message = `Processed ${summary.total} records. Successfully issued ${summary.success} credentials.`;
  res.json({ success: true, summary });
});

const getCredentials = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, search = '', revoked = null,
    type = null, sortBy = 'createdAt', sortOrder = 'desc'
  } = req.query;

  const query = {};
  if (req.user.role === 'ISSUER') {
    query.issuedBy = req.user._id;
  } else {
    if (!req.user.walletAddress) return res.status(400).json({ error: 'User wallet address not found' });
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  if (type) query.type = type;

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { studentName: new RegExp(escapedSearch, 'i') },
      { studentWalletAddress: new RegExp(escapedSearch, 'i') },
      { university: new RegExp(escapedSearch, 'i') }
    ];
  }

  if (revoked !== null) query.isRevoked = revoked === 'true';

  const [credentials, count] = await Promise.all([
    Credential.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('issuedBy', 'name email university issuerDetails')
      .lean(),
    Credential.countDocuments(query)
  ]);

  res.json({
    success: true,
    credentials,
    pagination: {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      perPage: parseInt(limit)
    }
  });
});

const getCredentialById = asyncHandler(async (req, res) => {
  const credential = await Credential.findById(req.params.id)
    .populate('issuedBy', 'name email university issuerDetails')
    .populate('revokedBy', 'name email');

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = req.user?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user?.role === 'ISSUER' && req.user._id.toString() === credential.issuedBy._id.toString();

  if (!isOwner && !isIssuer) {
    const student = await User.findOne({ walletAddress: credential.studentWalletAddress });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  res.json({
    success: true,
    credential,
    ipfsUrl: ipfsService.getIPFSUrl(credential.ipfsCID),
    etherscanUrl: `https://sepolia.etherscan.io/tx/${credential.transactionHash}`
  });
});

const getCredentialsByStudentWallet = asyncHandler(async (req, res) => {
  const currentWallet = req.user.walletAddress?.toLowerCase().trim();
  const targetWallet = req.params.walletAddress.toLowerCase().trim();

  if (req.user.role !== 'ISSUER' && currentWallet !== targetWallet) {
    return res.status(403).json({ error: 'Unauthorized access to credentials' });
  }

  if (req.user.role === 'ISSUER' && currentWallet !== targetWallet) {
    const student = await User.findOne({ walletAddress: targetWallet });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This student profile is private.' });
    }
  }

  const credentials = await Credential.find({ studentWalletAddress: targetWallet })
    .populate('issuedBy', 'name email university issuerDetails')
    .sort({ createdAt: -1 });

  res.json({ success: true, credentials });
});

const revokeCredential = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const credential = await Credential.findById(req.params.id).populate('issuedBy');

  if (!credential) return res.status(404).json({ error: 'Credential not found' });
  if (credential.issuedBy?._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Unauthorized: Only the original issuer can revoke this credential.' });
  }
  if (credential.isRevoked) return res.status(400).json({ error: 'Credential already revoked' });

  const blockchainResult = await blockchainService.revokeCertificate(credential._id.toString());

  if (credential.tokenId) {
    try {
      await blockchainService.revokeSoulboundCredential(credential.tokenId);
    } catch (sbtError) {
      console.error('Failed to revoke SBT:', sbtError);
    }
  }

  credential.isRevoked = true;
  credential.revokedAt = new Date();
  credential.revokedBy = req.user._id;
  credential.revocationReason = reason;
  credential.revocationGasUsed = blockchainResult.gasUsed;
  credential.revocationGasPrice = blockchainResult.gasPrice;
  credential.revocationTotalCost = blockchainResult.totalCost;
  await credential.save();

  res.json({
    success: true,
    message: 'Credential revoked successfully',
    transactionHash: blockchainResult.transactionHash,
    blockNumber: blockchainResult.blockNumber
  });
});

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isIssuer = req.user.role === 'ISSUER';

  const query = {};
  if (isIssuer) {
    query.issuedBy = userId;
  } else {
    if (!req.user.walletAddress) return res.status(400).json({ error: 'User wallet address not found' });
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const walletAddress = req.user.issuerDetails?.authorizedWalletAddress || req.user.walletAddress;

  const [
    total, active, revoked, thisMonth, today, thisWeek,
    recent, totalCompleted, totalFailed, verificationReqs, gasBalance, networkStats
  ] = await Promise.all([
    Credential.countDocuments(query),
    Credential.countDocuments({ ...query, isRevoked: false }),
    Credential.countDocuments({ ...query, isRevoked: true }),
    Credential.countDocuments({ ...query, createdAt: { $gte: startOfMonth } }),
    Credential.countDocuments({ ...query, createdAt: { $gte: startOfDay } }),
    Credential.countDocuments({ ...query, createdAt: { $gte: startOfWeek } }),
    Credential.find(query).sort({ createdAt: -1 }).limit(5).select('studentName university createdAt type').lean(),
    Credential.countDocuments({ ...query, status: 'COMPLETED' }),
    Credential.countDocuments({ ...query, status: 'FAILED' }),
    Credential.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$verificationCount" } } }
    ]),
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
      verificationRequests: verificationReqs[0]?.total || 0,
      networkStats,
      transactionSuccessRate: totalProcessed > 0 ? Math.round((totalCompleted / totalProcessed) * 100) : 100
    },
    recent
  });
});

const verifyCredential = asyncHandler(async (req, res) => {
  const credential = await Credential.findById(req.params.id)
    .populate('issuedBy', 'name university email issuerDetails')
    .lean();

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

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
  const credential = await Credential.findById(req.params.id)
    .select('status processingError certificateHash transactionHash ipfsCID');

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isCompleted = credential.status === 'COMPLETED';
  res.json({
    success: true,
    status: credential.status,
    credential: {
      id: credential._id,
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
