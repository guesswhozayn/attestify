const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePlatformAdmin } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

router.use(authenticate, requirePlatformAdmin);

router.get('/stats', adminController.getStats);
router.get('/issuers', adminController.getIssuers);
router.get('/issuers/:id', adminController.getIssuerById);
router.post('/issuers/:id/approve', adminController.approveIssuer);
router.post('/issuers/:id/reject', adminController.rejectIssuer);
router.post('/issuers/:id/suspend', adminController.suspendIssuer);
router.post('/issuers/:id/reactivate', adminController.reactivateIssuer);
router.post('/issuers/:id/sync-blockchain', adminController.syncBlockchainAuth);

module.exports = router;

