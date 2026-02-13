const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public student search by wallet address
router.get('/student/:walletAddress', userController.getPublicStudentProfile);

// Public institute search
router.get('/institutes/search', userController.searchInstitutes);

// Public institute profile by ID
router.get('/institute/:id', userController.getPublicInstituteProfile);

module.exports = router;
