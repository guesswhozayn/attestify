const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public student search by wallet address
router.get('/student/:walletAddress', userController.getPublicStudentProfile);

module.exports = router;
