const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);
// router.get('/notifications', authenticate, authController.getNotifications); // TODO: Implement notifications

module.exports = router;
