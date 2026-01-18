import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { Zap, DollarSign, FileText, Activity } from 'lucide-react';
import { auditAPI } from '../services/api';


const AuditLogs = () => {
  const [stats, setStats] = useState(null);

  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      const statsResponse = await auditAPI.getDashboardStats({ period });
      
      setStats(statsResponse.data.stats);

    } catch (error) {
      console.error('Failed to fetch audit data', error);
    }
  };



  return (
    <div className="min-h-screen pb-10">
      <Header title="Audit Log Dashboard" showSearch={false} />

      <div className="px-8 pt-8 pb-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gas & Activity Details</h2>
            <p className="text-gray-400">Monitor blockchain costs and system events</p>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  period === p 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-green-500/50 transition">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Zap className="w-24 h-24 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-gray-400 font-medium">Total Gas Used</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.totalGasUsed ? parseInt(stats.totalGasUsed).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-gray-500">Units of gas</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-purple-500/50 transition">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <DollarSign className="w-24 h-24 text-purple-400" />
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-gray-400 font-medium">Total Cost (ETH)</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.totalCostEth || '0.000000'}
            </div>
            <div className="text-sm text-gray-500">
              ≈ {stats ? (stats.totalCostEth * 2500).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-blue-500/50 transition">
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <FileText className="w-24 h-24 text-blue-400" />
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-gray-400 font-medium">Certificates Issued</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.totalCertificates || '0'}
            </div>
            <div className="text-sm text-gray-500">In selected period</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-red-500/50 transition">
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Activity className="w-24 h-24 text-red-400" />
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-gray-400 font-medium">Revocations</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.totalRevocations || '0'}
            </div>
            <div className="text-sm text-gray-500">In selected period</div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AuditLogs;
