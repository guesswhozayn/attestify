const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, startDate, endDate, search } = req.query;

  const query = {};
  
  if (search) {
    query['details.studentWalletAddress'] = { $regex: search, $options: 'i' };
  }

  if (action) {
    if (Array.isArray(action)) {
      query.action = { $in: action };
    } else {
      query.action = action;
    }
  }
  if (startDate || endDate) {
    if (!query.createdAt) query.createdAt = {};
    
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .populate('performedBy', 'name email')
    .populate('targetCredential', 'registrationNumber studentName')
    .populate('targetUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await AuditLog.countDocuments(query);

  res.json({
    success: true,
    logs,
    pagination: {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    }
  });
});

exports.getAuditLogsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const logs = await AuditLog.find({ performedBy: userId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  res.json({ success: true, logs });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const Credential = require('../models/Credential');

  const now = new Date();
  const startDate = new Date();
  if (period === 'week') startDate.setDate(now.getDate() - 7);
  else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
  else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
  else if (period === 'all') startDate.setFullYear(2000);

  const issuedCount = await Credential.countDocuments({
    createdAt: { $gte: startDate }
  });

  const revokedCount = await Credential.countDocuments({
    revokedAt: { $gte: startDate },
    isRevoked: true
  });

  const issuanceStats = await Credential.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        totalCost: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        totalGasUsed: { $sum: { $toDecimal: "$gasUsed" } },
        totalCost: { $sum: { $toDecimal: "$totalCost" } }
      }
    }
  ]);

  const revocationStats = await Credential.aggregate([
    {
      $match: {
        revokedAt: { $gte: startDate },
        revocationTotalCost: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        totalGasUsed: { $sum: { $toDecimal: "$revocationGasUsed" } },
        totalCost: { $sum: { $toDecimal: "$revocationTotalCost" } }
      }
    }
  ]);

  const issuance = issuanceStats[0] || { totalGasUsed: 0, totalCost: 0 };
  const revocation = revocationStats[0] || { totalGasUsed: 0, totalCost: 0 };

  const totalGasUsed = (parseFloat(issuance.totalGasUsed) + parseFloat(revocation.totalGasUsed)).toString();
  const totalCostWei = (parseFloat(issuance.totalCost) + parseFloat(revocation.totalCost));
  const totalCostEth = totalCostWei / 1e18;

  res.json({
    success: true,
    stats: {
      totalCertificates: issuedCount,
      totalRevocations: revokedCount,
      totalGasUsed,
      totalCostEth: totalCostEth.toFixed(6),
      totalCostWei: totalCostWei.toString()
    }
  });
});
