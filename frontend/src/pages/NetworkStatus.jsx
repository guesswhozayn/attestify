import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Box,
  Server,
  Database,
  Shield,
  Clock,
  Zap,
  Cpu,
  RefreshCw,
  Hash,
  CheckCircle,
  XCircle,
  Link as LinkIcon
} from 'lucide-react';
import { networkAPI } from '../services/api';
import StatCard from '../components/shared/StatCard';

const NetworkStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh interval (e.g., every 15 seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      if (!data) setLoading(true);
      else setRefreshing(true);
      
      const response = await networkAPI.getStats();
      if (response.data.success) {
        setData(response.data.stats);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch network stats:', err);
      // Only set error if we don't have data yet
      if (!data) setError('Failed to load network status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400">
        <Activity className="w-12 h-12 mb-4" />
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { network, contract, recentTransactions } = data || {
    network: {},
    contract: {},
    recentTransactions: []
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 pb-20 relative">
       {/* Background Effects - similar to Dashboard */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/[0.1] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/[0.05] rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-white/[0.08] p-8 md:p-10 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">System Status</h1>
                   </div>
                   <p className="text-gray-400 max-w-2xl text-lg">
                      Real-time metrics from the Sepolia Testnet. Monitor gas prices, block height, and contract interactions.
                   </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${network.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border backdrop-blur-md`}>
                        <span className="relative flex h-2 w-2">
                           {network.connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                           <span className={`relative inline-flex rounded-full h-2 w-2 ${network.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        <span className="font-medium text-sm">{network.connected ? 'Systems Operational' : 'Network Disconnected'}</span>
                    </div>

                    <button 
                      onClick={fetchData} 
                      disabled={refreshing}
                      className={`p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : 'hover:scale-105 active:scale-95'}`}
                      title="Refresh Data"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Network Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Current Block" 
              value={network.blockHeight?.toLocaleString() || '-'} 
              icon={Box}
              gradient="from-blue-500/10 to-indigo-500/5"
              iconBg="bg-blue-500/20"
              subtext="Sepolia Testnet"
              delay={0.1}
            />
            <StatCard 
              label="Gas Price" 
              value={`${parseFloat(network.gasPrice || 0).toFixed(2)} Gwei`} 
              icon={Zap}
              gradient="from-amber-500/10 to-orange-500/5"
              iconBg="bg-amber-500/20"
              subtext="Network Cost"
              delay={0.2}
            />
            <StatCard 
              label="Total Issued" 
              value={contract.totalIssued?.toLocaleString() || '0'} 
              icon={Shield}
              gradient="from-emerald-500/10 to-teal-500/5"
              iconBg="bg-emerald-500/20"
              subtext="Active Certificates"
              delay={0.3}
            />
            <StatCard 
              label="Total Revoked" 
              value={contract.totalRevoked?.toLocaleString() || '0'} 
              icon={XCircle}
              gradient="from-red-500/10 to-pink-500/5"
              iconBg="bg-red-500/20"
              subtext="Invalidated"
              delay={0.4}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-gray-900/40 border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Recent Network Activity</h3>
                </div>
              </div>
              
              <div className="space-y-2 p-4">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
                    
                    {/* Left: Icon & Type */}
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${tx.isRevoked ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            {tx.isRevoked ? <XCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                    {tx.isRevoked ? 'Credential Revoked' : 'Credential Issued'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                                    {new Date(tx.revokedAt || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 font-mono">
                                <Hash className="w-3.5 h-3.5" />
                                <span>{tx.transactionHash ? `${tx.transactionHash.substring(0, 10)}...${tx.transactionHash.substring(tx.transactionHash.length - 8)}` : 'Pending...'}</span>
                                {tx.transactionHash && (
                                    <a 
                                        href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md text-indigo-400"
                                        title="View on Etherscan"
                                    >
                                        <LinkIcon className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Wallet & Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                        <div className="text-right hidden sm:block">
                             <div className="text-xs text-gray-500 mb-1">Student Wallet</div>
                             <div className="font-mono text-sm text-gray-300">
                                {tx.studentWalletAddress ? `${tx.studentWalletAddress.substring(0, 6)}...${tx.studentWalletAddress.substring(tx.studentWalletAddress.length - 4)}` : '-'}
                             </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${tx.transactionHash ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'}`}>
                            {tx.transactionHash ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            <span className="text-sm font-medium">{tx.transactionHash ? 'Confirmed' : 'Pending'}</span>
                        </div>
                    </div>
                  </div>
                ))}
                
                {recentTransactions.length === 0 && (
                     <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Activity className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No Recent Activity</h3>
                        <p className="text-gray-500">Blockchain transactions will appear here.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Contract Usage Stats */}
            <div className="col-span-1 bg-gradient-to-br from-indigo-900/40 to-black/40 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl flex flex-col h-fit">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <Cpu className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Contract Usage</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                        Total Gas Used
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-300">Lifetime</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white tracking-tight">
                      {parseInt(contract.totalGasUsed || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-sm text-gray-400 mb-2">Total Cost (ETH)</div>
                    <div className="text-3xl font-mono font-bold text-indigo-300 tracking-tight">
                      {contract.totalCostEth || '0.00'} <span className="text-lg text-indigo-400/50">ETH</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-start gap-3">
                          <Server className="w-5 h-5 text-indigo-400 mt-0.5" />
                          <div>
                              <div className="text-sm font-medium text-white mb-1">Sepolia Node</div>
                              <div className="text-xs text-indigo-300/70 leading-relaxed">
                                  Connected via Infura RPC. Monitoring real-time events and state changes.
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default NetworkStatus;