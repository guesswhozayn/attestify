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
import LoadingSpinner from '../components/shared/LoadingSpinner';

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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to Ethereum node..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-stone-700">
        <Activity className="w-10 h-10 mb-3 text-rose-500" />
        <p className="text-sm font-semibold">{error}</p>
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          className="mt-4 rounded-xl border border-stone-200 bg-white"
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
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 pb-20 relative">
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Network Status
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Live status, confirmations, and gas fees on Ethereum Sepolia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span className="relative flex h-2 w-2">
                {network.connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${network.connected ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
              </span>
              <span>{network.connected ? 'Systems operational' : 'Node offline'}</span>
            </div>

            <Button
              onClick={handleRefresh}
              loading={refreshing}
              rounded="xl"
              title="Refresh status"
              icon={RefreshCw}
              variant="outline"
              className="p-2 flex items-center justify-center bg-white hover:bg-stone-50 text-stone-700 border-[#EAECF0] rounded-xl shadow-2xs cursor-pointer"
            />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Current Block"
            value={network.blockHeight ? `#${network.blockHeight.toLocaleString()}` : '#10482'}
            icon={Box}
            subtext="Sepolia"
            delay={0.05}
          />
          <StatCard
            label="Gas Price"
            value={`${parseFloat(network.gasPrice || 0).toFixed(2)} Gwei`}
            icon={Zap}
            subtext="Network Fee"
            delay={0.1}
          />
          <StatCard
            label="Total Issued"
            value={contract.totalIssued || 0}
            icon={Shield}
            subtext="On-Chain"
            delay={0.15}
          />
          <StatCard
            label="Total Revoked"
            value={contract.totalRevoked || 0}
            icon={XCircle}
            subtext="Ledger"
            delay={0.2}
          />
        </div>

        {/* Middle Activity & Usage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left: Recent Activity (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-[#EAECF0] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between">
            <div className="p-6 border-b border-[#F2F4F7] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">Recent Network Activity</h3>
              </div>
              <span className="text-xs text-stone-400 font-medium">Auto-synced</span>
            </div>

            <div className="divide-y divide-[#F2F4F7] p-2">
              {recentTransactions.map((tx, idx) => (
                <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl hover:bg-stone-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.isRevoked ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-[#EDF5EE] text-[#25562C] border border-[#CFE6D3]'}`}>
                      {tx.isRevoked ? <XCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">
                          {tx.isRevoked ? 'Credential Revoked' : 'Credential Issued'}
                        </span>
                        <span className="text-[11px] text-stone-400 font-normal">
                          {new Date(tx.revokedAt || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-400 font-mono">
                        <Hash className="w-3 h-3 text-stone-400" />
                        <span>{tx.transactionHash ? `${tx.transactionHash.substring(0, 10)}...${tx.transactionHash.substring(tx.transactionHash.length - 8)}` : 'Confirmed'}</span>
                        {tx.transactionHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-stone-200 rounded text-stone-700"
                            title="View on Etherscan"
                          >
                            <LinkIcon className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-stone-400 font-medium">Type</div>
                      <div className="font-mono text-xs font-semibold text-stone-700">
                        {tx.type || 'CERTIFICATION'}
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 text-xs font-medium ${tx.transactionHash ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {tx.transactionHash ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{tx.transactionHash ? 'Confirmed' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              ))}

              {recentTransactions.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-2 mx-auto text-stone-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mb-0.5">No recent activity</h4>
                  <p className="text-stone-400 text-[11px]">Real-time block transactions will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Usage & Gas metrics (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Contract execution</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-stone-200/80">
                <div className="text-xs text-stone-500 mb-1 flex items-center justify-between">
                  <span>Total gas used</span>
                  <span className="text-xs text-stone-400">Lifetime</span>
                </div>
                <div className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
                  {parseInt(contract.totalGasUsed || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-stone-200/80">
                <div className="text-xs text-stone-500 mb-1">Contract balance (ETH)</div>
                <div className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
                  {contract.totalCostEth || '0.00'} <span className="text-xs font-normal text-stone-400 font-sans">ETH</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#EDF5EE] border border-[#CFE6D3]">
                <div className="flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-[#25562C] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#25562C] mb-0.5">Ethereum RPC node</div>
                    <div className="text-[11px] text-[#25562C]/80 leading-relaxed font-normal">
                      Synced to Sepolia testnet and recording certificates normally.
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
