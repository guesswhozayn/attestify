import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Plus,
  ArrowRight,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import CredentialDetails from '../components/credential/CredentialDetails';
import Button from '../components/shared/Button';

const IssuerDashboard = () => {
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { showNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFetching = React.useRef(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      if (isRefresh) setRefreshing(true);

      const [statsResponse, recentResponse] = await Promise.all([
        credentialAPI.getStats
          ? credentialAPI.getStats()
          : Promise.resolve({ data: { stats: null } }),
        credentialAPI.getAll({ limit: 8 })
      ]);

      if (statsResponse?.data?.stats) {
        setStats(prev => ({ ...prev, ...statsResponse.data.stats }));
      }
      setCredentials(recentResponse?.data?.credentials || []);
    } catch {
      showNotification('Could not load dashboard data. Check your connection.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleExportData = () => {
    try {
      const exportContent = {
        exportedAt: new Date().toISOString(),
        institution: user?.issuerDetails?.institutionName || user?.name,
        stats,
        recentCredentials: credentials
      };
      const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attestify-report-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification('Report exported successfully', 'success');
    } catch {
      showNotification('Could not export report', 'error');
    }
  };

  const activeCount = stats.active ?? Math.max(0, stats.total - stats.revoked);

  return (
    <div className="w-full bg-[#F8F9FA] text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Overview of certificates and credential verification activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => fetchDashboardData(true)}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            iconClassName={refreshing ? 'animate-spin' : ''}
            title="Refresh"
            aria-label="Refresh dashboard"
          />

          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            icon={Download}
          >
            Export
          </Button>

          <Button
            onClick={() => setShowBulkModal(true)}
            variant="outline"
            size="sm"
            icon={Upload}
          >
            Bulk issue
          </Button>

          <Button
            onClick={() => setShowUploadModal(true)}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">Total issued</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {stats.total.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-700">
              +{stats.thisMonth || stats.today || 0} this month
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">Active certificates</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {activeCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-700">
              {stats.total > 0 ? `${Math.round((activeCount / stats.total) * 100)}% valid` : '100%'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">Revoked</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {(stats.revoked || 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-stone-400">
              Inactive credentials
            </span>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#EAECF0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight">
              Recent certificates
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Click on any row to view full credential details or manage status.
            </p>
          </div>
          <button
            onClick={() => navigate('/credentials')}
            className="flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-14 text-center text-xs text-stone-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-500" />
              Loading certificates...
            </div>
          ) : credentials.length === 0 ? (
            <div className="py-14 text-center text-stone-400 text-xs">
              <Award className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="font-medium text-stone-700">No certificates issued yet</p>
              <p className="text-[11px] text-stone-400 mt-1">Issue your first credential to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2F4F7] text-stone-400 font-medium bg-stone-50/60">
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-4">Credential title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Issued date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F4F7]">
                {credentials.map((cred) => {
                  const id = cred._id || cred.id;
                  const isRevoked = cred.isRevoked;
                  const title = cred.courseName || cred.credentialTitle || cred.title || 'Certificate of Completion';

                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedCredential(cred)}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 font-semibold text-xs uppercase">
                            {(cred.studentName || 'S')[0]}
                          </div>
                          <span className="font-medium text-stone-900 block truncate max-w-[180px]">
                            {cred.studentName || 'Student'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-stone-700 font-medium block truncate max-w-[260px]">
                          {title}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-stone-500 font-medium">
                          {cred.type === 'TRANSCRIPT' ? 'Transcript' : 'Certificate'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-medium ${isRevoked ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {isRevoked ? 'Revoked' : 'Valid'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right text-stone-400">
                        {cred.createdAt
                          ? new Date(cred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <IssueCredentialModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      <BulkIssueModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      <CredentialDetails
        isOpen={!!selectedCredential}
        onClose={() => setSelectedCredential(null)}
        credential={selectedCredential}
        onUpdate={() => fetchDashboardData(true)}
      />
    </div>
  );
};

export default IssuerDashboard;
