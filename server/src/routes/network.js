const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, networkController.getNetworkStats);

module.exports = router;
