const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, authController.changePassword);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.post('/branding', protect, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'seal', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), userController.updateBranding);
router.delete('/branding/:type', protect, userController.deleteBranding);

module.exports = router;
