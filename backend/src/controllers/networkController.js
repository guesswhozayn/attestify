const asyncHandler = require('../middleware/asyncHandler');
const Credential = require('../models/Credential');
const blockchainService = require('../services/blockchainService');

exports.getNetworkStats = asyncHandler(async (req, res) => {
  try {
    // 1. Get Real-time Blockchain Data
    const networkStats = await blockchainService.getNetworkStats();
    
    // 2. Aggregate Database Stats
    const [stats] = await Credential.aggregate([
      {
        $facet: {
            counts: [
                {
                    $group: {
                        _id: null,
                        totalIssued: { $sum: 1 },
                        totalRevoked: { 
                            $sum: { $cond: [{ $eq: ["$isRevoked", true] }, 1, 0] } 
                        },
                        totalGasUsed: {
                            $sum: {
                                $add: [
                                    { $convert: { input: "$gasUsed", to: "decimal", onError: 0, onNull: 0 } },
                                    { $convert: { input: "$revocationGasUsed", to: "decimal", onError: 0, onNull: 0 } }
                                ]
                            }
                        },
                        totalCostWei: {
                            $sum: {
                                $add: [
                                    { $convert: { input: "$totalCost", to: "decimal", onError: 0, onNull: 0 } },
                                    { $convert: { input: "$revocationTotalCost", to: "decimal", onError: 0, onNull: 0 } }
                                ]
                            }
                        }
                    }
                }
            ],
            recent: [
                { $sort: { createdAt: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        transactionHash: 1,
                        type: 1,
                        createdAt: 1,
                        isRevoked: 1,
                        revokedAt: 1,
                        studentWalletAddress: 1
                    }
                }
            ]
        }
      }
    ]);

    const counts = stats.counts[0] || { 
        totalIssued: 0, 
        totalRevoked: 0, 
        totalGasUsed: 0, 
        totalCostWei: 0 
    };

    // calculate total cost in ETH
    const totalCostEth = parseFloat(counts.totalCostWei) / 1e18;

    res.json({
      success: true,
      stats: {
        network: {
            blockHeight: networkStats.blockNumber,
            gasPrice: networkStats.gasPrice,
            connected: networkStats.connected
        },
        contract: {
            totalIssued: counts.totalIssued,
            totalRevoked: counts.totalRevoked,
            totalGasUsed: counts.totalGasUsed.toString(),
            totalCostEth: totalCostEth.toFixed(6)
        },
        recentTransactions: stats.recent
      }
    });

  } catch (error) {
    console.error('Get network stats error:', error);
    if (error.stack) console.error(error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network stats'
    });
  }
});
