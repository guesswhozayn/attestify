const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');
const upload = require('../middleware/upload');

router.post('/certificate', upload.single('certificate'), 
  verifyController.verifyWithFile);

router.get('/:studentId', verifyController.checkExists);

router.post('/hash', verifyController.verifyByHash);

module.exports = router;
