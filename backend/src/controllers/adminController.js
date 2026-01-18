const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { AUDIT_ACTIONS } = require('../config/constants');

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, university, title, walletAddress } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const admin = new User({
      name,
      email,
      password: tempPassword,
      university,
      title,
      walletAddress,
      role: 'admin',
      createdBy: req.user._id
    });

    await admin.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.ADMIN_CREATED,
      performedBy: req.user._id,
      targetUser: admin._id,
      ipAddress: req.ip,
      details: { email, name }
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        university: admin.university,
        role: admin.role
      },
      tempPassword
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (admin.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      action: AUDIT_ACTIONS.ADMIN_DELETED,
      performedBy: req.user._id,
      targetUser: id,
      ipAddress: req.ip,
      details: { email: admin.email, name: admin.name }
    });

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
