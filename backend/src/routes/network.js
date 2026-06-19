const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/stats', authenticate, networkController.getNetworkStats);

module.exports = router;
