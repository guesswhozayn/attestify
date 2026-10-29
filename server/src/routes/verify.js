const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');
const upload = require('../middleware/upload');
const { optionalAuthenticate } = require('../middleware/auth');

router.post('/certificate', optionalAuthenticate, upload.single('certificate'),
  verifyController.verifyWithFile);

router.get('/:walletAddress', optionalAuthenticate, verifyController.checkExists);

router.post('/hash', optionalAuthenticate, verifyController.verifyByHash);

module.exports = router;
