import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import { getIpfsUrl } from '../services/ipfs';
import { Share2, Award, Globe, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI } from '../services/api';
import DetailedCredentialCard from '../components/credential/DetailedCredentialCard';
import StudentStats from '../components/credential/StudentStats';
import Avatar from '../components/shared/Avatar';
import Background from '../components/shared/Background';
import WelcomeHeroCard from '../components/shared/WelcomeHeroCard';
import EmptyState from '../components/shared/EmptyState';

const StudentDashboard = () => {
  const { user } = useAuth();
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
      <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 dark:from-indigo-300 dark:via-white dark:to-indigo-300 bg-size-[200%_auto] animate-shimmer">
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
      else setLoading(true);
      setError('');

      const targetAddress = address || walletAddress;

      if (!targetAddress) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (user?.walletAddress && targetAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
          setError(`Wallet mismatch: Connected (${targetAddress.slice(0,6)}...${targetAddress.slice(-4)}) does not match your account wallet.`);
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

      if (docs.length > 0) {
         const latestCred = docs[0];
         setCredential(latestCred);
      } else {
           setCredential(null);
      }

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
  }, [walletAddress, user?.walletAddress]);

  useEffect(() => {
    const init = async () => {
        try {
           const address = await blockchainService.connectWallet();
           setWalletAddress(address);
           if (address) {
             fetchCredential(address);
           } else {
             setLoading(false);
           }
        } catch (e) {
           console.log("Wallet not auto-connected", e);
           setLoading(false);
        }
    };
    init();
  }, [fetchCredential]);

  const handleShare = useCallback(() => {
    if (!credential || !walletAddress) return;
    const shareUrl = `${window.location.origin}/verify?walletAddress=${walletAddress}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Verification link copied to clipboard!');
  }, [credential, walletAddress]);

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
          <LoadingSpinner size="lg" text="Retrieving secure records..." />
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">

            <Background />

            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative z-10">

        <WelcomeHeroCard
          badge="Student Vault"
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                   <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                </div>
                <span className="text-red-200 font-medium">{error}</span>
              </div>
              {(error.includes('connect your wallet') || error.includes('Wallet mismatch')) && (
                <Button onClick={handleConnect} icon={Wallet} variant="danger" size="sm" className="shadow-lg shadow-red-500/20">
                  Disconnect
                </Button>
              )}
            </motion.div>
        )}

        {!walletAddress ? (
           <EmptyState
             icon={Wallet}
             title="Wallet Not Connected"
             message="Connect your Ethereum wallet to access your academic credential vault."
           />
        ) : !credential ? (
           <EmptyState
             icon={FileText}
             title="No Credentials Found"
             message="You haven't received any credentials yet. Once issued by an issuer, they will appear here instantly."
           />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >

            <div className="lg:col-span-8 space-y-2">
               <div className="flex items-center justify-between px-1">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <Award className="w-5 h-5 text-indigo-400" />
                       Recent Credential
                   </h2>
                   <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 shadow-sm dark:shadow-none">Latest Issue</span>
               </div>
               <DetailedCredentialCard credential={credential} metadata={metadata} />
            </div>

            <div className="lg:col-span-4 space-y-6">

                <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                 className="bg-[#0a0a0a] rounded-4xl p-8 border border-white/8 shadow-sm dark:shadow-2xl backdrop-blur-xl relative overflow-hidden group/card"
               >
                  <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <h3 className="text-white font-bold mb-6 flex items-center gap-3 relative z-10 text-left">
                     <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover/card:bg-indigo-500/20 transition-colors">
                        <Share2 className="w-4 h-4 text-indigo-400" />
                     </div>
                     Share & Verify
                  </h3>
                  <div className="space-y-3 relative z-10 text-left">
                     <Button
                        onClick={handleShare}
                        icon={Share2}
                        variant="white"
                        className="w-full justify-center py-4 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
                     >
                        Copy Verification Link
                     </Button>
                      <Button
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        variant="outline"
                        className="w-full justify-center py-4 border-white/10 hover:border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
                     >
                        View Original Document
                     </Button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-6 text-center leading-relaxed relative z-10 font-medium">
                     Provide this link to employers or institutions. They can instantly verify the authenticity of this credential.
                  </p>
               </motion.div>

                <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                 className="bg-[#0a0a0a] rounded-4xl p-8 border border-white/8 backdrop-blur-xl relative overflow-hidden group/card shadow-sm dark:shadow-2xl"
               >
                  <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <h3 className="text-white font-bold mb-8 flex items-center gap-3 relative z-10 text-left">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover/card:bg-emerald-500/20 transition-colors">
                        <Hash className="w-4 h-4 text-emerald-400" />
                     </div>
                     On-Chain Proof
                  </h3>

                  <div className="space-y-6 relative z-10 text-left">
                     <div className="space-y-3">
                         <div className="flex justify-between items-center text-[11px] font-bold text-emerald-400/60 px-1">
                            <span>Certificate Hash</span>
                            <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] shadow-sm dark:shadow-lg shadow-emerald-500/10"><CheckCircle className="w-3 h-3" /> Verified</span>
                         </div>
                        <div className="font-mono text-gray-400 text-[10px] bg-black/60 p-4 rounded-xl border border-white/5 break-all hover:border-indigo-500/30 hover:text-indigo-200 transition-all duration-300 cursor-text selection:bg-indigo-500/30 text-left">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-3">
                         <span className="text-gray-500 text-[11px] font-bold block text-left">IPFS CID</span>
                         <div className="font-mono text-gray-400 text-[10px] bg-black/60 p-4 rounded-xl border border-white/5 break-all cursor-text selection:bg-indigo-500/30 hover:border-indigo-500/30 hover:text-indigo-200 transition-all duration-300 text-left">
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
