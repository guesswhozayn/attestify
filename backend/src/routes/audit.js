const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/logs', authenticate, requireAdmin, 
  auditController.getAuditLogs);

router.get('/dashboard-stats', authenticate, requireAdmin, 
  auditController.getDashboardStats);

router.get('/user/:userId', authenticate, requireAdmin, 
  auditController.getAuditLogsByUser);

module.exports = router;
module.exports = router;
