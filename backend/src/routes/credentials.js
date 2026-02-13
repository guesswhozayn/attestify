const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/issue', authenticate, requireAdmin, upload.fields([
  { name: 'studentImage', maxCount: 1 }
]), credentialController.issueCredential);

router.post('/batch-issue', authenticate, requireAdmin, upload.fields([
  { name: 'file', maxCount: 1 }
]), credentialController.batchIssueCredentials);

router.get('/', authenticate, credentialController.getCredentials);

router.get('/stats', authenticate, credentialController.getStats);

router.get('/verify/:id', credentialController.verifyCredential);

router.get('/:id', authenticate, credentialController.getCredentialById);

router.get('/student/:walletAddress', authenticate, 
  credentialController.getCredentialsByStudentWallet);

router.post('/:id/revoke', authenticate, requireAdmin, 
  credentialController.revokeCredential);

module.exports = router;
