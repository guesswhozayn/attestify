import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import { getIpfsUrl } from '../services/ipfs';
import { Share2, Award, Globe, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI, userAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import CredentialCard from '../components/credential/CredentialCard';
import StudentStats from '../components/credential/StudentStats';
import HeroCard from '../components/shared/HeroCard';
import EmptyState from '../components/shared/EmptyState';

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const [credential, setCredential] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, sbtCount: 0, uniqueIssuers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);

  const metadata = useMemo(() => {
    if (!credential) return null;
    return credential.type === 'TRANSCRIPT' ? credential.transcriptData : credential.certificationData;
  }, [credential]);

  const welcomeTitle = (
    <>
      Welcome,{' '}
      <span className="text-stone-900 font-bold">
        {user?.name?.split(' ')[0] || 'Student'}
      </span>
    </>
  );

  const fetchCredential = useCallback(async (address, isRefresh = false) => {
    const targetAddress = address || walletAddress;
    if (!targetAddress) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      setError('');

      if (user?.walletAddress && targetAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        setError(`Wallet mismatch: Connected (${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}) does not match your account wallet (${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}).`);
        setCredential(null);
        return;
      }

      const response = await credentialAPI.getByWalletAddress(targetAddress);
      const docs = response.data.credentials || [];
      const total = docs.length;
      const revokedCount = docs.filter(d => d.isRevoked).length;
      setStats({
        total,
        active: total - revokedCount,
        sbtCount: docs.filter(d => !!d.tokenId).length,
        uniqueIssuers: new Set(docs.map(d => d.university || d.issuedBy?.name)).size
      });
      setCredential(docs[0] || null);
    } catch (err) {
      console.error('Error fetching credential:', err);
      if (err.response?.status === 403) {
        setError('Unauthorized: You do not have permission to view credentials for this wallet.');
      } else {
        setError('Failed to load credentials for this wallet.');
      }
      setCredential(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [walletAddress, user]);

  useEffect(() => {
    let mounted = true;
    if (typeof window.ethereum === 'undefined') {
      setLoading(false);
      return;
    }

    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (!mounted) return;
        const address = accounts?.[0] || null;
        setWalletAddress(address);
        if (address) {
          fetchCredential(address);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const handleAccountsChanged = (accounts) => {
      const address = accounts?.[0] || null;
      setWalletAddress(address);
      if (address) {
        fetchCredential(address);
      } else {
        setCredential(null);
        setError('');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      mounted = false;
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [fetchCredential]);

  const handleShare = useCallback(() => {
    if (!credential || !walletAddress) return;
    const shareUrl = `${window.location.origin}/verify?walletAddress=${walletAddress}`;
    navigator.clipboard.writeText(shareUrl);
    showNotification('Verification link copied to clipboard', 'success');
  }, [credential, walletAddress, showNotification]);

  const openIPFSLink = useCallback(() => {
    if (credential?.ipfsCID) {
      window.open(getIpfsUrl(credential.ipfsCID), '_blank');
    }
  }, [credential]);

  const handleConnect = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const address = await blockchainService.connectWallet();
      setWalletAddress(address);

      if (!user?.walletAddress) {
        try {
          const res = await userAPI.updateProfile({ walletAddress: address });
          if (res.data?.success && res.data?.user) updateUser(res.data.user);
        } catch {
          // ignore profile link error
        }
      }

      fetchCredential(address);
    } catch (err) {
      const msg = err.message || 'Failed to connect wallet';
      setError(msg);
      showNotification(msg, 'error');
      setLoading(false);
    }
  }, [user, updateUser, fetchCredential, showNotification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <LoadingSpinner size="lg" text="Loading credentials..." />
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white overflow-x-hidden font-sans relative pb-20">
            <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6 relative z-10">

        <HeroCard
          badge="Student portal"
          title={welcomeTitle}
          onRefresh={() => fetchCredential(walletAddress, true)}
          refreshing={refreshing}
        />

        {walletAddress && <StudentStats stats={stats} />}

        {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                   <ShieldAlert className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-rose-800 font-medium">{error}</span>
              </div>
              {(error.includes('Wallet mismatch') || error.includes('Unauthorized') || walletAddress) && (
                <Button onClick={() => { setWalletAddress(null); setError(''); }} variant="secondary" size="sm" className="shadow-xs text-xs">
                  Disconnect
                </Button>
              )}
            </motion.div>
        )}

        {!walletAddress ? (
           <EmptyState
             icon={Wallet}
             title="Wallet not connected"
             message="Connect your wallet to view your credentials."
           >
             <Button
               onClick={handleConnect}
               icon={Wallet}
               variant="primary"
               size="sm"
             >
               Connect
             </Button>
           </EmptyState>
        ) : !credential ? (
           <EmptyState
             icon={FileText}
             title="No credentials found"
             message="You have not received any credentials yet. Once an institution issues one to your wallet, it will appear here."
           />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >

            <div className="lg:col-span-8 space-y-4">
               <div className="flex items-center justify-between px-1">
                   <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                       <Award className="w-4 h-4 text-stone-700" />
                       Recent certificate
                   </h2>
                   <span className="text-xs text-stone-400 font-normal">Most recent</span>
               </div>
               <CredentialCard credential={credential} metadata={metadata} />
            </div>

            <div className="lg:col-span-4 space-y-5">

                <motion.div
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                 className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] relative overflow-hidden group/card"
               >
                  <h3 className="text-stone-900 font-bold mb-4 flex items-center gap-2.5 relative z-10 text-left text-sm">
                     <div className="w-7 h-7 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-center text-stone-700">
                        <Share2 className="w-3.5 h-3.5" />
                     </div>
                     Share certificate
                  </h3>
                  <div className="space-y-2.5 relative z-10 text-left">
                     <Button
                        onClick={handleShare}
                        icon={Share2}
                        variant="primary"
                        className="w-full justify-center"
                     >
                        Copy link
                     </Button>
                      <Button
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        variant="outline"
                        className="w-full justify-center"
                     >
                        View file
                     </Button>
                  </div>
                  <p className="text-xs text-stone-500 mt-4 text-center leading-relaxed relative z-10 font-normal">
                     Send this link to anyone who needs to confirm your certificate.
                  </p>
               </motion.div>

                <motion.div
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
                 className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] relative overflow-hidden group/card"
               >
                  <h3 className="text-stone-900 font-bold mb-4 flex items-center gap-2.5 relative z-10 text-left text-sm">
                     <div className="w-7 h-7 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-center text-stone-700">
                        <Hash className="w-3.5 h-3.5" />
                     </div>
                     Certificate record
                  </h3>

                  <div className="space-y-4 relative z-10 text-left">
                     <div className="space-y-1.5">
                         <div className="flex justify-between items-center text-xs text-stone-600 px-0.5 font-medium">
                            <span>Certificate ID</span>
                            <span className="text-emerald-700 flex items-center gap-1 text-xs font-medium">
                               <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                         </div>
                        <div className="font-mono text-stone-700 text-[11px] bg-[#F8F9FA] p-3 rounded-xl border border-stone-200/80 break-all hover:border-stone-400 transition-colors cursor-text selection:bg-stone-200 text-left leading-relaxed">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-1.5">
                         <span className="text-stone-600 text-xs font-medium block text-left px-0.5">File storage reference</span>
                         <div className="font-mono text-stone-700 text-[11px] bg-[#F8F9FA] p-3 rounded-xl border border-stone-200/80 break-all cursor-text selection:bg-stone-200 hover:border-stone-400 transition-colors text-left leading-relaxed">
                           {credential.ipfsCID}
                        </div>
                     </div>
                  </div>
                </motion.div>

            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
