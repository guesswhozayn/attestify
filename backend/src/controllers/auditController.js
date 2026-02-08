const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, startDate, endDate } = req.query;

    const query = {};
    
    if (action) {
      // Support filtering by multiple actions
      if (Array.isArray(action)) {
        query.action = { $in: action };
      } else {
        query.action = action;
      }
    }
    if (startDate || endDate) {
      query.createdAt = {};
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

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuditLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const logs = await AuditLog.find({ performedBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year', 'all'
    const Credential = require('../models/Credential');

    // Calculate start date based on period
    const now = new Date();
    const startDate = new Date();
    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
    else if (period === 'all') startDate.setFullYear(2000); // Beginning of time

    // Get Total Certificates Issued in Period
    const issuedCount = await Credential.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get Total Revocations in Period
    const revokedCount = await Credential.countDocuments({
      revokedAt: { $gte: startDate },
      isRevoked: true
    });

    // Aggregate issuance gas costs (only for existing costs)
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

    // Aggregate revocation gas costs
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

    // Format results
    const issuance = issuanceStats[0] || { totalGasUsed: 0, totalCost: 0 };
    const revocation = revocationStats[0] || { totalGasUsed: 0, totalCost: 0 };

    const totalGasUsed = (parseFloat(issuance.totalGasUsed) + parseFloat(revocation.totalGasUsed)).toString();
    const totalCostWei = (parseFloat(issuance.totalCost) + parseFloat(revocation.totalCost));
    const totalCostEth = totalCostWei / 1e18; // Convert Wei to ETH

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

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
