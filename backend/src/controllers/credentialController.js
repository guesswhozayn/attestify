const Credential = require('../models/Credential');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const hashService = require('../services/hashService');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const emailService = require('../services/emailService');
const axios = require('axios');
const csv = require('csv-parser');
const pdfService = require('../services/pdfService');
const asyncHandler = require('../middleware/asyncHandler');

async function prepareSBTMetadata(user, credential, ipfsCID) {
  const metadata = {
    name: `${credential.type === 'TRANSCRIPT' ? 'Academic Transcript' : 'Certification'}: ${credential.studentName}`,
    description: `A verifiable digital credential issued by ${credential.university} on ${new Date(credential.issueDate).toLocaleDateString()}. Secured by Attestify.`,
    image: null,
    external_url: `${process.env.FRONTEND_URL}/dashboard`,
    attributes: [
      { trait_type: "Degree Type", value: credential.type },
      { trait_type: "Issued By", value: credential.university },
      { trait_type: "Issuer Wallet", value: user.walletAddress },
      { trait_type: "Issuer Registration", value: user.issuerDetails?.registrationNumber || "N/A" },
      { trait_type: "Issue Date", value: new Date(credential.issueDate).toISOString().split('T')[0] },
      { trait_type: "PDF Proof", value: `ipfs://${ipfsCID}` },
      { trait_type: "Status", value: "Verified" }
    ]
  };

  const result = await ipfsService.uploadJSON(metadata, `SBT_Metadata_${credential._id}.json`);
  return `ipfs://${result.ipfsHash}`;
}

const issueCredential = asyncHandler(async (req, res) => {
  let tempFilePath = null;
  let tempImagePath = null;

  try {
    const plan = req.user.issuerDetails?.plan || 'STARTER';
    const issued = req.user.issuerDetails?.certificatesIssued || 0;
    const limit = plan === 'ENTERPRISE' ? Infinity : (plan === 'PRO' ? 500 : 5);

    if (issued + 1 > limit) {
      return res.status(403).json({ error: `Issuance limit reached for ${plan} plan. Limit: ${limit}, Current: ${issued}. Please upgrade your plan.` });
    }

    const { studentWalletAddress, studentName, university, issueDate, type = 'CERTIFICATION', transcriptData, certificationData } = req.body;
    const normalizedStudentWallet = studentWalletAddress?.toLowerCase().trim();
    const studentImageFile = req.files && req.files['studentImage'] ? req.files['studentImage'][0] : null;

    // 1. Validation: No future dates
    const parsedIssueDate = new Date(issueDate);
    if (parsedIssueDate > new Date()) {
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


    const credential = new Credential({
      studentWalletAddress: normalizedStudentWallet,
      studentName,
      university,
      issueDate: parsedIssueDate,
      type,
      transcriptData: parsedTranscriptData,
      certificationData: parsedCertificationData,
      issuedBy: req.user._id,
      metadata: {}
    });

    // 2. Pre-Save to DB (Ensures we have a record before we touch the blockchain)
    // We save without transactionHash and ipfsCID first.
    await credential.save();

    const credentialId = credential._id.toString();


    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    tempFilePath = path.join(uploadsDir, `cert_${credentialId}_${Date.now()}.pdf`);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify/${credentialId}`;
    const institutionName = req.user.issuerDetails?.institutionName || university || 'Attestify';
    const issuerWalletAddress = req.user.walletAddress;
    const issuerRegistration = req.user.issuerDetails?.registrationNumber || '';

    await pdfService.generateCredentialPDF({
        type,
        studentName,
        studentWalletAddress: normalizedStudentWallet,
        university,
        issueDate: parsedIssueDate,
        credentialId,
        transcriptData: parsedTranscriptData,
        certificationData: parsedCertificationData,
        verificationUrl,
        institutionName,
        issuerWalletAddress,
        issuerRegistration
    }, tempFilePath);

    const certificateHash = await hashService.generateSHA256(tempFilePath);


    const ipfsResult = await ipfsService.uploadFile(
      tempFilePath,
      `Certificate_${credentialId}.pdf`
    );


    let studentImageUrl = req.body.studentImage; 
    
    if (studentImageFile) {
      try {
        tempImagePath = studentImageFile.path;
        const imageIpfsResult = await ipfsService.uploadFile(
          studentImageFile.path,
          `${credentialId}_image_${studentImageFile.originalname}`
        );
        studentImageUrl = ipfsService.getIPFSUrl(imageIpfsResult.ipfsHash);
      } catch (uploadError) {
        console.error('Failed to upload student image to IPFS:', uploadError);
      }
    }


    const tokenURI = `ipfs://${ipfsResult.ipfsHash}`;
    

    const certificatePromise = blockchainService.issueCertificate(
      credentialId, 
      certificateHash,
      ipfsResult.ipfsHash
    );

    const sbtPromise = (async () => {
        try {

            const metadataURI = await prepareSBTMetadata(req.user, credential, ipfsResult.ipfsHash);
            
            const sbtRes = await blockchainService.issueSoulboundCredential(
                normalizedStudentWallet,
                metadataURI
            );
            return sbtRes;
        } catch (sbtError) {
            console.error('Failed to mint SBT:', sbtError);
            return null;
        }
    })();


    const [blockchainResult, sbtResult] = await Promise.all([certificatePromise, sbtPromise]);


    if (sbtResult) {
        credential.tokenId = sbtResult.tokenId;
    }
    credential.studentImage = studentImageUrl;
    credential.certificateHash = certificateHash;
    credential.ipfsCID = ipfsResult.ipfsHash;
    credential.transactionHash = blockchainResult.transactionHash;
    credential.blockNumber = blockchainResult.blockNumber;
    credential.gasUsed = blockchainResult.gasUsed;
    credential.gasPrice = blockchainResult.gasPrice;
    credential.totalCost = blockchainResult.totalCost;
    credential.metadata = {
      fileSize: fs.statSync(tempFilePath).size,
      fileType: 'application/pdf',
      originalFileName: `Certificate_${credentialId}.pdf`
    };

    // 3. Final Save (Updates with blockchain and IPFS data)
    await credential.save();

    req.user.issuerDetails.certificatesIssued = (req.user.issuerDetails.certificatesIssued || 0) + 1;
    await req.user.save();


    const studentUser = await User.findOne({ walletAddress: studentWalletAddress });
    
    if (studentUser && studentUser.email) {
      const emailData = {
        studentName,
        university: req.user.issuerDetails?.institutionName || university,
        issueDate,
        transactionHash: blockchainResult.transactionHash,
        id: credential._id,
        ipfsCID: ipfsResult.ipfsHash,
        certificateLink: `${process.env.FRONTEND_URL}/dashboard`,
        loginLink: `${process.env.FRONTEND_URL}/login`,
        tokenId: credential.tokenId
      };
      
      emailService.sendCertificateIssued(studentUser.email, emailData).catch(err => 
        console.error(`[EmailService] Failed to send issuance email to ${studentUser.email}:`, err)
      );
    }

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      credential: {
        id: credential._id,
        studentName: credential.studentName,
        university: credential.university,
        issueDate: credential.issueDate,
        ipfsCID: credential.ipfsCID,
        transactionHash: credential.transactionHash,
        blockNumber: credential.blockNumber
      },
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        gasUsed: blockchainResult.gasUsed,
        gasPrice: blockchainResult.gasPrice,
        totalCost: blockchainResult.totalCost
      },
      ipfs: {
        cid: ipfsResult.ipfsHash,
        url: ipfsService.getIPFSUrl(ipfsResult.ipfsHash)
      }
    });

  } catch (error) {
    console.error('Issue credential error:', error);
    
    try {
      const logPath = path.join(__dirname, '../../logs/issue_error.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.stack}\n\n`);
    } catch (logErr) {
      console.error('Failed to write to log file:', logErr);
    }

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (req.files && req.files['studentImage'] && req.files['studentImage'][0]) {
      const imgPath = req.files['studentImage'][0].path;
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    throw error;
  }
});



const batchIssueCredentials = asyncHandler(async (req, res) => {
  const file = req.files && req.files['file'] ? req.files['file'][0] : null;
  if (!file) {
    return res.status(400).json({ error: 'No CSV file provided' });
  }

  const batchStudentIds = [];
  const batchHashes = [];
  const batchIpfsCIDs = [];
  const batchRecipients = [];
  const batchTokenURIs = [];

  const pendingCredentials = [];

  const summary = {
    total: 0,
    success: 0,
    failed: 0,
    message: ''
  };

  console.log('Starting Batch Processing...');

  const processRow = async (row) => {
    let tempFilePath = null;
    try {
      if (!row.studentName || !row.studentWalletAddress) {
        throw new Error('Missing required fields');
      }

      const type = row.type || 'CERTIFICATION';
      const issueDate = row.issueDate ? new Date(row.issueDate) : new Date();

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

      const normalizedWallet = row.studentWalletAddress?.toLowerCase().trim();
      const parsedIssueDate = row.issueDate ? new Date(row.issueDate) : new Date();

      if (parsedIssueDate > new Date()) {
          throw new Error('Issue date cannot be in the future');
      }

      const credential = new Credential({
        studentWalletAddress: normalizedWallet,
        studentName: row.studentName,
        university: req.user.issuerDetails?.institutionName || row.university || 'Attestify University',
        issueDate: parsedIssueDate,
        type,
        transcriptData,
        certificationData,
        issuedBy: req.user._id,
        metadata: {}
      });
      
      const credentialId = credential._id.toString(); 

      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      tempFilePath = path.join(uploadsDir, `batch_cert_${credentialId}_${Date.now()}.pdf`);

      const institutionName = req.user.issuerDetails?.institutionName || credential.university;
      const issuerWalletAddress = req.user.walletAddress;
      const issuerRegistration = req.user.issuerDetails?.registrationNumber || '';
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify/${credentialId}`;

      await pdfService.generateCredentialPDF({
        type,
        studentName: credential.studentName,
        studentWalletAddress: normalizedWallet,
        university: credential.university,
        issueDate: credential.issueDate,
        credentialId,
        transcriptData,
        certificationData,
        verificationUrl,
        institutionName,
        issuerWalletAddress,
        issuerRegistration
      }, tempFilePath);

      const certificateHash = await hashService.generateSHA256(tempFilePath);
      const ipfsResult = await ipfsService.uploadFile(tempFilePath, `Certificate_${credentialId}.pdf`);
      
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      
      const metadataURI = await prepareSBTMetadata(req.user, credential, ipfsResult.ipfsHash);

      batchStudentIds.push(credentialId);
      batchHashes.push(certificateHash);
      batchIpfsCIDs.push(ipfsResult.ipfsHash);
      batchRecipients.push(normalizedWallet);
      batchTokenURIs.push(metadataURI);

      pendingCredentials.push({
        credential,
        certificateHash,
        ipfsHash: ipfsResult.ipfsHash,
        row,
        tempMetadata: {
             fileSize: 0,
             fileType: 'application/pdf',
             originalFileName: `Certificate_${credentialId}.pdf`
        }
      });
      summary.success++;
    } catch (err) {
       console.error('Batch preprocessing failed for row:', row, err);
       summary.failed++;
       if (tempFilePath && fs.existsSync(tempFilePath)) {
           fs.unlinkSync(tempFilePath);
       }
    }
  };

  let rows = [];
  try {
    const stream = fs.createReadStream(file.path).pipe(csv());
    for await (const row of stream) {
        rows.push(row);
    }
  } catch (parseError) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Failed to process CSV file', details: parseError.message });
  }

  const plan = req.user.issuerDetails?.plan || 'STARTER';
  const issued = req.user.issuerDetails?.certificatesIssued || 0;
  const limit = plan === 'ENTERPRISE' ? Infinity : (plan === 'PRO' ? 500 : 5);

  if (issued + rows.length > limit) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(403).json({ error: `Batch issuance exceeds limit for ${plan} plan. Limit: ${limit}, Current: ${issued}, Attempted: ${rows.length}. Please upgrade your plan.` });
  }

  for (const row of rows) {
      summary.total++;
      await processRow(row);
  }

  if (batchStudentIds.length === 0) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'No valid records to process.' });
  }

  let blockchainResult = null;
  let sbtResult = null;
  
  try {
      console.log('Sending Batch Transactions...');
      
      const certPromise = blockchainService.issueCertificateBatch(
          batchStudentIds, 
          batchHashes, 
          batchIpfsCIDs
      );

      const sbtPromise = blockchainService.issueSoulboundCredentialBatch(
          batchRecipients,
          batchTokenURIs
      );

      [blockchainResult, sbtResult] = await Promise.all([certPromise, sbtPromise]);

      if (!blockchainResult || blockchainResult.status !== 'success') {
          throw new Error('Batch Certificate Transaction Failed');
      }

  } catch (txError) {
      console.error('Batch Transaction Error:', txError);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({ success: false, error: 'Blockchain Transaction Failed', details: txError.message });
  }

  console.log('Batch Transactions Successful. Saving credentials...');
  
  const tokenIds = sbtResult ? sbtResult.tokenIds : [];
  
  const totalCostWei = BigInt(blockchainResult.totalCost || 0) + BigInt(sbtResult?.totalCost || 0);
  const count = BigInt(pendingCredentials.length);
  const costPerItem = count > 0n ? (totalCostWei / count).toString() : "0";

  for (let i = 0; i < pendingCredentials.length; i++) {
      const item = pendingCredentials[i];
      const credential = item.credential;
      
      credential.certificateHash = item.certificateHash;
      credential.ipfsCID = item.ipfsHash;
      
      credential.transactionHash = blockchainResult.transactionHash;
      credential.blockNumber = blockchainResult.blockNumber;
      
      if (tokenIds && tokenIds[i]) {
          credential.tokenId = tokenIds[i];
      }

      credential.gasUsed = "0";
      credential.gasPrice = blockchainResult.gasPrice; 
      credential.totalCost = costPerItem; 

      credential.metadata = item.tempMetadata;

      // Retry save up to 3 times — the credential is already minted on-chain,
      // so failing to persist to MongoDB is a critical consistency issue.
      let saved = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
          try {
              await credential.save();
              saved = true;
              break;
          } catch (saveError) {
              console.error(`[BatchSave] Attempt ${attempt}/3 failed for credential ${credential._id}:`, saveError.message);
              if (attempt < 3) {
                  await new Promise(r => setTimeout(r, 500 * attempt)); // backoff: 500ms, 1s
              }
          }
      }

      if (saved) {
          const studentUser = await User.findOne({ walletAddress: item.row.studentWalletAddress.toLowerCase() });
          if (studentUser && studentUser.email) {
               const emailData = {
                  studentName: item.row.studentName,
                  university: req.user.issuerDetails?.institutionName || item.row.university || 'Attestify',
                  issueDate: credential.issueDate,
                  transactionHash: blockchainResult.transactionHash,
                  id: credential._id,
                  ipfsCID: item.ipfsHash,
                  certificateLink: `${process.env.FRONTEND_URL}/dashboard`,
                  loginLink: `${process.env.FRONTEND_URL}/login`,
                  tokenId: credential.tokenId
               };
               emailService.sendCertificateIssued(studentUser.email, emailData).catch(err => 
                 console.error(`[EmailService] Failed to send batch issuance email to ${studentUser.email}:`, err)
               );
          }
          
          summary.success++;

      } else {
          // CRITICAL: On-chain credential exists but MongoDB record was not saved.
          // Log all data needed for manual reconciliation.
          console.error(`[CRITICAL] Credential minted on-chain but NOT saved to DB. Manual reconciliation required.`, {
              credentialId: credential._id.toString(),
              studentWallet: item.row.studentWalletAddress,
              studentName: item.row.studentName,
              certificateHash: item.certificateHash,
              ipfsCID: item.ipfsHash,
              transactionHash: blockchainResult.transactionHash,
              blockNumber: blockchainResult.blockNumber,
              tokenId: credential.tokenId || null
          });

          try {
              const logPath = path.join(__dirname, '../../logs/batch_reconciliation.log');
              fs.mkdirSync(path.dirname(logPath), { recursive: true });
              fs.appendFileSync(logPath, JSON.stringify({
                  timestamp: new Date().toISOString(),
                  credentialId: credential._id.toString(),
                  studentWallet: item.row.studentWalletAddress,
                  studentName: item.row.studentName,
                  certificateHash: item.certificateHash,
                  ipfsCID: item.ipfsHash,
                  transactionHash: blockchainResult.transactionHash,
                  tokenId: credential.tokenId || null,
                  fullCredentialData: credential.toObject()
              }) + '\n');
          } catch (logErr) {
              console.error('[CRITICAL] Failed to write reconciliation log:', logErr);
          }

          summary.failed++;
      }
  }

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  if (summary.success > 0) {
      req.user.issuerDetails.certificatesIssued = (req.user.issuerDetails.certificatesIssued || 0) + summary.success;
      await req.user.save();
  }

  summary.message = `Processed ${summary.total} records. Successfully issued ${summary.success} credentials.`;
  res.json({ success: true, summary });
});

const getCredentials = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    revoked = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  if (req.user.role === 'ISSUER') {
    query.issuedBy = req.user._id;
  } else {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User wallet address not found' });
    }
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  if (type) {
      query.type = type;
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { studentName: new RegExp(escapedSearch, 'i') },
      { studentWalletAddress: new RegExp(escapedSearch, 'i') },
      { university: new RegExp(escapedSearch, 'i') }
    ];
  }

  if (revoked !== null) {
    query.isRevoked = revoked === 'true';
  }

  const credentials = await Credential.find(query)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('issuedBy', 'name email university issuerDetails')
    .lean();

  const count = await Credential.countDocuments(query);

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
  const { id } = req.params;

  const credential = await Credential.findById(id)
    .populate('issuedBy', 'name email university issuerDetails')
    .populate('revokedBy', 'name email');

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Security Check: Access control
  const isOwner = req.user && req.user.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user && req.user.role === 'ISSUER' && req.user._id.toString() === credential.issuedBy._id.toString();

  if (!isOwner && !isIssuer) {
      const student = await User.findOne({ walletAddress: credential.studentWalletAddress });
      if (student?.preferences?.visibility === false) {
          return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
      }
  }

  const ipfsUrl = ipfsService.getIPFSUrl(credential.ipfsCID);
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${credential.transactionHash}`;

  res.json({
    success: true,
    credential,
    ipfsUrl,
    etherscanUrl
  });
});

const getCredentialsByStudentWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;
  const currentWallet = req.user.walletAddress?.toLowerCase().trim();
  const targetWallet = walletAddress.toLowerCase().trim();

  if (req.user.role !== 'ISSUER' && currentWallet !== targetWallet) {
    return res.status(403).json({ error: 'Unauthorized access to credentials' });
  }

  // Security Check: If issuer is querying a different student, check student's visibility preference
  if (req.user.role === 'ISSUER' && currentWallet !== targetWallet) {
      const student = await User.findOne({ walletAddress: targetWallet });
      if (student?.preferences?.visibility === false) {
          return res.status(403).json({ error: 'Unauthorized: This student profile is private.' });
      }
  }

  const credentials = await Credential.find({ studentWalletAddress: targetWallet })
    .populate('issuedBy', 'name email university issuerDetails')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    credentials
  });
});

const revokeCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const credential = await Credential.findById(id).populate('issuedBy');

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  // Use Wallet Address for ownership check to handle cases where Issuer accounts are deleted/re-registered
  const issuerWallet = credential.issuedBy?.walletAddress?.toLowerCase();
  const currentWallet = req.user.walletAddress?.toLowerCase();

  if (issuerWallet !== currentWallet) {
    return res.status(403).json({ error: 'Unauthorized: Only the original issuer wallet can revoke this credential.' });
  }

  if (credential.isRevoked) {
    return res.status(400).json({ error: 'Credential already revoked' });
  }

  const blockchainResult = await blockchainService.revokeCertificate(
    credential._id.toString()
  );

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
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User wallet address not found' });
    }
    query.studentWalletAddress = req.user.walletAddress.toLowerCase();
  }

  const total = await Credential.countDocuments(query);
  const active = await Credential.countDocuments({ 
    ...query, 
    isRevoked: false 
  });
  const revoked = await Credential.countDocuments({ 
    ...query, 
    isRevoked: true 
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonth = await Credential.countDocuments({
    ...query,
    createdAt: { $gte: startOfMonth }
  });

  const recent = await Credential.find(query)
    .sort({ createdAt: -1 })
    .limit(5)
    .select('studentName university createdAt type')
    .lean();

  const walletAddress = req.user.issuerDetails?.authorizedWalletAddress || req.user.walletAddress;
  let gasBalance = '0.00';
  
  if (walletAddress) {
      try {
          gasBalance = await blockchainService.getBalance(walletAddress);
          gasBalance = parseFloat(gasBalance).toFixed(4);
      } catch (e) {
          console.warn('Failed to fetch balance:', e);
      }
  }

  res.json({
    success: true,
    stats: {
      total,
      active,
      revoked,
      thisMonth,
      gasBalance,
      today: await Credential.countDocuments({
         ...query,
         createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }),
      thisWeek: await Credential.countDocuments({
         ...query,
         createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      }),
      verificationRequests: (await Credential.aggregate([
         { $match: query },
         { $group: { _id: null, total: { $sum: "$verificationCount" } } }
      ]))[0]?.total || 0,
      networkStats: await Promise.race([
          blockchainService.getNetworkStats(),
          new Promise(resolve => setTimeout(() => resolve({ blockNumber: 0, gasPrice: '0', connected: false, timeout: true }), 5000))
      ]),
      transactionSuccessRate: 100
    },
    recent
  });
});

const verifyCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id)
    .populate('issuedBy', 'name university email issuerDetails')
    .lean();

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  let blockchainData = null;
  try {
      blockchainData = await blockchainService.getCredential(id);
  } catch (blockchainError) {
      console.warn('Failed to fetch from blockchain during verification:', blockchainError.message);
  }

  const result = {
    ...credential,
    institutionName: credential.issuedBy?.issuerDetails?.institutionName || credential.university || 'Attestify Institution',
    blockchainProof: blockchainData ? {
      hashMatch: blockchainData.certificateHash === credential.certificateHash,
      onChain: true,
      isRevokedOnChain: blockchainData.isRevoked
    } : { onChain: false }
  };

  res.json({
    success: true,
    credential: result
  });
});

module.exports = {
  issueCredential,
  batchIssueCredentials,
  getCredentials,
  getCredentialById,
  getCredentialsByStudentWallet,
  revokeCredential,
  getStats,
  verifyCredential
};
