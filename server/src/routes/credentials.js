const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { requireVerifiedIssuer } = require('../middleware/roleCheck');
const { validate, validateIssue } = require('../middleware/validator');
const upload = require('../middleware/upload');

router.post('/issue', authenticate, requireVerifiedIssuer, upload.none(), validate(validateIssue), credentialController.issueCredential);

router.post('/batch-issue', authenticate, requireVerifiedIssuer, upload.fields([
  { name: 'file', maxCount: 1 }
]), credentialController.batchIssueCredentials);

router.get('/', authenticate, credentialController.getCredentials);

router.get('/stats', authenticate, credentialController.getStats);

router.get('/status/:id', authenticate, credentialController.getCredentialStatus);

router.get('/verify/:id', optionalAuthenticate, credentialController.verifyCredential);

router.get('/:id', authenticate, credentialController.getCredentialById);

router.get('/student/:walletAddress', authenticate,
  credentialController.getCredentialsByStudentWallet);

router.post('/:id/revoke', authenticate, requireVerifiedIssuer,
  credentialController.revokeCredential);

module.exports = router;
