const axios = require('axios');
const { prisma } = require('../config/database');
const ipfsService = require('../services/ipfsService');
const asyncHandler = require('../middleware/asyncHandler');

const SAFE_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

const canAccessCredential = async (credential, reqUser) => {
  const isIssuer = reqUser?.role === 'ISSUER' && reqUser.id === credential.issuedById;
  if (isIssuer) return true;
  if (credential.status !== 'COMPLETED') return false;

  const isOwner = reqUser?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  if (isOwner) return true;

  const student = await prisma.user.findFirst({
    where: { walletAddress: { equals: credential.studentWalletAddress, mode: 'insensitive' } }
  });
  return student?.preferences?.visibility !== false;
};

const streamIPFSFile = async (cid, res, defaultContentType, filename) => {
  const ipfsUrl = ipfsService.getIPFSUrl(cid);
  try {
    const response = await axios({
      method: 'get',
      url: ipfsUrl,
      responseType: 'stream',
      timeout: 30000,
      maxContentLength: 25 * 1024 * 1024
    });
    const upstreamMime = (response.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const contentType = defaultContentType || (SAFE_MIMES.has(upstreamMime) ? upstreamMime : 'application/octet-stream');
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.setHeader('Content-Disposition', `attachment; filename="${filename || `${cid}.bin`}"`);
    res.on('close', () => {
      if (!res.writableEnded) {
        response.data.destroy();
      }
    });
    response.data.on('error', (err) => {
      console.error('IPFS stream read error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Failed to stream file from IPFS' });
      } else {
        res.destroy();
      }
    });
    response.data.pipe(res);
  } catch (error) {
    console.error('IPFS stream error:', error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to retrieve file from IPFS' });
    } else {
      res.destroy();
    }
  }
};

const CID_REGEX = /^[a-zA-Z0-9]{40,100}$/;

const downloadCertificate = asyncHandler(async (req, res) => {
  const credential = await prisma.credential.findUnique({ where: { id: req.params.id } });
  if (!credential) return res.status(404).json({ error: 'Credential not found' });
  if (!credential.ipfsCID || !CID_REGEX.test(credential.ipfsCID)) {
    return res.status(404).json({ error: 'Certificate file not found' });
  }

  if (!await canAccessCredential(credential, req.user)) {
    return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
  }

  await streamIPFSFile(
    credential.ipfsCID, res, 'application/pdf',
    `Certificate_${credential.studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`
  );
});

const getIPFSFile = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  if (!cid || !CID_REGEX.test(cid)) {
    return res.status(400).json({ error: 'A valid alphanumeric IPFS CID is required' });
  }
  if (!req.user) return res.status(401).json({ error: 'Authentication required to access IPFS proxy.' });

  const credential = await prisma.credential.findFirst({
    where: {
      OR: [
        { ipfsCID: cid },
        { studentImage: { endsWith: `/${cid}` } }
      ]
    }
  });
  if (!credential) {
    return res.status(404).json({ error: 'File not found in credential records' });
  }
  if (!await canAccessCredential(credential, req.user)) {
    return res.status(403).json({ error: 'Unauthorized: This file belongs to a private profile.' });
  }

  await streamIPFSFile(cid, res);
});

module.exports = { downloadCertificate, getIPFSFile };
