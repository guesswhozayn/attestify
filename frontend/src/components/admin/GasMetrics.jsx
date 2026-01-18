import React from 'react';
import { Activity, TrendingUp, DollarSign, Zap } from 'lucide-react';

const GasMetrics = ({ totalGasUsed, averageGasPrice, totalCost, transactionCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-2">Total Gas Used</h3>
        <p className="text-2xl font-bold text-white">{totalGasUsed.toLocaleString()}</p>
        <p className="text-green-400 text-sm mt-2">+12% from last month</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-2">Avg Gas Price</h3>
        <p className="text-2xl font-bold text-white">{averageGasPrice} Gwei</p>
        <p className="text-red-400 text-sm mt-2">-5% from last week</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-2">Total Cost</h3>
        <p className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</p>
        <p className="text-gray-400 text-sm mt-2">ETH equivalent</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-2">Transactions</h3>
        <p className="text-2xl font-bold text-white">{transactionCount}</p>
        <p className="text-green-400 text-sm mt-2">This month</p>
      </div>
    </div>
  );
};

export default GasMetrics;
