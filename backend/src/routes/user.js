const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Using 'protect' middleware consistent with other routes (auth.js uses protect, verify.js uses protect)
// Correcting previous import which might have been 'authenticate'

router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, authController.changePassword); // Assuming this stays or moves to userController later
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.post('/branding', protect, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'seal', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), userController.updateBranding);
router.delete('/branding/:type', protect, userController.deleteBranding);

module.exports = router;
