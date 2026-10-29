const asyncHandler = require('../middleware/asyncHandler');
const { ethers } = require('ethers');
const { prisma } = require('../config/database');
const blockchainService = require('../services/blockchainService');

const getNetworkStats = asyncHandler(async (req, res) => {
  try {
    const [networkStats, totalIssued, totalRevoked, [gasAgg], recent] = await Promise.all([
      blockchainService.getNetworkStats(),
      prisma.credential.count({ where: { status: 'COMPLETED' } }),
      prisma.credential.count({ where: { isRevoked: true } }),
      prisma.$queryRaw`
        SELECT 
          COALESCE(SUM(NULLIF(regexp_replace("gasUsed", '[^0-9]', '', 'g'), '')::numeric), 0) +
          COALESCE(SUM(NULLIF(regexp_replace("revocationGasUsed", '[^0-9]', '', 'g'), '')::numeric), 0) AS total_gas_used,
          COALESCE(SUM(NULLIF(regexp_replace("totalCost", '[^0-9]', '', 'g'), '')::numeric), 0) +
          COALESCE(SUM(NULLIF(regexp_replace("revocationTotalCost", '[^0-9]', '', 'g'), '')::numeric), 0) AS total_cost_wei
        FROM credentials
      `,
      prisma.credential.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { transactionHash: true, type: true, createdAt: true, isRevoked: true, revokedAt: true }
      })
    ]);

    const totalGasUsed = BigInt(gasAgg?.total_gas_used ? String(gasAgg.total_gas_used).split('.')[0] : '0');
    const totalCostWei = BigInt(gasAgg?.total_cost_wei ? String(gasAgg.total_cost_wei).split('.')[0] : '0');

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
          totalCostEth: parseFloat(ethers.formatEther(totalCostWei)).toFixed(6)
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
