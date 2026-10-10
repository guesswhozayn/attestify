import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import { getIpfsUrl } from '../services/ipfs';
import { Share2, Award, Globe, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import DetailedCredentialCard from '../components/credential/DetailedCredentialCard';
import StudentStats from '../components/credential/StudentStats';
import Avatar from '../components/shared/Avatar';
import WelcomeHeroCard from '../components/shared/WelcomeHeroCard';
import EmptyState from '../components/shared/EmptyState';

const StudentDashboard = () => {
  const { user } = useAuth();
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

  const welcomeAvatar = (
    <Avatar
      src={user?.avatar}
      initials={user?.name}
      size="md"
      className="ring-0"
    />
  );

  const fetchCredential = useCallback(async (address, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError('');

      const targetAddress = address || walletAddress;

      if (!targetAddress) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (user?.walletAddress && targetAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        setError(`Wallet mismatch: Connected (${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}) does not match your account wallet.`);
        setLoading(false);
        setRefreshing(false);
        setCredential(null);
        return;
      }

      const response = await credentialAPI.getByWalletAddress(targetAddress);
      const docs = response.data.credentials || [];

      const total = docs.length;
      const revokedCount = docs.filter(d => d.isRevoked).length;
      const active = total - revokedCount;
      const sbtCount = docs.filter(d => !!d.tokenId).length;
      const uniqueIssuers = new Set(docs.map(d => d.university || d.issuedBy?.name)).size;
      setStats({ total, active, sbtCount, uniqueIssuers });

      setCredential(docs.length > 0 ? docs[0] : null);
    } catch (err) {
      console.error('Error fetching credential:', err);
      if (err.response?.status === 403) {
        setError('Unauthorized: You do not have permission to view credentials for this wallet.');
      } else {
        setError('Failed to load your credentials. Please ensure your wallet is connected.');
      }
      setCredential(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [walletAddress, user]);

  useEffect(() => {
    let mounted = true;
    blockchainService.connectWallet()
      .then(address => {
        if (!mounted) return;
        setWalletAddress(address);
        if (address) {
          fetchCredential(address);
        } else {
          setLoading(false);
        }
      })
      .catch(e => {
        console.log("Wallet not auto-connected", e);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
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
      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      setError('');
      fetchCredential(address);
    } catch (err) {
      console.error("Connection failed:", err);
      setLoading(false);
    }
  }, [fetchCredential]);

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
        <div className="min-h-screen bg-transparent text-stone-900 selection:bg-stone-200 overflow-x-hidden font-sans relative pb-20">
            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative z-10">

        <WelcomeHeroCard
          badge="Student portal"
          title={welcomeTitle}
          avatar={welcomeAvatar}
          onRefresh={() => fetchCredential(walletAddress, true)}
          refreshing={refreshing}
        />

        {walletAddress && <StudentStats stats={stats} />}

        {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                   <ShieldAlert className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-rose-800 font-medium">{error}</span>
              </div>
              {(error.includes('connect your wallet') || error.includes('Wallet mismatch')) && (
                <Button onClick={handleConnect} icon={Wallet} variant="danger" size="sm" className="shadow-xs">
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
           />
        ) : !credential ? (
           <EmptyState
             icon={FileText}
             title="No credentials found"
             message="You have not received any credentials yet. Once an institution issues one to your wallet, it will appear here."
           />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >

            <div className="lg:col-span-8 space-y-4">
               <div className="flex items-center justify-between px-1">
                   <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2.5">
                       <Award className="w-5 h-5 text-stone-700" />
                       Recent credential
                   </h2>
                   <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/80">Latest issue</span>
               </div>
               <DetailedCredentialCard credential={credential} metadata={metadata} />
            </div>

            <div className="lg:col-span-4 space-y-6">

                <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                 className="bg-white rounded-3xl p-7 border border-[#E8E4DC] shadow-[0_4px_20px_-4px_rgba(28,25,23,0.05)] relative overflow-hidden group/card"
               >
                  <h3 className="text-stone-900 font-bold mb-6 flex items-center gap-3 relative z-10 text-left text-base">
                     <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
                        <Share2 className="w-4 h-4" />
                     </div>
                     Share credential
                  </h3>
                  <div className="space-y-3 relative z-10 text-left">
                     <Button
                        onClick={handleShare}
                        icon={Share2}
                        variant="primary"
                        className="w-full justify-center py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm active:scale-[0.99]"
                     >
                        Copy verification link
                     </Button>
                      <Button
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        variant="outline"
                        className="w-full justify-center py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 rounded-xl text-sm font-medium transition-all shadow-xs active:scale-[0.99]"
                     >
                        View original document
                     </Button>
                  </div>
                  <p className="text-xs text-stone-500 mt-5 text-center leading-relaxed relative z-10 font-normal">
                     Send this link to employers or universities so they can verify your credential.
                  </p>
               </motion.div>

                <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                 className="bg-white rounded-3xl p-7 border border-[#E8E4DC] shadow-[0_4px_20px_-4px_rgba(28,25,23,0.05)] relative overflow-hidden group/card"
               >
                  <h3 className="text-stone-900 font-bold mb-6 flex items-center gap-3 relative z-10 text-left text-base">
                     <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
                        <Hash className="w-4 h-4" />
                     </div>
                     Blockchain proof
                  </h3>

                  <div className="space-y-5 relative z-10 text-left">
                     <div className="space-y-2">
                         <div className="flex justify-between items-center text-xs font-semibold text-stone-600 px-0.5">
                            <span>Certificate hash</span>
                            <span className="text-[#25562C] flex items-center gap-1.5 bg-[#EDF5EE] border border-[#CFE6D3] px-2 py-0.5 rounded-full text-[11px] font-medium">
                               <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                         </div>
                        <div className="font-mono text-stone-700 text-[11px] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E4DC] break-all hover:border-stone-400 transition-colors cursor-text selection:bg-stone-200 text-left leading-relaxed">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-2">
                         <span className="text-stone-600 text-xs font-semibold block text-left px-0.5">File storage ID (IPFS)</span>
                         <div className="font-mono text-stone-700 text-[11px] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E4DC] break-all cursor-text selection:bg-stone-200 hover:border-stone-400 transition-colors text-left leading-relaxed">
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
