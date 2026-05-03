const Credential = require('../models/Credential');
const ipfsService = require('../services/ipfsService');
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

const downloadCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id);

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  if (!credential.ipfsCID) {
    return res.status(404).json({ error: 'Certificate file not found' });
  }

  // Security Check: Access control
  const isOwner = req.user && req.user.walletAddress?.toLowerCase() === credential.studentWalletAddress.toLowerCase();
  const isIssuer = req.user && req.user.role === 'ISSUER' && req.user._id.toString() === credential.issuedBy.toString();
  
  // If not owner/issuer, check if profile is public
  if (!isOwner && !isIssuer) {
      const User = require('../models/User');
      const student = await User.findOne({ walletAddress: credential.studentWalletAddress });
      if (student?.preferences?.visibility === false) {
          return res.status(403).json({ error: 'Unauthorized: This credential belongs to a private profile.' });
      }
  }

  const ipfsUrl = ipfsService.getIPFSUrl(credential.ipfsCID);
  
  try {
    const response = await axios({
      method: 'get',
      url: ipfsUrl,
      responseType: 'stream'
    });

    const filename = `Certificate_${credential.studentName.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error('IPFS download error:', error.message);
    res.status(502).json({ error: 'Failed to retrieve file from IPFS' });
  }
});

const getIPFSFile = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
  }

  // Security Check: Only allow authenticated users to proxy IPFS
  if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to access IPFS proxy.' });
  }

  const ipfsUrl = ipfsService.getIPFSUrl(cid);

  try {
    const response = await axios({
      method: 'get',
      url: ipfsUrl,
      responseType: 'stream'
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    response.data.pipe(res);
  } catch (error) {
    console.error('IPFS fetch error:', error.message);
    res.status(502).json({ error: 'Failed to retrieve file from IPFS' });
  }
});

module.exports = {
  downloadCertificate,
  getIPFSFile
};
