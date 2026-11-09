const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/stats', authenticate, requireRole('ISSUER'), networkController.getNetworkStats);

module.exports = router;
