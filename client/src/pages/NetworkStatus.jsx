import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Box,
  Server,
  Shield,
  Clock,
  Zap,
  Cpu,
  XCircle,
  Hash,
  CheckCircle,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { networkAPI } from '../services/api';
import Button from '../components/shared/Button';
import StatCard from '../components/shared/StatCard';

const NetworkStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasData = useRef(false);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await networkAPI.getStats();
      if (response.data.success) {
        setData(response.data.stats);
        setError(null);
        hasData.current = true;
      }
    } catch (err) {
      console.error('Failed to fetch network stats:', err);
      if (!hasData.current) setError('Failed to load network status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    networkAPI.getStats()
      .then(response => {
        if (!active) return;
        if (response.data.success) {
          setData(response.data.stats);
          setError(null);
          hasData.current = true;
        }
      })
      .catch(err => {
        console.error('Failed to fetch network stats:', err);
        if (active && !hasData.current) setError('Failed to load network status');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

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
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const { network, contract, recentTransactions } = data || {
    network: {},
    contract: {},
    recentTransactions: []
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 pb-20 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">

        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#E8E4DC] p-8 md:p-10 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-stone-800">
                            <Activity className="w-5 h-5 text-stone-700" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">System status</h1>
                   </div>
                   <p className="text-stone-500 max-w-2xl text-base leading-relaxed">
                      Live network metrics from Sepolia testnet. Monitor network gas and credential transactions.
                   </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${network.connected ? 'bg-[#EDF5EE] text-[#25562C] border-[#CFE6D3]' : 'bg-[#FDF0EE] text-[#9E2D2D] border-[#F7D4CF]'} border`}>
                        <span className="relative flex h-2 w-2">
                           {network.connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                           <span className={`relative inline-flex rounded-full h-2 w-2 ${network.connected ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                        </span>
                        <span className="font-semibold text-xs">{network.connected ? 'Systems operational' : 'Network disconnected'}</span>
                    </div>

                    <Button
                      onClick={handleRefresh}
                      loading={refreshing}
                      rounded="xl"
                      title="Refresh status"
                      icon={RefreshCw}
                      variant="outline"
                      className="aspect-square !p-0 flex items-center justify-center w-10 h-10 bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Current block"
              value={network.blockHeight?.toLocaleString() || '-'}
              icon={Box}
              gradient="from-stone-500/10 to-transparent"
              iconBg="bg-stone-100"
              subtext="Sepolia testnet"
              delay={0.1}
            />
            <StatCard
              label="Gas fee"
              value={`${parseFloat(network.gasPrice || 0).toFixed(2)} Gwei`}
              icon={Zap}
              gradient="from-amber-500/10 to-transparent"
              iconBg="bg-amber-100"
              subtext="Network cost"
              delay={0.2}
            />
            <StatCard
              label="Total issued"
              value={contract.totalIssued?.toLocaleString() || '0'}
              icon={Shield}
              gradient="from-emerald-500/10 to-transparent"
              iconBg="bg-emerald-100"
              subtext="Active certificates"
              delay={0.3}
            />
            <StatCard
              label="Total revoked"
              value={contract.totalRevoked?.toLocaleString() || '0'}
              icon={XCircle}
              gradient="from-rose-500/10 to-transparent"
              iconBg="bg-rose-100"
              subtext="Revoked credentials"
              delay={0.4}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 bg-white border border-[#E8E4DC] rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)]">
              <div className="p-6 border-b border-[#E8E4DC] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">Recent network activity</h3>
                </div>
              </div>

              <div className="space-y-2.5 p-5">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E8E4DC] transition-all">

                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl border ${tx.isRevoked ? 'bg-[#FDF0EE] border-[#F7D4CF] text-[#9E2D2D]' : 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]'}`}>
                            {tx.isRevoked ? <XCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900 text-sm">
                                    {tx.isRevoked ? 'Credential revoked' : 'Credential issued'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white text-stone-500 border border-stone-200">
                                    {new Date(tx.revokedAt || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500 font-mono">
                                <Hash className="w-3.5 h-3.5 text-stone-400" />
                                <span>{tx.transactionHash ? `${tx.transactionHash.substring(0, 10)}...${tx.transactionHash.substring(tx.transactionHash.length - 8)}` : 'Pending...'}</span>
                                {tx.transactionHash && (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-stone-200 rounded-md text-stone-700"
                                        title="View on Etherscan"
                                    >
                                        <LinkIcon className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                        <div className="text-right hidden sm:block">
                             <div className="text-[11px] text-stone-400 mb-0.5 font-medium">Type</div>
                             <div className="font-mono text-xs font-semibold text-stone-700">
                                {tx.type || '-'}
                             </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tx.transactionHash ? 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]' : 'bg-[#FEF7EA] border-[#F5E6CA] text-[#8A580C]'}`}>
                            {tx.transactionHash ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>{tx.transactionHash ? 'Confirmed' : 'Pending'}</span>
                        </div>
                    </div>
                  </div>
                ))}

                {recentTransactions.length === 0 && (
                     <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-3 mx-auto text-stone-400">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mb-1">No recent activity</h3>
                        <p className="text-stone-500 text-sm">Network activity will appear here.</p>
                    </div>
                )}
              </div>
            </div>

            <div className="col-span-1 bg-white border border-[#E8E4DC] rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)] flex flex-col h-fit">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">Network usage</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-xs text-stone-500 mb-1.5 flex items-center gap-2">
                        Total gas used
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-semibold">Lifetime</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
                      {parseInt(contract.totalGasUsed || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-xs text-stone-500 mb-1.5">Total cost (ETH)</div>
                    <div className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
                      {contract.totalCostEth || '0.00'} <span className="text-sm font-normal text-stone-400">ETH</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#EDF5EE] border border-[#CFE6D3]">
                      <div className="flex items-start gap-3">
                          <Server className="w-5 h-5 text-[#25562C] mt-0.5 shrink-0" />
                          <div>
                              <div className="text-sm font-bold text-[#25562C] mb-1">Sepolia node</div>
                              <div className="text-xs text-[#25562C]/80 leading-relaxed font-normal">
                                  Connected to Ethereum Sepolia. Monitoring live transactions.
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
