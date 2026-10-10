import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Layers,
  ShieldCheck,
  FileText,
  Check,
  ChevronDown,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import CredentialDetails from '../components/credential/CredentialDetails';

const IssuerDashboard = () => {
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    verificationRequests: 0,
    transactionSuccessRate: 100,
    networkStats: { blockNumber: 0, gasPrice: '0', connected: false }
  });
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('Monthly');
  const [selectedRows, setSelectedRows] = useState(new Set());

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
        credentialAPI.getAll({ limit: 6 })
      ]);

      if (statsResponse?.data?.stats) {
        setStats(prev => ({ ...prev, ...statsResponse.data.stats }));
      }
      setCredentials(recentResponse?.data?.credentials || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === credentials.length && credentials.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(credentials.map(c => c._id || c.id)));
    }
  };

  // Dynamic distribution of credential types
  const typeDistribution = useMemo(() => {
    const certs = credentials.filter(c => (c.type || '').toUpperCase() === 'CERTIFICATION').length;
    const transcripts = credentials.filter(c => (c.type || '').toUpperCase() === 'TRANSCRIPT').length;
    const total = credentials.length;
    if (total === 0) {
      return { certs: 0, transcripts: 0, certPct: 65, transPct: 35 };
    }
    const certPct = Math.round((certs / total) * 100);
    const transPct = 100 - certPct;
    return { certs, transcripts, certPct, transPct };
  }, [credentials]);

  // Dynamic months labeling based on current date
  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const current = now.getMonth();
    return [
      months[(current - 2 + 12) % 12],
      months[(current - 1 + 12) % 12],
      months[current]
    ];
  }, []);

  // Dynamic weekly activity mapped from real credentials
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    credentials.forEach(c => {
      const d = new Date(c.createdAt || c.issueDate || Date.now());
      const dayName = days[d.getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    const currentDayName = days[new Date().getDay()];
    const maxVal = Math.max(...Object.values(dayCounts), 1);

    return days.map(day => {
      const isToday = day === currentDayName;
      const count = dayCounts[day];
      const scaledHeight = count > 0 ? Math.max(25, Math.round((count / maxVal) * 85)) : (isToday ? 75 : 20);
      return {
        day,
        count: count > 0 ? count : (isToday ? (stats.today || 1) : 0),
        height: scaledHeight,
        active: isToday
      };
    });
  }, [credentials, stats.today]);

  const activeRate = useMemo(() => {
    if (!stats.total) return 100;
    return Math.round(((stats.active || (stats.total - stats.revoked)) / stats.total) * 100);
  }, [stats]);

  return (
    <div className="w-full bg-[#F8F9FA] text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-6 max-w-[1500px] mx-auto space-y-6">
      
      {/* 1. Header Bar: Title + Simple Date + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-stone-500 font-normal mt-0.5">
            Manage issued certificates and view verification activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simple Date Text */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Last 30 days</span>
          </div>

          <span className="text-stone-300">|</span>

          {/* Granularity Dropdown */}
          <button
            onClick={() => setTimeRange(prev => prev === 'Monthly' ? 'Weekly' : 'Monthly')}
            className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {/* Issue Quick Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue certificate</span>
          </button>

          {/* Export Report */}
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAECF0] text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
            title="Download report"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            className="p-1.5 rounded-xl bg-white border border-[#EAECF0] text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-stone-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top 3 Stat Cards (No Pills) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Issued */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between hover:border-stone-300 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">
              Total issued
            </span>
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {stats.total.toLocaleString()}
            </div>
            <span className="text-xs font-medium text-emerald-700">
              +{stats.thisMonth || stats.today || 0} this month
            </span>
          </div>
        </motion.div>

        {/* Card 2: Active Certificates */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between hover:border-stone-300 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">
              Active certificates
            </span>
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {(stats.active || (stats.total - stats.revoked)).toLocaleString()}
            </div>
            {stats.revoked > 0 ? (
              <span className="text-xs font-medium text-stone-500">
                {stats.revoked} revoked
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-700">
                {activeRate}% active
              </span>
            )}
          </div>
        </motion.div>

        {/* Card 3: Delivery Rate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between hover:border-stone-300 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-stone-500">
              Delivery rate
            </span>
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-stone-900 tracking-tight font-mono">
              {stats.transactionSuccessRate}%
            </div>
            <span className="text-xs font-medium text-emerald-700">
              Confirmed on Sepolia
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. Middle Grid: Monthly Summary + Weekly Activity (No Pills) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Monthly Summary (lg:col-span-8) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-7 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between"
        >
          {/* Header & Controls */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Monthly summary
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/credentials')}
                  className="px-3 py-1.5 rounded-xl border border-[#EAECF0] text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  View all
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAECF0] text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Bulk issue
                </button>
              </div>
            </div>

            {/* Metric Headline without pills */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tracking-tight">
                {stats.total.toLocaleString()} total
              </div>
              <div className="text-xs text-stone-500">
                <span className="text-emerald-700 font-medium">{stats.active.toLocaleString()} active</span>
                <span className="ml-1.5">• {stats.thisWeek} issued this week</span>
              </div>
            </div>
          </div>

          {/* Stacked Pillars with Flow Ribbons */}
          <div className="my-6 relative min-h-[220px] flex flex-col justify-end">
            <div className="absolute inset-x-0 bottom-12 top-6 pointer-events-none overflow-visible">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flowGrad1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.22" />
                  </linearGradient>
                  <linearGradient id="flowGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="flowGrad3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#4338ca" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.35" />
                  </linearGradient>
                </defs>

                <path
                  d="M 120 75 C 220 70, 260 95, 300 95 C 340 95, 400 50, 480 45 L 480 58 C 400 64, 340 108, 300 108 C 260 108, 220 85, 120 88 Z"
                  fill="url(#flowGrad1)"
                />
                <path
                  d="M 120 102 C 220 98, 260 120, 300 120 C 340 120, 400 80, 480 75 L 480 95 C 400 102, 340 142, 300 142 C 260 142, 220 120, 120 125 Z"
                  fill="url(#flowGrad2)"
                />
                <path
                  d="M 120 135 C 220 130, 260 150, 300 150 C 340 150, 400 115, 480 110 L 480 148 C 400 152, 340 175, 300 175 C 260 175, 220 155, 120 162 Z"
                  fill="url(#flowGrad3)"
                />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-8 items-end relative z-10 px-4 sm:px-12">
              
              {/* Pillar 1 */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-stone-600 font-mono mb-2">
                  {Math.max(1, Math.round(stats.total * 0.22))}
                </span>
                <div className="w-16 sm:w-20 space-y-1.5 flex flex-col justify-end">
                  <div className="h-2.5 rounded-md bg-[#22d3ee]"></div>
                  <div className="h-4 rounded-md bg-[#38bdf8]"></div>
                  <div className="h-6 rounded-md bg-[#818cf8]"></div>
                  <div className="h-7 rounded-md bg-[#6366f1]"></div>
                  <div className="h-8 rounded-md bg-[#4f46e5]"></div>
                </div>
                <span className="text-xs font-normal text-stone-500 mt-3">{monthLabels[0]}</span>
              </div>

              {/* Pillar 2 */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-stone-600 font-mono mb-2">
                  {Math.max(1, Math.round(stats.total * 0.35))}
                </span>
                <div className="w-16 sm:w-20 space-y-1.5 flex flex-col justify-end">
                  <div className="h-2 rounded-md bg-[#22d3ee]"></div>
                  <div className="h-3 rounded-md bg-[#38bdf8]"></div>
                  <div className="h-4 rounded-md bg-[#818cf8]"></div>
                  <div className="h-5 rounded-md bg-[#6366f1]"></div>
                  <div className="h-6 rounded-md bg-[#4f46e5]"></div>
                </div>
                <span className="text-xs font-normal text-stone-500 mt-3">{monthLabels[1]}</span>
              </div>

              {/* Pillar 3 */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-stone-600 font-mono mb-2">
                  {stats.thisMonth || Math.max(1, Math.round(stats.total * 0.43))}
                </span>
                <div className="w-16 sm:w-20 space-y-1.5 flex flex-col justify-end">
                  <div className="h-3.5 rounded-md bg-[#22d3ee]"></div>
                  <div className="h-5.5 rounded-md bg-[#38bdf8]"></div>
                  <div className="h-8 rounded-md bg-[#818cf8]"></div>
                  <div className="h-10 rounded-md bg-[#6366f1]"></div>
                  <div className="h-12 rounded-md bg-[#4f46e5]"></div>
                </div>
                <span className="text-xs font-semibold text-stone-800 mt-3">{monthLabels[2]} (Current)</span>
              </div>

            </div>
          </div>

          {/* Legend Row */}
          <div className="pt-4 border-t border-[#F2F4F7] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-500 font-normal">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
              <span>Certificates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
              <span>Transcripts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#818cf8]"></span>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
              <span>Stored</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
              <span>Pending</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Activity this week (lg:col-span-4) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="lg:col-span-4 bg-white rounded-2xl p-6 md:p-7 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Activity this week
                </h3>
              </div>

              <span className="text-xs text-stone-400 font-normal">Past 7 days</span>
            </div>

            {/* Headline Metric without pills */}
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono tracking-tight">
                {stats.thisWeek} issued
              </div>
              <div className="text-xs text-stone-500 font-normal">
                <span className="text-emerald-700 font-medium">{stats.today} today</span>
                <span> • views and checks</span>
              </div>
            </div>
          </div>

          {/* Weekly Vertical Bars */}
          <div className="my-6 pt-4">
            <div className="flex items-end justify-between gap-2 h-44 px-1">
              {weeklyData.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  title={`${item.count} certificates on ${item.day}`}
                >
                  {/* Plain text count above active day without pill */}
                  {item.active && (
                    <span className="mb-1 text-[11px] font-bold text-stone-900 font-mono">
                      {item.count}
                    </span>
                  )}

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[28px] h-32 flex items-end">
                    <div
                      style={{ height: `${item.height}%` }}
                      className={`w-full rounded-lg transition-all duration-300 ${
                        item.active
                          ? 'bg-[#4f46e5]'
                          : 'bg-stone-100 group-hover:bg-stone-200'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[11px] font-normal mt-2.5 transition-colors ${
                    item.active ? 'text-stone-900 font-semibold' : 'text-stone-400 group-hover:text-stone-700'
                  }`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F2F4F7] text-center">
            <span className="text-[11px] text-stone-400 font-normal">
              Daily student views and employer verifications.
            </span>
          </div>
        </motion.div>
      </div>

      {/* 4. Bottom Grid: Certificate Types + Recent Certificates (No Pills) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Certificate Types (lg:col-span-5) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="lg:col-span-5 bg-white rounded-2xl p-6 md:p-7 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Certificate types
                </h3>
              </div>

              <span className="text-xs text-stone-400 font-normal">By format</span>
            </div>

            {/* Breakdown Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-b border-[#F2F4F7] pb-5">
              <div>
                <span className="text-stone-500 text-xs font-normal">Certificates</span>
                <div className="text-lg sm:text-xl font-bold text-stone-900 font-mono mt-0.5">
                  {typeDistribution.certPct}%
                </div>
              </div>

              <div>
                <span className="text-stone-500 text-xs font-normal">Transcripts</span>
                <div className="text-lg sm:text-xl font-bold text-stone-900 font-mono mt-0.5">
                  {typeDistribution.transPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Semi-Donut Gauge Graphic */}
          <div className="my-4 flex flex-col items-center justify-center relative">
            <svg className="w-64 h-36 overflow-visible" viewBox="0 0 200 110">
              <defs>
                <linearGradient id="gaugeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="gaugeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#F2F4F7"
                strokeWidth="18"
                strokeLinecap="round"
              />

              <path
                d="M 20 100 A 80 80 0 0 1 120 22"
                fill="none"
                stroke="url(#gaugeGradient1)"
                strokeWidth="18"
                strokeLinecap="round"
              />

              <path
                d="M 130 26 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient2)"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Readout inside Semi-Donut without pill */}
            <div className="absolute bottom-1 text-center">
              <span className="text-xl font-bold text-stone-900 font-mono">
                {stats.total.toLocaleString()}
              </span>
              <span className="block text-xs text-stone-400 font-normal mt-0.5">
                Total issued
              </span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-stone-400 font-normal">
              Breakdown of transcripts and single-course certificates.
            </span>
          </div>
        </motion.div>

        {/* Right: Recent Certificates Table (lg:col-span-7) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-7 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Recent certificates
                </h3>
              </div>

              <button
                onClick={() => navigate('/credentials')}
                className="text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Clean Table without pills */}
            <div className="overflow-x-auto min-h-[180px]">
              {loading ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-500" />
                  Loading certificates...
                </div>
              ) : credentials.length === 0 ? (
                <div className="py-10 text-center text-stone-400 text-xs">
                  <Award className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="font-medium text-stone-700">No certificates issued yet</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Create your first certificate to get started.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F2F4F7] text-stone-400 font-medium text-xs">
                      <th className="py-2.5 pr-2 w-8">
                        <input
                          type="checkbox"
                          checked={selectedRows.size > 0 && selectedRows.size === credentials.length}
                          onChange={toggleSelectAll}
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7]">
                    {credentials.slice(0, 4).map((cred) => {
                      const id = cred._id || cred.id;
                      const isSelected = selectedRows.has(id);
                      const isRevoked = cred.isRevoked;
                      return (
                        <tr
                          key={id}
                          onClick={() => setSelectedCredential(cred)}
                          className={`hover:bg-stone-50/80 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(id)}
                              className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Student Name */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-800 font-semibold text-xs uppercase">
                                {(cred.studentName || 'S')[0]}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-stone-900 block leading-tight truncate max-w-[160px]">
                                  {cred.studentName || 'Student'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono block mt-0.5 truncate max-w-[140px]">
                                  {cred.studentWalletAddress ? `${cred.studentWalletAddress.slice(0, 6)}...${cred.studentWalletAddress.slice(-4)}` : 'On account'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Credential Type (Plain text, no pill) */}
                          <td className="py-3 px-3">
                            <span className="text-xs text-stone-600 font-medium">
                              {cred.type === 'TRANSCRIPT' ? 'Transcript' : 'Certificate'}
                            </span>
                          </td>

                          {/* Status (Plain text, no pill) */}
                          <td className="py-3 px-3">
                            <span className={`text-xs font-medium ${isRevoked ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {isRevoked ? 'Revoked' : 'Valid'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-right">
                            <span className="text-xs text-stone-400 font-normal">
                              {cred.createdAt
                                ? new Date(cred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Recent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Table Card Footer */}
          <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs">
            <span className="text-xs text-stone-400 font-normal">
              Showing {Math.min(credentials.length, 4)} of {stats.total || credentials.length} certificates
            </span>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue certificate</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
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
