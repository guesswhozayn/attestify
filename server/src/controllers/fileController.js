const axios = require('axios');
const Credential = require('../models/Credential');
const User = require('../models/User');
const ipfsService = require('../services/ipfsService');
const asyncHandler = require('../middleware/asyncHandler');

const streamIPFSFile = async (cid, res, defaultContentType, filename) => {
  const ipfsUrl = ipfsService.getIPFSUrl(cid);
  try {
    const response = await axios({ method: 'get', url: ipfsUrl, responseType: 'stream' });
    res.setHeader('Content-Type', defaultContentType || response.headers['content-type'] || 'application/octet-stream');
    if (filename) res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.data.pipe(res);
  } catch (error) {
    console.error('IPFS stream error:', error.message);
    res.status(502).json({ error: 'Failed to retrieve file from IPFS' });
  }
};

const downloadCertificate = asyncHandler(async (req, res) => {
  const credential = await Credential.findById(req.params.id);
  if (!credential) return res.status(404).json({ error: 'Credential not found' });
  if (!credential.ipfsCID) return res.status(404).json({ error: 'Certificate file not found' });

  const isOwner = req.user?.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user?.role === 'ISSUER' && req.user._id.toString() === credential.issuedBy.toString();

  if (!isOwner && !isIssuer) {
    const student = await User.findOne({ walletAddress: credential.studentWalletAddress });
    if (student?.preferences?.visibility === false) {
      return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
    }
  }

  await streamIPFSFile(
    credential.ipfsCID, res, 'application/pdf',
    `Certificate_${credential.studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`
  );
});

const getIPFSFile = asyncHandler(async (req, res) => {
  if (!req.params.cid) return res.status(400).json({ error: 'CID is required' });
  if (!req.user) return res.status(401).json({ error: 'Authentication required to access IPFS proxy.' });
  await streamIPFSFile(req.params.cid, res);
});

module.exports = { downloadCertificate, getIPFSFile };
