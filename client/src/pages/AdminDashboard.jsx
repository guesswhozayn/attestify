import { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Clock,
  ShieldCheck,
  Award,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { adminAPI } from '../services/api';
import Button from '../components/shared/Button';
import StatCard from '../components/shared/StatCard';
import EmptyState from '../components/shared/EmptyState';
import { SkeletonStatCard, SkeletonTableRow } from '../components/shared/Skeleton';
import IssuerReviewModal from '../components/admin/IssuerReviewModal';
import IssuerActionModal from '../components/admin/IssuerActionModal';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState(null);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionModalState, setActionModalState] = useState({
    isOpen: false,
    issuer: null,
    type: null
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, issuersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getIssuers({
          page,
          limit: 15,
          status: activeTab === 'pending' ? 'PENDING' : statusFilter,
          search: searchQuery
        })
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }

      if (issuersRes.data?.success) {
        setIssuers(issuersRes.data.issuers || []);
        if (issuersRes.data.pagination) {
          setTotalPages(issuersRes.data.pagination.totalPages || 1);
          setTotalCount(issuersRes.data.pagination.total || 0);
        }
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to load administrative data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, activeTab, statusFilter, searchQuery, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const res = await adminAPI.approveIssuer(id);
      if (res.data?.success) {
        showNotification(
          res.data.onChainTxHash
            ? `Issuer approved and authorized on-chain (Tx: ${res.data.onChainTxHash.substring(0, 10)}...)`
            : 'Issuer approved successfully in registry.',
          'success'
        );
        setShowReviewModal(false);
        fetchData(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to approve issuer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionConfirm = async (reason) => {
    const { issuer, type } = actionModalState;
    if (!issuer || !type) return;

    try {
      setActionLoading(true);
      let res;
      if (type === 'reject') {
        res = await adminAPI.rejectIssuer(issuer.id, reason);
      } else if (type === 'suspend') {
        res = await adminAPI.suspendIssuer(issuer.id, reason);
      }

      if (res?.data?.success) {
        showNotification(
          type === 'reject' ? 'Issuer application rejected.' : 'Issuer suspended successfully.',
          'success'
        );
        setActionModalState({ isOpen: false, issuer: null, type: null });
        setShowReviewModal(false);
        fetchData(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.error || `Failed to ${type} issuer`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (id) => {
    try {
      setActionLoading(true);
      const res = await adminAPI.reactivateIssuer(id);
      if (res.data?.success) {
        showNotification('Issuer reactivated successfully.', 'success');
        setShowReviewModal(false);
        fetchData(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to reactivate issuer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncBlockchain = async (id) => {
    try {
      setActionLoading(true);
      const res = await adminAPI.syncBlockchainAuth(id);
      if (res.data?.success) {
        showNotification(res.data.message || 'Blockchain authorization synchronized.', 'success');
        fetchData(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to sync on-chain authorization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openDossier = async (issuer) => {
    try {
      const res = await adminAPI.getIssuerById(issuer.id);
      if (res.data?.success) {
        setSelectedIssuer(res.data.issuer);
        setShowReviewModal(true);
      } else {
        setSelectedIssuer(issuer);
        setShowReviewModal(true);
      }
    } catch {
      setSelectedIssuer(issuer);
      setShowReviewModal(true);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <XCircle className="w-3 h-3 text-amber-600" />
            Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Platform Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200">
              Admin Console
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Review institutional registration applications, authorize issuers on-chain, and manage platform participants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !stats ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Issuers"
              value={stats?.totalIssuers ?? 0}
              icon={Building}
              variant="default"
              subtext="Registered institutions"
            />
            <StatCard
              title="Pending Approvals"
              value={stats?.pendingCount ?? 0}
              icon={Clock}
              variant={stats?.pendingCount > 0 ? 'warning' : 'default'}
              subtext="Awaiting verification"
            />
            <StatCard
              title="Verified Institutions"
              value={stats?.verifiedCount ?? 0}
              icon={ShieldCheck}
              variant="success"
              subtext="On-chain authorized"
            />
            <StatCard
              title="Platform Credentials"
              value={stats?.totalCredentials ?? 0}
              icon={Award}
              variant="default"
              subtext={`${stats?.revokedCredentials ?? 0} revoked`}
            />
          </>
        )}
      </div>

      <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 w-fit ${
        isDark ? 'bg-stone-900/60 border-white/10' : 'bg-stone-100 border-[#EAECF0]'
      }`}>
        <button
          type="button"
          onClick={() => { setActiveTab('pending'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? isDark ? 'bg-white text-stone-950 shadow-xs' : 'bg-white text-stone-900 shadow-2xs'
              : isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approvals</span>
          {stats?.pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? isDark ? 'bg-white text-stone-950 shadow-xs' : 'bg-white text-stone-900 shadow-2xs'
              : isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Manage All Issuers</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
            isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
          }`}>
            {stats?.totalIssuers ?? 0}
          </span>
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <SkeletonTableRow />
              <SkeletonTableRow />
              <SkeletonTableRow />
            </div>
          ) : issuers.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Caught Up"
              description="There are currently no institutional registration applications pending approval."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issuers.map((issuer) => {
                const wallet = issuer.authorizedWalletAddress || issuer.walletAddress;
                return (
                  <div
                    key={issuer.id}
                    className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isDark ? 'bg-[#0e1017] border-white/10 hover:border-white/20' : 'bg-white border-[#EAECF0] hover:border-stone-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-base shrink-0 ${
                          isDark ? 'bg-[#181920] border-white/10 text-white' : 'bg-stone-50 border-[#EAECF0] text-stone-900'
                        }`}>
                          {issuer.institutionName?.charAt(0) || <Building className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                            {issuer.institutionName}
                          </h3>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            Reg: <span className="font-mono font-medium">{issuer.registrationNumber}</span>
                          </p>
                        </div>
                      </div>
                      {renderStatusBadge(issuer.status)}
                    </div>

                    <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                      isDark ? 'bg-stone-900/40 border-white/10' : 'bg-stone-50 border-[#EAECF0]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Contact Email:</span>
                        <span className={`font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{issuer.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Authorized Wallet:</span>
                        <span className={`font-mono truncate max-w-[180px] ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                          {wallet || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Applied Date:</span>
                        <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>
                          {new Date(issuer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAECF0]">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openDossier(issuer)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Dossier
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => setActionModalState({ isOpen: true, issuer, type: 'reject' })}
                      >
                        Reject
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={actionLoading}
                        disabled={actionLoading}
                        onClick={() => handleApprove(issuer.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search by institution, registration #, email, or wallet..."
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#0e1017] border-white/10 text-white placeholder-stone-500 focus:border-white/30'
                    : 'bg-white border-[#EAECF0] text-stone-900 placeholder-stone-400 focus:border-stone-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}>
                <Filter className="w-3 h-3 inline mr-1" />
                Filter:
              </span>
              {['ALL', 'VERIFIED', 'PENDING', 'SUSPENDED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === status
                      ? isDark ? 'bg-white text-stone-950' : 'bg-stone-900 text-white'
                      : isDark ? 'bg-stone-900/60 text-stone-400 hover:text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Institutional issuers management directory"
            className={`w-full overflow-x-auto rounded-2xl border ${
              isDark ? 'bg-[#0e1017] border-white/10' : 'bg-white border-[#EAECF0] shadow-xs'
            }`}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10 text-stone-400' : 'border-[#EAECF0] text-stone-500'}`}>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Institution</th>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Contact</th>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Authorized Wallet</th>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Credentials</th>
                  <th scope="col" className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-[#EAECF0]'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-400">Loading institutions...</td>
                  </tr>
                ) : issuers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No institutions match the current search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  issuers.map((issuer) => {
                    const wallet = issuer.authorizedWalletAddress || issuer.walletAddress;
                    return (
                      <tr
                        key={issuer.id}
                        className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-stone-50'}`}
                      >
                        <td className="py-4 px-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold shrink-0 ${
                              isDark ? 'bg-[#181920] border-white/10 text-white' : 'bg-stone-50 border-[#EAECF0] text-stone-900'
                            }`}>
                              {issuer.institutionName?.charAt(0) || <Building className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{issuer.institutionName}</p>
                              <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Reg: {issuer.registrationNumber}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <p className={`font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{issuer.email}</p>
                          <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            Joined {new Date(issuer.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          {wallet ? (
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[130px]">{wallet}</span>
                              <a
                                href={`https://sepolia.etherscan.io/address/${wallet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1 rounded-sm ${isDark ? 'hover:text-white' : 'hover:text-stone-900'}`}
                                title="View on Etherscan"
                              >
                                <ExternalLink className="w-3 h-3 text-stone-400" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-stone-400">None</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {renderStatusBadge(issuer.status)}
                        </td>

                        <td className="py-4 px-4 font-semibold tabular-nums">
                          {issuer.totalCredentialsIssued}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => openDossier(issuer)}
                            >
                              Dossier
                            </Button>

                            {issuer.status === 'PENDING' && (
                              <Button
                                type="button"
                                variant="primary"
                                size="xs"
                                loading={actionLoading}
                                onClick={() => handleApprove(issuer.id)}
                              >
                                Approve
                              </Button>
                            )}

                            {issuer.status === 'VERIFIED' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => setActionModalState({ isOpen: true, issuer, type: 'suspend' })}
                              >
                                Suspend
                              </Button>
                            )}

                            {issuer.status === 'SUSPENDED' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                loading={actionLoading}
                                onClick={() => handleReactivate(issuer.id)}
                              >
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Showing {issuers.length} of {totalCount} institutions
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>
                <span className={`text-xs font-semibold px-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <IssuerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        issuer={selectedIssuer}
        onApprove={handleApprove}
        onReject={(issuer) => {
          setShowReviewModal(false);
          setActionModalState({ isOpen: true, issuer, type: 'reject' });
        }}
        onSuspend={(issuer) => {
          setShowReviewModal(false);
          setActionModalState({ isOpen: true, issuer, type: 'suspend' });
        }}
        onReactivate={handleReactivate}
        onSyncBlockchain={handleSyncBlockchain}
        loading={actionLoading}
      />

      <IssuerActionModal
        isOpen={actionModalState.isOpen}
        onClose={() => setActionModalState({ isOpen: false, issuer: null, type: null })}
        issuer={actionModalState.issuer}
        actionType={actionModalState.type}
        onConfirm={handleActionConfirm}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminDashboard;

