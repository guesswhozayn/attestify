const asyncHandler = require('../middleware/asyncHandler');
const { prisma } = require('../config/database');
const blockchainService = require('../services/blockchainService');

const getNetworkStats = asyncHandler(async (req, res) => {
  try {
    const [networkStats, totalIssued, totalRevoked, gasRecords, recent] = await Promise.all([
      blockchainService.getNetworkStats(),
      prisma.credential.count(),
      prisma.credential.count({ where: { isRevoked: true } }),
      prisma.credential.findMany({
        select: { gasUsed: true, revocationGasUsed: true, totalCost: true, revocationTotalCost: true }
      }),
      prisma.credential.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { transactionHash: true, type: true, createdAt: true, isRevoked: true, revokedAt: true }
      })
    ]);

    let totalGasUsed = 0n;
    let totalCostWei = 0n;
    for (const r of gasRecords) {
      if (r.gasUsed && !isNaN(Number(r.gasUsed))) totalGasUsed += BigInt(Math.trunc(Number(r.gasUsed)));
      if (r.revocationGasUsed && !isNaN(Number(r.revocationGasUsed))) totalGasUsed += BigInt(Math.trunc(Number(r.revocationGasUsed)));
      if (r.totalCost && !isNaN(Number(r.totalCost))) totalCostWei += BigInt(Math.trunc(Number(r.totalCost)));
      if (r.revocationTotalCost && !isNaN(Number(r.revocationTotalCost))) totalCostWei += BigInt(Math.trunc(Number(r.revocationTotalCost)));
    }

    res.json({
      success: true,
      stats: {
        network: {
          blockHeight: networkStats.blockNumber,
          gasPrice: networkStats.gasPrice,
          connected: networkStats.connected
        },
        contract: {
          totalIssued,
          totalRevoked,
          totalGasUsed: totalGasUsed.toString(),
          totalCostEth: (Number(totalCostWei) / 1e18).toFixed(6)
        },
        recentTransactions: recent
      }
    });
  } catch (error) {
    console.error('Get network stats error:', error);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch network stats' });
  }
});

module.exports = { getNetworkStats };
