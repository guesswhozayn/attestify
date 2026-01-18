const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/roleCheck');

router.post('/create', authenticate, requireSuperAdmin, 
  adminController.createAdmin);

router.get('/list', authenticate, requireSuperAdmin, 
  adminController.getAllAdmins);

router.delete('/:id', authenticate, requireSuperAdmin, 
  adminController.deleteAdmin);

module.exports = router;
