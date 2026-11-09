const fs = require('fs');
const crypto = require('crypto');
const csv = require('csv-parser');
const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const blockchainService = require('../services/blockchainService');
const credentialService = require('../services/credentialService');
const ipfsService = require('../services/ipfsService');
const asyncHandler = require('../middleware/asyncHandler');
const { enqueueIssuanceJob, enqueueBulkIssuanceJobs, isServerlessWithoutQueue } = require('../services/queueService');
const { isValidCalendarDate } = require('../middleware/validator');

const issueCredential = asyncHandler(async (req, res) => {
  const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
  const studentImageFile = req.files?.['studentImage']?.[0];

  if (!studentWalletAddress || !ethers.isAddress(studentWalletAddress.trim())) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    return res.status(400).json({ error: 'Invalid or missing student Ethereum wallet address' });
  }

  if (new Date(issueDate) > new Date()) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    return res.status(400).json({ error: 'Issue date cannot be in the future.' });
  }

  const normalizedType = String(type || 'CERTIFICATION').toUpperCase();
  if (!['TRANSCRIPT', 'CERTIFICATION'].includes(normalizedType)) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    return res.status(400).json({ error: 'Credential type must be TRANSCRIPT or CERTIFICATION.' });
  }

  let parsedTranscriptData = transcriptData;
  let parsedCertificationData = certificationData;
  try {
    if (typeof transcriptData === 'string') parsedTranscriptData = JSON.parse(transcriptData);
    if (typeof certificationData === 'string') parsedCertificationData = JSON.parse(certificationData);
  } catch {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    return res.status(400).json({ error: 'Invalid JSON in transcriptData or certificationData.' });
  }

  if (Array.isArray(parsedTranscriptData?.courses) && parsedTranscriptData.courses.length > 150) {
    if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    return res.status(400).json({ error: 'Transcript cannot exceed 150 courses.' });
  }

  let studentImageBuffer = null;
  if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
    try {
      studentImageBuffer = fs.readFileSync(studentImageFile.path);
    } finally {
      try { fs.unlinkSync(studentImageFile.path); } catch {}
    }
    const isPng = studentImageBuffer.length >= 8 && studentImageBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    const isJpeg = studentImageBuffer.length >= 3 && studentImageBuffer[0] === 0xFF && studentImageBuffer[1] === 0xD8 && studentImageBuffer[2] === 0xFF;
    const isWebp = studentImageBuffer.length >= 12 && studentImageBuffer.subarray(0, 4).toString('ascii') === 'RIFF' && studentImageBuffer.subarray(8, 12).toString('ascii') === 'WEBP';
    if (!isPng && !isJpeg && !isWebp) {
      return res.status(400).json({ error: 'Invalid image file content. Allowed formats: PNG, JPEG, WEBP.' });
    }
  }

  const credentialId = crypto.randomUUID();
  const issuerUniversity = req.user.issuerDetails?.institutionName || req.user.university || university || 'Attestify';

  const trimmedStudentName = studentName.trim();
  const data = {
    studentWalletAddress, studentName: trimmedStudentName, university: issuerUniversity, issueDate, type: normalizedType,
    transcriptData: parsedTranscriptData,
    certificationData: parsedCertificationData,
    studentImageBuffer,
    studentImagePath: null,
    studentImageName: studentImageFile ? studentImageFile.originalname : null,
    credentialId
  };

  await prisma.credential.create({
    data: {
      id: credentialId,
      studentWalletAddress: studentWalletAddress.toLowerCase().trim(),
      studentName: trimmedStudentName,
      university: issuerUniversity,
      issueDate: new Date(issueDate),
      type: normalizedType,
      transcriptData: parsedTranscriptData,
      certificationData: parsedCertificationData,
      issuedById: req.user.id,
      certificateHash: 'PENDING_' + credentialId,
      status: isServerlessWithoutQueue ? 'PROCESSING' : 'PENDING'
    }
  });

  if (isServerlessWithoutQueue) {
    try {
      const result = await credentialService.processIssuance(data, req.user);
      return res.status(201).json({
        success: true,
        message: 'Credential issued successfully',
        credentialId,
        credential: result.credential
      });
    } catch (issueErr) {
      if (studentImageFile?.path && fs.existsSync(studentImageFile.path)) {
        try { fs.unlinkSync(studentImageFile.path); } catch {}
      }
      await prisma.credential.update({
        where: { id: credentialId },
        data: {
          status: 'FAILED',
          processingError: issueErr.message
        }
      });
      throw issueErr;
    }
  }

  try {
    const job = await enqueueIssuanceJob({ data, user: { id: req.user.id } });
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
      try { fs.unlinkSync(studentImageFile.path); } catch {}
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

  const MAX_BATCH_SIZE = isServerlessWithoutQueue ? 10 : 500;
  let rows = [];
  let exceededLimit = false;
  try {
    const fileStream = fs.createReadStream(file.path);
    const stream = fileStream.pipe(csv());
    for await (const row of stream) {
      rows.push(row);
      if (rows.length > MAX_BATCH_SIZE) {
        exceededLimit = true;
        fileStream.destroy();
        break;
      }
    }
  } catch (parseError) {
    if (!exceededLimit) {
      return res.status(400).json({ error: 'Failed to process CSV file' });
    }
  } finally {
    if (fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch {}
    }
  }

  if (exceededLimit || rows.length > MAX_BATCH_SIZE) {
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
      if (row.studentName.trim().length > 150) {
        throw new Error('studentName cannot exceed 150 characters');
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
        const parsedCourses = row.courses ? row.courses.split('|').slice(0, 150).map(c => {
          const [code, name, grade, credits] = c.split(';');
          return { code: code || '', name: name || '', grade: grade || '', credits: credits || '' };
        }) : [];
        transcriptData = {
          program: row.program || '',
          department: row.department || '',
          admissionYear: row.admissionYear || '',
          graduationYear: row.graduationYear || '',
          cgpa: row.cgpa || '',
          courses: parsedCourses
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
      const university = req.user.issuerDetails?.institutionName || req.user.university || row.university || 'Attestify University';
      const studentWallet = row.studentWalletAddress.toLowerCase().trim();

      validDbRecords.push({
        id: credentialId,
        studentWalletAddress: studentWallet,
        studentName: row.studentName.trim(),
        university,
        issueDate: parsedDate,
        type,
        transcriptData,
        certificationData,
        issuedById: req.user.id,
        certificateHash: 'PENDING_' + credentialId,
        status: 'PENDING'
      });

      validQueueJobs.push({
        rowNum,
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
        user: { id: req.user.id }
      });
    } catch (err) {
      errors.push({ row: rowNum, studentName: row.studentName?.trim() || 'N/A', error: err.message });
    }
  });

  if (validDbRecords.length > 0) {
    await prisma.credential.createMany({ data: validDbRecords });

    if (isServerlessWithoutQueue) {
      let succeeded = 0;
      for (let i = 0; i < validQueueJobs.length; i++) {
        const jobItem = validQueueJobs[i];
        try {
          await prisma.credential.update({
            where: { id: jobItem.data.credentialId },
            data: { status: 'PROCESSING' }
          });
          await credentialService.processIssuance(jobItem.data, req.user);
          succeeded++;
        } catch (err) {
          errors.push({ row: jobItem.rowNum, studentName: jobItem.data.studentName, error: err.message });
          await prisma.credential.update({
            where: { id: jobItem.data.credentialId },
            data: { status: 'FAILED', processingError: err.message }
          });
        }
      }

      return res.json({
        success: true,
        summary: {
          total: rows.length,
          queued: succeeded,
          success: succeeded,
          failed: errors.length,
          errors: errors.slice(0, 20),
          message: `Batch processed: ${succeeded} credentials issued, ${errors.length} failed.`
        }
      });
    }

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
        error: 'Failed to enqueue batch credentials'
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
    page = 1, limit = 20, search = '', revoked = null, status = null,
    type = null, sortBy = 'createdAt', sortOrder = 'desc'
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const where = {};
  const isIssuer = req.user.role === 'ISSUER';
  if (isIssuer) {
    where.issuedById = req.user.id;
  } else {
    if (!req.user.walletAddress) {
      return res.json({
        success: true,
        credentials: [],
        pagination: { total: 0, totalPages: 1, currentPage: 1, perPage: take }
      });
    }
    where.studentWalletAddress = { equals: req.user.walletAddress.toLowerCase().trim(), mode: 'insensitive' };
    where.status = 'COMPLETED';
  }

  if (type && ['TRANSCRIPT', 'CERTIFICATION'].includes(String(type).toUpperCase())) {
    where.type = String(type).toUpperCase();
  }
  if (isIssuer && status && ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(String(status).toUpperCase())) {
    where.status = String(status).toUpperCase();
  } else if (isIssuer && status && String(status).toUpperCase() === 'PROCESSING_ALL') {
    where.status = { in: ['PENDING', 'PROCESSING'] };
  }
  if (revoked !== null) {
    where.isRevoked = revoked === 'true';
    if (revoked === 'false' && !where.status) {
      where.status = 'COMPLETED';
    }
  }

  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: 'insensitive' } },
      { studentWalletAddress: { contains: search, mode: 'insensitive' } },
      { university: { contains: search, mode: 'insensitive' } }
    ];
  }

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
          select: { id: true, name: true, university: true, issuerDetails: true }
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
      issuedBy: { select: { id: true, name: true, university: true, issuerDetails: true } },
      revokedByUser: { select: { id: true, name: true } }
    }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = Boolean(
    req.user?.walletAddress &&
    credential.studentWalletAddress &&
    req.user.walletAddress.toLowerCase() === credential.studentWalletAddress.toLowerCase()
  );
  const isIssuer = req.user?.role === 'ISSUER' && req.user.id === credential.issuedById;

  if (!isOwner && !isIssuer) {
    if (credential.status !== 'COMPLETED') {
      return res.status(404).json({ error: 'Credential not found' });
    }
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  const canAccessSensitive = isOwner || isIssuer;
  const responseCredential = isIssuer
    ? credential
    : {
        ...credential,
        processingError: undefined,
        jobId: undefined,
        certificateHash: canAccessSensitive ? credential.certificateHash : undefined,
        ipfsCID: canAccessSensitive ? credential.ipfsCID : undefined,
        metadata: canAccessSensitive ? credential.metadata : undefined
      };

  res.json({
    success: true,
    credential: responseCredential,
    ipfsUrl: canAccessSensitive && credential.ipfsCID ? ipfsService.getIPFSUrl(credential.ipfsCID) : null,
    etherscanUrl: credential.transactionHash ? `https://sepolia.etherscan.io/tx/${credential.transactionHash}` : null
  });
});

const getCredentialsByStudentWallet = asyncHandler(async (req, res) => {
  const currentWallet = req.user.walletAddress?.toLowerCase().trim();
  const targetWallet = req.params.walletAddress?.toLowerCase().trim();
  const isOwner = Boolean(currentWallet && targetWallet && currentWallet === targetWallet);

  if (req.user.role !== 'ISSUER' && !isOwner) {
    return res.status(403).json({ error: 'Unauthorized access to credentials' });
  }

  if (req.user.role === 'ISSUER' && !isOwner) {
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: targetWallet, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      const issuerCredentials = await prisma.credential.findMany({
        where: {
          studentWalletAddress: { equals: targetWallet, mode: 'insensitive' },
          issuedById: req.user.id
        },
        include: {
          issuedBy: { select: { id: true, name: true, university: true, issuerDetails: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, credentials: issuerCredentials });
    }
  }

  const baseWhere = { studentWalletAddress: { equals: targetWallet, mode: 'insensitive' } };
  if (req.user.role !== 'ISSUER') {
    baseWhere.status = 'COMPLETED';
  } else {
    baseWhere.OR = [
      { status: 'COMPLETED' },
      { issuedById: req.user.id }
    ];
  }

  const credentials = await prisma.credential.findMany({
    where: baseWhere,
    include: {
      issuedBy: { select: { id: true, name: true, university: true, issuerDetails: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const sanitized = credentials.map(c => {
    const isCredIssuer = req.user.role === 'ISSUER' && c.issuedById === req.user.id;
    const canAccessSensitive = isOwner || isCredIssuer;
    return isCredIssuer
      ? c
      : {
          ...c,
          processingError: undefined,
          jobId: undefined,
          certificateHash: canAccessSensitive ? c.certificateHash : undefined,
          ipfsCID: canAccessSensitive ? c.ipfsCID : undefined,
          metadata: canAccessSensitive ? c.metadata : undefined
        };
  });

  res.json({ success: true, credentials: sanitized });
});

const revokeCredential = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ error: 'A revocation reason is required' });
  }
  const trimmedReason = reason.trim();
  if (trimmedReason.length > 500) {
    return res.status(400).json({ error: 'Revocation reason cannot exceed 500 characters' });
  }

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

  let blockchainResult = { transactionHash: credential.transactionHash || null, blockNumber: credential.blockNumber || null, gasUsed: '0', gasPrice: '0', totalCost: '0' };
  const onChainCred = await blockchainService.getCredential(credential.id).catch(() => null);
  if (!onChainCred?.isRevoked) {
    blockchainResult = await blockchainService.revokeCertificate(credential.id);
  }

  let sbtResult = null;
  let sbtWarning = null;
  if (credential.tokenId) {
    try {
      sbtResult = await blockchainService.revokeSoulboundCredential(credential.tokenId);
    } catch (sbtError) {
      console.error('Failed to revoke SBT:', sbtError);
      sbtWarning = 'Certificate was revoked on-chain, but burning the Soulbound Token failed.';
    }
  }

  const totalGasUsed = (BigInt(blockchainResult.gasUsed || 0) + BigInt(sbtResult?.gasUsed || 0)).toString();
  const totalCost = (BigInt(blockchainResult.totalCost || 0) + BigInt(sbtResult?.totalCost || 0)).toString();

  await prisma.credential.update({
    where: { id: credential.id },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedById: req.user.id,
      revocationReason: trimmedReason,
      revocationGasUsed: totalGasUsed,
      revocationGasPrice: blockchainResult.gasPrice,
      revocationTotalCost: totalCost
    }
  });

  res.json({
    success: true,
    message: sbtWarning || 'Credential revoked successfully',
    warning: sbtWarning,
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
    if (!req.user.walletAddress) {
      return res.json({
        success: true,
        stats: {
          total: 0, active: 0, revoked: 0, thisMonth: 0, gasBalance: '0.00', today: 0, thisWeek: 0,
          verificationRequests: 0,
          networkStats: { blockNumber: 0, gasPrice: '0', connected: false },
          transactionSuccessRate: 100
        },
        recent: []
      });
    }
    where.studentWalletAddress = { equals: req.user.walletAddress.toLowerCase().trim(), mode: 'insensitive' };
    where.status = 'COMPLETED';
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
    prisma.credential.count({ where: { ...where, status: 'COMPLETED', isRevoked: false } }),
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
      try {
        if (walletAddress) {
          const bal = parseFloat(await blockchainService.getBalance(walletAddress));
          if (bal > 0 || !isIssuer) return bal.toFixed(4);
        }
        if (isIssuer) {
          return parseFloat(await blockchainService.getBalance()).toFixed(4);
        }
        return '0.00';
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
      issuedBy: { select: { id: true, name: true, university: true, issuerDetails: true, walletAddress: true } }
    }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = Boolean(
    req.user?.walletAddress &&
    credential.studentWalletAddress &&
    req.user.walletAddress.toLowerCase() === credential.studentWalletAddress.toLowerCase()
  );
  const isIssuer = req.user?.role === 'ISSUER' && (
    req.user.id === credential.issuedById ||
    Boolean(
      req.user.walletAddress &&
      credential.issuedBy?.walletAddress &&
      req.user.walletAddress.toLowerCase() === credential.issuedBy.walletAddress.toLowerCase()
    )
  );

  if (!isOwner && !isIssuer) {
    if (credential.status !== 'COMPLETED') {
      return res.status(404).json({ error: 'Credential not found' });
    }
    const student = await prisma.user.findFirst({
      where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
    });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  let blockchainData = null;
  if (credential.status === 'COMPLETED') {
    try {
      blockchainData = await blockchainService.getCredential(req.params.id);
    } catch (blockchainError) {
      console.warn('Failed to fetch from blockchain during verification:', blockchainError.message);
    }
  }

  const hashMatch = Boolean(
    blockchainData &&
    blockchainData.certificateHash?.toLowerCase() === credential.certificateHash?.toLowerCase()
  );
  const effectiveRevoked = credential.isRevoked || (blockchainData?.isRevoked ?? false);

  if (!effectiveRevoked && hashMatch) {
    await prisma.credential.update({
      where: { id: credential.id },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: new Date()
      }
    });
  }

  const canAccessSensitive = isOwner || isIssuer;
  res.json({
    success: true,
    credential: {
      ...credential,
      processingError: isIssuer ? credential.processingError : undefined,
      jobId: isIssuer ? credential.jobId : undefined,
      certificateHash: canAccessSensitive ? credential.certificateHash : undefined,
      ipfsCID: canAccessSensitive ? credential.ipfsCID : undefined,
      metadata: canAccessSensitive ? credential.metadata : undefined,
      isRevoked: effectiveRevoked,
      institutionName: credential.issuedBy?.issuerDetails?.institutionName || credential.university || 'Attestify Institution',
      blockchainProof: blockchainData ? {
        hashMatch,
        onChain: true,
        isRevokedOnChain: blockchainData.isRevoked
      } : { onChain: false }
    }
  });
});

const getCredentialStatus = asyncHandler(async (req, res) => {
  const credential = await prisma.credential.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, status: true, processingError: true, certificateHash: true,
      transactionHash: true, ipfsCID: true, issuedById: true, studentWalletAddress: true
    }
  });

  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  const isOwner = Boolean(
    req.user?.walletAddress &&
    credential.studentWalletAddress &&
    req.user.walletAddress.toLowerCase() === credential.studentWalletAddress.toLowerCase()
  );
  const isIssuer = req.user?.role === 'ISSUER' && req.user.id === credential.issuedById;
  if (!isOwner && !isIssuer) {
    return res.status(403).json({ error: 'Unauthorized access to credential status' });
  }

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
