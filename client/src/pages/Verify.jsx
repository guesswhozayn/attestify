import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Upload,
  Search,
  RefreshCw,
  X,
  FileCheck2,
  ExternalLink,
  Copy,
  Printer,
  Sun,
  Moon,
  ArrowRight,
  Activity,
  Hash,
  Award,
  Calendar,
  User,
  Lock,
  Building,
  History,
  Layers,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/shared/Button';
import { verifyAPI, networkAPI } from '../services/api';
import { generateFileHash } from '../utils/hash';
import { extractMetadata } from '../utils/pdf';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x3452f146a0c0ad7860fe45cf2a4d339e0ebc1682';

const VerifyDashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlId } = useParams();

  const isDark = theme === 'dark';

  const getInitialTarget = () => {
    if (urlId) return urlId;
    if (location.search) {
      const params = new URLSearchParams(location.search);
      return params.get('walletAddress') || params.get('credentialId') || params.get('registrationNumber') || '';
    }
    return '';
  };

  const [activeTab, setActiveTab] = useState(urlId ? 'id' : 'file');
  const [file, setFile] = useState(null);
  const [computedHash, setComputedHash] = useState('');
  const [searchTarget, setSearchTarget] = useState(getInitialTarget);
  const [rawHash, setRawHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState(false);

  const [networkStats, setNetworkStats] = useState({
    connected: true,
    blockHeight: null,
    totalIssued: null
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await networkAPI.getStats();
        if (response.data?.success && response.data?.stats) {
          setNetworkStats({
            connected: response.data.stats.network?.connected ?? true,
            blockHeight: response.data.stats.network?.blockHeight,
            totalIssued: response.data.stats.contract?.totalIssued
          });
        }
      } catch {
        // Fallback default
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (urlId) {
      handleVerifyTarget(urlId);
    }
  }, [urlId]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      setFile(selectedFile);
      setResult(null);
      try {
        const fileHash = await generateFileHash(selectedFile);
        setComputedHash(fileHash);
        const extractedId = await extractMetadata(selectedFile);
        if (extractedId) {
          setSearchTarget(extractedId);
        }
      } catch (err) {
        console.error('Error generating hash:', err);
      }
    }
  };

  const clearFile = (e) => {
    e?.stopPropagation();
    setFile(null);
    setComputedHash('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const recordHistory = (query, method, verificationResult) => {
    const item = {
      id: Date.now(),
      query,
      method,
      valid: verificationResult?.valid && !verificationResult?.revoked,
      isRevoked: Boolean(verificationResult?.revoked),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      result: verificationResult
    };
    setVerificationHistory((prev) => [item, ...prev.slice(0, 19)]);
  };

  const handleVerifyTarget = async (targetOverride) => {
    const target = targetOverride || searchTarget;
    if (!target) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await verifyAPI.checkExists(target.trim());
      setResult(response.data);
      recordHistory(target.trim(), 'ID Lookup', response.data);
    } catch {
      const failed = {
        valid: false,
        message: 'No record found with this certificate ID or wallet address.'
      };
      setResult(failed);
      recordHistory(target.trim(), 'ID Lookup', failed);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = async () => {
    if (activeTab === 'file') {
      if (!file) return;
      setVerifying(true);
      setResult(null);
      try {
        const fileHash = computedHash || await generateFileHash(file);
        setComputedHash(fileHash);
        const queryTarget = searchTarget || 'credential';
        const response = await verifyAPI.verifyByHash(queryTarget, fileHash);
        setResult(response.data);
        recordHistory(file.name, 'PDF File Check', response.data);
      } catch {
        const failed = {
          valid: false,
          message: 'This document does not match any registered certificate. It may have been edited or was not issued through Attestify.'
        };
        setResult(failed);
        recordHistory(file.name, 'PDF File Check', failed);
      } finally {
        setVerifying(false);
      }
    } else if (activeTab === 'id') {
      await handleVerifyTarget();
    } else if (activeTab === 'hash') {
      if (!rawHash) return;
      setVerifying(true);
      setResult(null);
      try {
        const response = await verifyAPI.verifyByHash('credential', rawHash.trim());
        setResult(response.data);
        recordHistory(rawHash.slice(0, 10) + '...', 'Hash Search', response.data);
      } catch {
        const failed = {
          valid: false,
          message: 'No certificate matched this digital fingerprint hash.'
        };
        setResult(failed);
        recordHistory(rawHash.slice(0, 10) + '...', 'Hash Search', failed);
      } finally {
        setVerifying(false);
      }
    }
  };


  const handleReset = () => {
    setFile(null);
    setComputedHash('');
    setSearchTarget('');
    setRawHash('');
    setResult(null);
    setShowTechnicalDrawer(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyText = (text, key = 'general') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotification('Copied to clipboard', 'success');
    setTimeout(() => {
      setCopiedKey('');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportAuditCSV = () => {
    if (verificationHistory.length === 0) {
      showNotification('No verification history to export', 'error');
      return;
    }
    const headers = ['Date', 'Time', 'Document or ID', 'Check method', 'Result'];
    const rows = verificationHistory.map(h => [
      h.date,
      h.timestamp,
      `"${h.query.replace(/"/g, '""')}"`,
      h.method,
      h.valid ? 'VALID' : h.isRevoked ? 'REVOKED' : 'NOT FOUND'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-verifications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('History exported as CSV', 'success');
  };

  const isSuccess = result?.valid && !result?.revoked;
  const isRevoked = result?.revoked;
  const qrVerificationUrl = `${window.location.origin}/verify?${
    result?.credential?._id ? `credentialId=${result.credential._id}` : `walletAddress=${result?.credential?.studentWalletAddress || ''}`
  }`;

  return (
    <div
      className={`min-h-screen font-sans transition-colors ${
        isDark
          ? 'dashboard-dark bg-[#0a0a0c] text-stone-100 selection:bg-stone-100 selection:text-stone-900'
          : 'dashboard-light bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white'
      }`}
    >
      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors backdrop-blur-md ${
          isDark
            ? 'bg-[#0e1017]/90 border-white/[0.08]'
            : 'bg-white/95 border-[#EAECF0]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 group">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight lowercase">
                attestify<span className="text-indigo-500">.</span>
              </span>
            </Link>
            <span
              className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                isDark
                  ? 'bg-stone-900 text-stone-300 border-white/[0.08]'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              Certificate verifier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                isDark
                  ? 'bg-[#121318] border-white/[0.08] text-stone-300'
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network active</span>
              {networkStats.blockHeight && (
                <span className="text-stone-400 border-l border-stone-300/40 pl-2">
                  Block #{networkStats.blockHeight}
                </span>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/[0.08] text-white hover:bg-white/[0.06]'
                  : 'border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="primary"
                size="sm"
                icon={ArrowRight}
                className="rounded-xl text-xs font-semibold"
              >
                My account
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-white/[0.08]">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Verify an academic certificate
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Upload a certificate PDF or search by ID to confirm whether it is authentic, unaltered, and officially issued by an accredited institution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Official verification service
            </span>
          </div>
        </div>

        {/* Status Highlights Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-stone-400 text-xs font-medium mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Registry status</span>
            </div>
            <p className="text-sm sm:text-base font-bold">Ethereum Sepolia</p>
            <span className="text-[11px] text-emerald-600 font-medium">Public ledger connected</span>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-stone-400 text-xs font-medium mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>Registered records</span>
            </div>
            <p className="text-sm sm:text-base font-bold font-mono">
              {networkStats.totalIssued !== null ? networkStats.totalIssued : '100+'} Issued
            </p>
            <span className="text-[11px] text-stone-400 font-medium">Open to public lookup</span>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-stone-400 text-xs font-medium mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy guarantee</span>
            </div>
            <p className="text-sm sm:text-base font-bold">100% Private</p>
            <span className="text-[11px] text-stone-400 font-medium">Files never leave browser</span>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0] shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 text-stone-400 text-xs font-medium mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Checks today</span>
            </div>
            <p className="text-sm sm:text-base font-bold font-mono">{verificationHistory.length}</p>
            <span className="text-[11px] text-stone-400 font-medium">Recorded in session</span>
          </div>
        </div>

        {/* Verification Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Verifier Form */}
          <div className="lg:col-span-8 space-y-6">
            <div
              className={`rounded-3xl p-6 sm:p-8 border transition-colors shadow-xs ${
                isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0]'
              }`}
            >
              {result ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Status Banner */}
                  <div
                    className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                      isSuccess
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : isRevoked
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-stone-500/10 border-stone-500/20 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
                          isSuccess
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : isRevoked
                            ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                            : 'bg-stone-500/20 border-stone-500/30 text-stone-400'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        ) : isRevoked ? (
                          <ShieldAlert className="w-7 h-7 text-rose-500" />
                        ) : (
                          <XCircle className="w-7 h-7 text-stone-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                          {isSuccess
                            ? 'Certificate verified'
                            : isRevoked
                            ? 'Certificate revoked'
                            : 'Certificate not found'}
                        </h2>
                        <p className="text-xs font-medium opacity-80 mt-0.5">
                          {isSuccess
                            ? 'This certificate is authentic and matches the official record.'
                            : isRevoked
                            ? 'This certificate was canceled by the issuing institution.'
                            : result.message || 'No matching certificate found in the registry.'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold self-start sm:self-auto ${
                        isSuccess
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : isRevoked
                          ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                          : 'bg-stone-500/20 border-stone-500/30 text-stone-400'
                      }`}
                    >
                      {isSuccess ? 'GENUINE' : isRevoked ? 'REVOKED' : 'UNVERIFIED'}
                    </div>
                  </div>

                  {/* Issuer Trust Card */}
                  {isSuccess && result.credential && (
                    <div
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isDark ? 'bg-[#181920] border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-sm">
                            {result.credential.university || 'Accredited Institution'}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Verified official issuer on the Attestify protocol
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        Accredited
                      </span>
                    </div>
                  )}

                  {/* Certificate details */}
                  {result.credential ? (
                    <div
                      className={`rounded-2xl p-6 border space-y-5 ${
                        isDark ? 'bg-[#161720] border-white/[0.08]' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-white/[0.08]">
                        <h3 className="text-sm font-bold tracking-tight">Certificate details</h3>
                        <span className="text-xs font-mono text-stone-400">
                          {result.credential.type || 'CERTIFICATION'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-stone-400 font-medium flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            Recipient name
                          </span>
                          <p className="font-bold text-sm">{result.credential.studentName || 'Not specified'}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-stone-400 font-medium flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Issuing institution
                          </span>
                          <p className="font-bold text-sm">{result.credential.university || 'Attestify Issuer'}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-stone-400 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Issue date
                          </span>
                          <p className="font-semibold">
                            {result.credential.issueDate
                              ? new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-stone-400 font-medium flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            Current status
                          </span>
                          <p
                            className={`font-semibold ${
                              result.credential.isRevoked ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                          >
                            {result.credential.isRevoked ? 'Revoked' : 'Active and authentic'}
                          </p>
                        </div>

                        {/* Recipient Wallet Address */}
                        <div className="sm:col-span-2 space-y-1 pt-2 border-t border-stone-200/60 dark:border-white/[0.08]">
                          <span className="text-stone-400 font-medium flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5" />
                              Recipient wallet address
                            </span>
                            <button
                              onClick={() => copyText(result.credential.studentWalletAddress, 'wallet')}
                              className="text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedKey === 'wallet' ? 'Copied' : 'Copy'}
                            </button>
                          </span>
                          <p className="font-mono text-xs p-2.5 rounded-xl bg-stone-100 dark:bg-[#121318] border border-stone-200 dark:border-white/[0.08] break-all select-all">
                            {result.credential.studentWalletAddress}
                          </p>
                        </div>

                        {/* Document Fingerprint Hash */}
                        {result.credential.certificateHash && (
                          <div className="sm:col-span-2 space-y-1">
                            <span className="text-stone-400 font-medium flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" />
                                Digital document fingerprint (SHA-256)
                              </span>
                              <button
                                onClick={() => copyText(result.credential.certificateHash, 'hash')}
                                className="text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedKey === 'hash' ? 'Copied' : 'Copy'}
                              </button>
                            </span>
                            <p className="font-mono text-[11px] p-2.5 rounded-xl bg-stone-100 dark:bg-[#121318] border border-stone-200 dark:border-white/[0.08] break-all select-all">
                              {result.credential.certificateHash}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Technical Details Accordion */}
                      <div className="pt-3 border-t border-stone-200/60 dark:border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors py-1 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            Show technical details and blockchain record
                          </span>
                          {showTechnicalDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showTechnicalDrawer && (
                          <div className="mt-3 p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-3 font-mono text-[11px] text-stone-300">
                            <div className="space-y-1">
                              <span className="text-stone-500 uppercase text-[9px] block">Smart contract address</span>
                              <span className="break-all text-indigo-300">{CONTRACT_ADDRESS}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-stone-500 uppercase text-[9px] block">On-chain function</span>
                              <span className="text-emerald-400">verifyCredential(studentId, certificateHash)</span>
                            </div>
                            {result.credential.transactionHash && (
                              <div className="space-y-1">
                                <span className="text-stone-500 uppercase text-[9px] block">Transaction receipt</span>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline flex items-center gap-1 break-all"
                                >
                                  View on Etherscan
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              </div>
                            )}
                            {result.credential.ipfsCID && (
                              <div className="space-y-1">
                                <span className="text-stone-500 uppercase text-[9px] block">Decentralized storage (IPFS)</span>
                                <a
                                  href={`https://gateway.pinata.cloud/ipfs/${result.credential.ipfsCID}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline flex items-center gap-1 break-all"
                                >
                                  View on IPFS
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QR Verification Seal */}
                      {isSuccess && (
                        <div className="p-4 rounded-xl bg-white dark:bg-[#121318] border border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center gap-5">
                          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0">
                            <QRCodeSVG value={qrVerificationUrl} size={110} level="M" />
                          </div>
                          <div className="space-y-1 text-xs text-center sm:text-left">
                            <span className="font-bold text-sm block">Quick verification QR code</span>
                            <p className="text-stone-400 text-[11px] leading-relaxed">
                              Scan this QR code with a phone to open this verification confirmation page.
                            </p>
                            <span className="font-mono text-[10px] text-stone-500 block truncate max-w-sm">
                              {qrVerificationUrl}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200/60 dark:border-white/[0.08]">
                    <Button
                      onClick={handleReset}
                      variant="primary"
                      size="md"
                      icon={RefreshCw}
                      className="rounded-xl cursor-pointer"
                    >
                      Check another certificate
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handlePrint}
                        variant="secondary"
                        size="md"
                        icon={Printer}
                        className="rounded-xl text-xs cursor-pointer"
                      >
                        Print confirmation
                      </Button>
                      <Button
                        onClick={() => copyText(qrVerificationUrl, 'share')}
                        variant="outline"
                        size="md"
                        icon={Copy}
                        className="rounded-xl text-xs cursor-pointer"
                      >
                        {copiedKey === 'share' ? 'Link copied' : 'Copy link'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Verification Input Workspace */
                <div className="space-y-6">
                  {/* Mode Tab Switcher */}
                  <div
                    className={`flex flex-wrap p-1.5 rounded-2xl border text-xs font-semibold ${
                      isDark
                        ? 'bg-[#181920] border-white/[0.08] text-stone-400'
                        : 'bg-stone-100 border-stone-200/60 text-stone-600'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('file')}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        activeTab === 'file'
                          ? isDark
                            ? 'bg-[#272833] text-white shadow-xs'
                            : 'bg-white text-stone-900 shadow-xs'
                          : 'hover:text-stone-200'
                      }`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Upload PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('id')}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        activeTab === 'id'
                          ? isDark
                            ? 'bg-[#272833] text-white shadow-xs'
                            : 'bg-white text-stone-900 shadow-xs'
                          : 'hover:text-stone-200'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      Search by ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('hash')}
                      className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        activeTab === 'hash'
                          ? isDark
                            ? 'bg-[#272833] text-white shadow-xs'
                            : 'bg-white text-stone-900 shadow-xs'
                          : 'hover:text-stone-200'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      Search by hash
                    </button>
                  </div>

                  {/* Tab 1: File Upload */}
                  {activeTab === 'file' && (
                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
                          file
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : isDark
                            ? 'border-white/[0.1] bg-[#161720] hover:border-white/[0.25]'
                            : 'border-stone-200 bg-stone-50/80 hover:border-stone-400'
                        }`}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          ref={fileInputRef}
                        />

                        <div className="flex flex-col items-center">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                              file
                                ? 'bg-emerald-600 text-white'
                                : isDark
                                ? 'bg-[#1e2029] text-stone-300 border border-white/[0.08]'
                                : 'bg-white text-stone-600 border border-stone-200'
                            }`}
                          >
                            {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                          </div>

                          {file ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-bold truncate max-w-sm">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={clearFile}
                                  className="p-1 rounded-lg text-stone-400 hover:text-rose-400 cursor-pointer"
                                  title="Remove file"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-emerald-500 font-medium">
                                Ready to check
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <h3 className="text-base font-bold">Drop your certificate PDF here</h3>
                              <p className="text-xs text-stone-400">
                                or select a file from your computer
                              </p>
                              <span className="inline-block mt-2 text-[10px] uppercase font-mono text-stone-500 bg-stone-100 dark:bg-stone-800/60 px-2.5 py-1 rounded-full">
                                PDF documents up to 25 MB
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleVerify}
                        loading={verifying}
                        disabled={verifying || !file}
                        variant="primary"
                        size="lg"
                        icon={ShieldCheck}
                        className="w-full justify-center rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer"
                      >
                        {verifying ? 'Checking certificate...' : 'Verify certificate'}
                      </Button>
                    </div>
                  )}

                  {/* Tab 2: ID or Wallet Search */}
                  {activeTab === 'id' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold block text-stone-400">
                          Certificate ID or student wallet address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                            <Search className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. 0x49d3... or certificate reference ID"
                            value={searchTarget}
                            onChange={(e) => setSearchTarget(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className={`block w-full pl-10 pr-10 py-3 rounded-xl font-mono text-xs transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#161720] border border-white/[0.1] text-white placeholder-stone-500 focus:border-white'
                                : 'bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-900'
                            }`}
                          />
                          {searchTarget && (
                            <button
                              type="button"
                              onClick={() => setSearchTarget('')}
                              className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Enter the student wallet address or the reference ID shown on the certificate.
                        </p>
                      </div>

                      <Button
                        onClick={handleVerify}
                        loading={verifying}
                        disabled={verifying || !searchTarget}
                        variant="primary"
                        size="lg"
                        icon={Search}
                        className="w-full justify-center rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer"
                      >
                        {verifying ? 'Searching...' : 'Search certificate'}
                      </Button>
                    </div>
                  )}

                  {/* Tab 3: Direct Hash */}
                  {activeTab === 'hash' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold block text-stone-400">
                          Digital fingerprint hash (SHA-256)
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                            <Hash className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                            value={rawHash}
                            onChange={(e) => setRawHash(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className={`block w-full pl-10 pr-10 py-3 rounded-xl font-mono text-xs transition-all focus:outline-none ${
                              isDark
                                ? 'bg-[#161720] border border-white/[0.1] text-white placeholder-stone-500 focus:border-white'
                                : 'bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-900'
                            }`}
                          />
                          {rawHash && (
                            <button
                              type="button"
                              onClick={() => setRawHash('')}
                              className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleVerify}
                        loading={verifying}
                        disabled={verifying || !rawHash}
                        variant="primary"
                        size="lg"
                        icon={Hash}
                        className="w-full justify-center rounded-xl py-3 text-sm font-bold shadow-md cursor-pointer"
                      >
                        {verifying ? 'Checking fingerprint...' : 'Check hash'}
                      </Button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div
              className={`p-5 rounded-2xl border text-xs flex items-start gap-3.5 leading-relaxed ${
                isDark
                  ? 'bg-[#121318] border-white/[0.08] text-stone-400'
                  : 'bg-white border-[#EAECF0] text-stone-600'
              }`}
            >
              <Lock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-200 block mb-0.5">
                  Your files stay private
                </span>
                Attestify checks the document fingerprint locally in your browser. The file itself is never uploaded, saved, or shared with anyone.
              </div>
            </div>
          </div>

          {/* Right Sidebar: Session History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Session Verification History */}
            <div
              className={`rounded-3xl p-6 border transition-colors shadow-xs space-y-4 ${
                isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Recent checks</h3>
                </div>
                <div className="flex items-center gap-2">
                  {verificationHistory.length > 0 && (
                    <>
                      <button
                        onClick={exportAuditCSV}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 font-medium"
                        title="Export CSV"
                      >
                        <Download className="w-3 h-3" />
                        Save CSV
                      </button>
                      <button
                        onClick={() => setVerificationHistory([])}
                        className="text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              {verificationHistory.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No checks performed yet</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Certificates you check in this session will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {verificationHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setResult(item.result)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] ${
                        isDark
                          ? 'bg-[#161720] border-white/[0.06] hover:border-white/[0.15]'
                          : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate max-w-[170px]">{item.query}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.valid
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : item.isRevoked
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-stone-500/15 text-stone-400'
                          }`}
                        >
                          {item.valid ? 'Valid' : item.isRevoked ? 'Revoked' : 'Not found'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>{item.method}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simple Technical Summary */}
            <div
              className={`rounded-3xl p-6 border transition-colors shadow-xs space-y-4 text-xs ${
                isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-[#EAECF0]'
              }`}
            >
              <h3 className="font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                How verification works
              </h3>

              <div className="space-y-3 divide-y divide-stone-200/60 dark:divide-white/[0.08]">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-400">Document checking</span>
                  <span className="font-medium">Direct browser hash</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-stone-400">Public registry</span>
                  <span className="font-medium">Ethereum Sepolia</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-stone-400">Revocation check</span>
                  <span className="font-medium">Real-time status</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-stone-400">Check speed</span>
                  <span className="font-semibold text-emerald-500">Instant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyDashboard;
