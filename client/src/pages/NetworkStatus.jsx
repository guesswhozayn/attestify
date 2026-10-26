import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Box,
  Server,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { networkAPI } from '../services/api';
import Button from '../components/shared/Button';
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
    } catch {
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
      .catch(() => {
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
        <LoadingSpinner size="lg" text="Checking network status..." />
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

  const isConnected = network.connected;

  return (
    <div className="w-full bg-[#F8F9FA] text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Network Status
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Blockchain verification ledger status and confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EAECF0] text-xs font-medium text-stone-700 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            <span>{isConnected ? 'Network operational' : 'Node offline'}</span>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            iconClassName={refreshing ? 'animate-spin' : ''}
            title="Refresh status"
            aria-label="Refresh status"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#EAECF0] shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Box className="w-4 h-4 text-stone-400" />
            <span>Network block</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-3">
            {network.blockHeight ? `#${network.blockHeight.toLocaleString()}` : 'Connected'}
          </div>
          <div className="text-xs text-stone-400 mt-1">Sepolia testnet</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EAECF0] shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Zap className="w-4 h-4 text-stone-400" />
            <span>Gas price</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-3">
            {parseFloat(network.gasPrice || 0).toFixed(1)} <span className="text-sm font-normal text-stone-400">Gwei</span>
          </div>
          <div className="text-xs text-emerald-700 mt-1">Normal network speed</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EAECF0] shadow-xs">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
            <Shield className="w-4 h-4 text-stone-400" />
            <span>Ledger records</span>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-3">
            {(contract.totalIssued || 0).toLocaleString()}
          </div>
          <div className="text-xs text-stone-400 mt-1">Verifiable on-chain</div>
        </div>
      </div>

      <div className="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-[#F2F4F7] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight">Recent ledger activity</h2>
            <p className="text-xs text-stone-500 mt-0.5">Most recent transactions confirmed on the ledger.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Activity className="w-6 h-6 mx-auto mb-2 text-stone-300" />
              <p className="font-medium text-stone-700">No transactions recorded yet</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2F4F7] text-stone-400 font-medium bg-stone-50/60">
                  <th className="py-3 px-5">Action</th>
                  <th className="py-3 px-4">Transaction hash</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {recentTransactions.map((tx, idx) => {
                  const isRev = tx.isRevoked;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          {isRev ? (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Shield className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="font-medium text-stone-900">
                            {isRev ? 'Revoked' : 'Issued'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-500">
                        {tx.transactionHash ? (
                          <div className="flex items-center gap-1.5">
                            <span>{`${tx.transactionHash.slice(0, 10)}...${tx.transactionHash.slice(-8)}`}</span>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-400 hover:text-stone-800"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          'Local'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        {tx.type || 'CERTIFICATION'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-medium ${tx.transactionHash ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {tx.transactionHash ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right text-stone-400">
                        {new Date(tx.revokedAt || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
