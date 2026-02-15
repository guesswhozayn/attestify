const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public student search by wallet address
router.get('/student/:walletAddress', userController.getPublicStudentProfile);

// Public issuer search
router.get('/issuers/search', userController.searchIssuers);

// Public issuer profile by ID
router.get('/issuer/:id', userController.getPublicIssuerProfile);

// Public issuer profile by Wallet
router.get('/issuer/wallet/:walletAddress', userController.getPublicIssuerProfileByWallet);

module.exports = router;
