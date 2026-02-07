const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.post('/create', authenticate, requireAdmin, 
  adminController.createAdmin);

router.get('/list', authenticate, requireAdmin, 
  adminController.getAllAdmins);

router.delete('/:id', authenticate, requireAdmin, 
  adminController.deleteAdmin);

module.exports = router;
