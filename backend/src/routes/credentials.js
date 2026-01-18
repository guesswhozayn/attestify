const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/issue', authenticate, requireAdmin, upload.single('certificate'), 
  credentialController.issueCredential);

router.get('/', authenticate, requireAdmin, credentialController.getCredentials);

router.get('/stats', authenticate, requireAdmin, credentialController.getStats);

router.get('/:id', authenticate, credentialController.getCredentialById);

router.get('/student/:studentId', authenticate, 
  credentialController.getCredentialByStudentId);

router.post('/:id/revoke', authenticate, requireAdmin, 
  credentialController.revokeCredential);

module.exports = router;
