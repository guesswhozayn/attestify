const express = require('express');
const router = express.Router();
const { downloadCertificate, getIPFSFile } = require('../controllers/fileController');
const { protect, authenticate } = require('../middleware/auth');

// Public route for downloading certificate (verification usually public, but let's keep it open for now or protect if needed)
// Usually certificates are public? Verify page creates QR code to public verification url.
// Let's keep it public for now as verification is public.
router.get('/certificate/:id', authenticate, downloadCertificate);
router.get('/ipfs/:cid', authenticate, getIPFSFile);

module.exports = router;
