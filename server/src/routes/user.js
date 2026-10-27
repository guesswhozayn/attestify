const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, authController.getCurrentUser);
router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, authController.changePassword);

module.exports = router;
