const Credential = require('../models/Credential');
const ipfsService = require('../services/ipfsService');
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

exports.downloadCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id);

  if (!credential) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  if (!credential.ipfsCID) {
    return res.status(404).json({ error: 'Certificate file not found' });
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

exports.getIPFSFile = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
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
