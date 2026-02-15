const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Allow authorized users (admin/issuers) to view network stats
// You might want to allow students too, depending on requirements.
// For now, keeping it consistent with previous dashboard access.
router.get('/stats', authenticate, networkController.getNetworkStats);

module.exports = router;
