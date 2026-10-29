const express = require('express');
const router = express.Router();
const { downloadCertificate, getIPFSFile } = require('../controllers/fileController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

router.get('/certificate/:id', optionalAuthenticate, downloadCertificate);
router.get('/ipfs/:cid', authenticate, getIPFSFile);

module.exports = router;
