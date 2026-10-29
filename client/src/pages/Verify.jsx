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
  Award,
  Calendar,
  User,
  Lock,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/shared/Button';
import { verifyAPI } from '../services/api';
import { generateFileHash } from '../utils/hash';
import { extractMetadata } from '../utils/pdf';

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
      return params.get('credentialId') || params.get('id') || params.get('walletAddress') || params.get('registrationNumber') || '';
    }
    return '';
  };

  const initialTarget = getInitialTarget();
  const [activeTab, setActiveTab] = useState(initialTarget ? 'id' : 'file');
  const [file, setFile] = useState(null);
  const [computedHash, setComputedHash] = useState('');
  const [searchTarget, setSearchTarget] = useState(initialTarget);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const target = urlId || (location.search ? new URLSearchParams(location.search).get('credentialId') || new URLSearchParams(location.search).get('id') || new URLSearchParams(location.search).get('walletAddress') : '');
    if (target) {
      setSearchTarget(target);
      setActiveTab('id');
      handleVerifyTarget(target);
    }
  }, [urlId, location.search]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
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

  const handleVerifyTarget = async (targetOverride) => {
    const target = targetOverride || searchTarget;
    if (!target) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await verifyAPI.checkExists(target.trim());
      const data = response.data;
      if (data.credential) {
        setResult(data);
      } else if (data.credentials && data.credentials.length > 0) {
        const first = data.credentials[0];
        setResult({
          valid: !first.isRevoked,
          revoked: first.isRevoked,
          exists: true,
          credential: first,
          credentials: data.credentials,
          verificationTier: data.verificationTier || 'REGISTRY_RECORD'
        });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({
        valid: false,
        message: err.response?.data?.message || 'No record found with this certificate ID or wallet address.'
      });
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
        setResult({
          ...response.data,
          verificationTier: 'CRYPTOGRAPHIC_HASH'
        });
      } catch (err) {
        setResult({
          valid: false,
          message: err.response?.data?.message || 'This document does not match any registered certificate. It may have been edited or was not issued through Attestify.'
        });
      } finally {
        setVerifying(false);
      }
    } else if (activeTab === 'id') {
      await handleVerifyTarget();
    }
  };

  const handleReset = () => {
    setFile(null);
    setComputedHash('');
    setSearchTarget('');
    setResult(null);
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

  const isSuccess = result?.valid && !result?.revoked;
  const isRevoked = result?.revoked;
  const credentialKey = result?.credential?.id || result?.credential?._id;
  const qrVerificationUrl = credentialKey
    ? `${window.location.origin}/verify/${credentialKey}`
    : `${window.location.origin}/verify?walletAddress=${result?.credential?.studentWalletAddress || ''}`;

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 group">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight lowercase">
                attestify<span className="text-indigo-500">.</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
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
                Dashboard
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
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center space-y-8">
        {/* Banner Title */}
        <div className="text-center space-y-2 w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
            Verify a Certificate
          </h1>
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed font-normal">
            Verify academic credentials directly against accredited university records.
          </p>
        </div>

        {/* Verification Card */}
        <div
          className={`w-full rounded-2xl p-6 sm:p-8 border transition-colors shadow-xs ${
            isDark ? 'bg-[#121318] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          {result ? (
            /* Result State */
            <div className="space-y-6 animate-in fade-in duration-300 text-center">
              {/* Status Header */}
              <div
                className={`rounded-xl p-6 border flex flex-col items-center text-center gap-3 ${
                  isSuccess
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                    : isRevoked
                    ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30'
                    : 'bg-stone-100 border-stone-300 dark:bg-stone-500/10 dark:border-stone-500/30'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300'
                      : isRevoked
                      ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300'
                      : 'bg-stone-200 border-stone-300 text-stone-700 dark:bg-stone-500/20 dark:border-stone-500/30 dark:text-stone-300'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  ) : isRevoked ? (
                    <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <XCircle className="w-7 h-7 text-stone-600 dark:text-stone-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2
                    className={`text-xl sm:text-2xl font-bold tracking-tight ${
                      isSuccess
                        ? 'text-emerald-950 dark:text-emerald-200'
                        : isRevoked
                        ? 'text-rose-950 dark:text-rose-200'
                        : 'text-stone-900 dark:text-white'
                    }`}
                  >
                    {isSuccess
                      ? result.verificationTier === 'CRYPTOGRAPHIC_HASH'
                        ? 'Document Cryptographically Verified'
                        : 'Certificate Verified Authentic'
                      : isRevoked
                      ? 'Certificate Revoked'
                      : 'Certificate Not Found'}
                  </h2>
                  <p
                    className={`text-xs font-medium max-w-md mx-auto ${
                      isSuccess
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : isRevoked
                        ? 'text-rose-800 dark:text-rose-300'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {isSuccess
                      ? result.verificationTier === 'CRYPTOGRAPHIC_HASH'
                        ? 'The certificate PDF file was cryptographically matched to the tamper-proof on-chain digest.'
                        : result.onChainVerified
                        ? 'This credential was cryptographically confirmed against the Ethereum blockchain registry.'
                        : result.message || 'This credential matches the official institutional registry.'
                      : isRevoked
                      ? 'This credential was formally revoked by the issuing institution.'
                      : result.message || 'No credential matching this document was found.'}
                  </p>
                </div>

                <div
                  className={`px-3.5 py-1 rounded-md border text-xs font-mono font-bold mt-1 ${
                    isSuccess
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300'
                      : isRevoked
                      ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300'
                      : 'bg-stone-200 border-stone-300 text-stone-800 dark:bg-stone-500/20 dark:border-stone-500/30 dark:text-stone-200'
                  }`}
                >
                  {isSuccess
                    ? result.verificationTier === 'CRYPTOGRAPHIC_HASH'
                      ? 'CRYPTOGRAPHIC FILE MATCH (100%)'
                      : result.onChainVerified
                      ? 'ON-CHAIN VERIFIED'
                      : 'OFFICIAL REGISTRY'
                    : isRevoked
                    ? 'REVOKED'
                    : 'NOT FOUND'}
                </div>
              </div>

              {/* Certificate Details */}
              {result.credential ? (
                <div
                  className={`rounded-xl p-6 border space-y-5 ${
                    isDark ? 'bg-[#161720] border-white/[0.08]' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/[0.08]">
                    <span className="text-xs font-bold tracking-tight uppercase text-stone-700 dark:text-stone-400">
                      Credential Details
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-400">
                      {result.credential.type || 'DEGREE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <span className="text-stone-700 dark:text-stone-400 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        Recipient
                      </span>
                      <p className="font-bold text-sm text-stone-900 dark:text-white">
                        {result.credential.studentName || 'Not specified'}
                      </p>
                    </div>

                    <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <span className="text-stone-700 dark:text-stone-400 font-medium flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        Issuing Institution
                      </span>
                      <p className="font-bold text-sm text-stone-900 dark:text-white">
                        {result.credential.university || 'Accredited Institution'}
                      </p>
                    </div>

                    <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <span className="text-stone-700 dark:text-stone-400 font-medium flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        Degree / Award
                      </span>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {result.credential.course || result.credential.title || 'Academic Credential'}
                      </p>
                    </div>

                    <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <span className="text-stone-700 dark:text-stone-400 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        Date of Issue
                      </span>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {result.credential.issueDate
                          ? new Date(result.credential.issueDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>

                    {result.credential.studentWalletAddress && (
                      <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left sm:col-span-2 pt-2 border-t border-stone-200 dark:border-white/[0.08]">
                        <span className="text-stone-700 dark:text-stone-400 font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                          Recipient Wallet
                        </span>
                        <div className="flex items-center gap-2 font-mono text-xs text-stone-900 dark:text-stone-200">
                          <span>
                            {result.credential.studentWalletAddress.length > 22
                              ? `${result.credential.studentWalletAddress.slice(0, 10)}...${result.credential.studentWalletAddress.slice(-8)}`
                              : result.credential.studentWalletAddress}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(result.credential.studentWalletAddress, 'wallet')}
                            className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
                            title="Copy wallet address"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blockchain Receipt Link */}
                  {result.credential.transactionHash && (
                    <div className="pt-3 border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-center text-xs">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${result.credential.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold"
                      >
                        <span>View on Etherscan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Verification QR Seal */}
                  {isSuccess && (
                    <div className="p-5 rounded-xl bg-white dark:bg-[#121318] border border-stone-200 dark:border-white/[0.08] flex flex-col items-center text-center gap-3 pt-5">
                      <div className="p-2.5 bg-white rounded-lg border border-stone-200 shrink-0 shadow-xs">
                        <QRCodeSVG value={qrVerificationUrl} size={100} level="M" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-stone-900 dark:text-white block">
                          Official Verification Link
                        </span>
                        <p className="text-stone-700 dark:text-stone-400 text-[11px] leading-relaxed max-w-sm mx-auto">
                          Scan to confirm this certificate on any mobile device.
                        </p>
                        <span className="font-mono text-[10px] text-stone-700 dark:text-stone-400 block truncate max-w-xs mx-auto">
                          {qrVerificationUrl}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <Button
                  onClick={handleReset}
                  variant="primary"
                  size="md"
                  icon={RefreshCw}
                  className="rounded-xl cursor-pointer text-xs font-semibold px-5"
                >
                  Verify another certificate
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="secondary"
                  size="md"
                  icon={Printer}
                  className="rounded-xl text-xs cursor-pointer font-semibold px-5"
                >
                  Print
                </Button>
                <Button
                  onClick={() => copyText(qrVerificationUrl, 'share')}
                  variant="outline"
                  size="md"
                  icon={Copy}
                  className="rounded-xl text-xs cursor-pointer font-semibold px-5"
                >
                  {copiedKey === 'share' ? 'Copied' : 'Copy link'}
                </Button>
              </div>
            </div>
          ) : (
            /* Input State */
            <div className="space-y-6">
              {/* Tab Selector */}
              <div
                className={`max-w-xs mx-auto grid grid-cols-2 p-1 rounded-xl border text-xs font-semibold ${
                  isDark
                    ? 'bg-[#181920] border-white/[0.08]'
                    : 'bg-stone-100 border-stone-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`py-2 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'file'
                      ? isDark
                        ? 'bg-[#272833] text-white shadow-xs'
                        : 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : isDark
                      ? 'text-stone-300 hover:text-white'
                      : 'text-stone-700 hover:text-stone-950 font-medium'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('id')}
                  className={`py-2 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'id'
                      ? isDark
                        ? 'bg-[#272833] text-white shadow-xs'
                        : 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : isDark
                      ? 'text-stone-300 hover:text-white'
                      : 'text-stone-700 hover:text-stone-950 font-medium'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Certificate ID
                </button>
              </div>

              {/* Mode 1: PDF Upload */}
              {activeTab === 'file' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`group border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
                      file
                        ? isDark
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-emerald-500/50 bg-emerald-50/70'
                        : isDark
                        ? 'border-white/[0.12] bg-[#161720] hover:border-white/[0.25]'
                        : 'border-stone-300 bg-stone-50/80 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />

                    <div className="flex flex-col items-center justify-center">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
                          file
                            ? 'bg-emerald-600 text-white'
                            : isDark
                            ? 'bg-[#1e2029] text-stone-200 border border-white/[0.1]'
                            : 'bg-white text-stone-700 border border-stone-300 shadow-xs'
                        }`}
                      >
                        {file ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      </div>

                      {file ? (
                        <div className="space-y-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold text-stone-900 dark:text-white truncate max-w-sm">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={clearFile}
                              className="p-1 rounded-lg text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                            Ready to verify
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                            Drop your certificate PDF here
                          </h3>
                          <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                            or click to browse from your computer (PDF up to 25 MB)
                          </p>
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
                    {verifying ? 'Verifying certificate...' : 'Verify Certificate'}
                  </Button>
                </div>
              )}

              {/* Mode 2: ID Search */}
              {activeTab === 'id' && (
                <div className="space-y-4">
                  <div className="space-y-2 text-center">
                    <label className="text-xs font-semibold block text-stone-800 dark:text-stone-200">
                      Certificate Reference ID or Student Wallet
                    </label>
                    <div className="relative group max-w-lg mx-auto">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 dark:text-stone-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. CERT-2024-001 or 0x..."
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                        className={`block w-full pl-10 pr-10 py-3 rounded-xl font-mono text-xs transition-all focus:outline-none ${
                          isDark
                            ? 'bg-[#161720] border border-white/[0.12] text-white placeholder-stone-400 focus:border-indigo-400'
                            : 'bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-500 focus:border-indigo-600 focus:bg-white'
                        }`}
                      />
                      {searchTarget && (
                        <button
                          type="button"
                          onClick={() => setSearchTarget('')}
                          className="absolute inset-y-0 right-3 flex items-center text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 font-medium">
                      Enter the ID printed on the certificate or the recipient wallet address.
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
                    {verifying ? 'Searching...' : 'Search Certificate'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div
          className={`w-full max-w-xl mx-auto p-4 rounded-xl border text-xs flex items-center justify-center gap-2.5 text-center ${
            isDark
              ? 'bg-[#121318]/70 border-white/[0.08] text-stone-200'
              : 'bg-white border-stone-200 text-stone-800 shadow-xs'
          }`}
        >
          <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-medium">
            Cryptographic verification is performed locally in your browser. Document files are never uploaded or stored.
          </span>
        </div>
      </main>
    </div>
  );
};

export default VerifyDashboard;
