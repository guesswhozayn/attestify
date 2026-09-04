const express = require('express');
const router = express.Router();
const { downloadCertificate, getIPFSFile } = require('../controllers/fileController');
const { protect, authenticate } = require('../middleware/auth');

router.get('/certificate/:id', authenticate, downloadCertificate);
router.get('/ipfs/:cid', authenticate, getIPFSFile);

module.exports = router;
