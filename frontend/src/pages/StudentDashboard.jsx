import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import IPFSService from '../services/ipfs';
import {Share2, Award, Globe, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash, RefreshCw } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI } from '../services/api';
import DetailedCredentialCard from '../components/credential/DetailedCredentialCard';
import StudentStats from '../components/credential/StudentStats';
import Avatar from '../components/shared/Avatar';

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

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const init = async () => {
        try {
           const address = await blockchainService.connectWallet(); 
           if (isMounted.current) {
               setWalletAddress(address);
               if (address) {
                 fetchCredential(address);
               } else {
                 setLoading(false);
               }
           }
        } catch (e) {
           console.log("Wallet not auto-connected", e);
           if (isMounted.current) {
               setLoading(false);
           }
        }
    };
    init();
    return () => { isMounted.current = false; };
  }, [fetchCredential]);

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

      const response = await credentialAPI.getByWalletAddress(targetAddress);
      if (!isMounted.current) return;

      const docs = response.data.credentials || [];
      
      // Calculate Stats
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
      if (isMounted.current) {
          console.error('Error fetching credential:', err);
          setError('Failed to load your credentials. Please ensure your wallet is connected.');
      }
    } finally {
      if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
      }
    }
  }, [walletAddress]);

  const handleShare = useCallback(() => {
    if (!credential || !walletAddress) return;
    const shareUrl = `${window.location.origin}/verify?walletAddress=${walletAddress}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Verification link copied to clipboard!');
  }, [credential, walletAddress]);

  const openIPFSLink = useCallback(() => {
    if (credential?.ipfsCID) {
      window.open(IPFSService.getUrl(credential.ipfsCID), '_blank');
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <LoadingSpinner size="lg" text="Retrieving blockchain records..." />
        </div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none overflow-hidden">
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative z-10">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/[0.08] p-8 md:p-12 backdrop-blur-3xl group"
        >
          {/* Spotlight Effect */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`
            }}
          />

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md cursor-default"
                >
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                     </span>
                     <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Student Vault</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none flex flex-col md:flex-row md:items-center gap-6"
                >
                    <div className="shrink-0 rounded-full p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl">
                        <Avatar 
                            src={user?.avatar} 
                            initials={user?.name} 
                            size="md" 
                            className="ring-0"
                        />
                    </div>
                    <span className="drop-shadow-2xl">Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer">{user?.name?.split(' ')[0] || 'Student'}</span></span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-gray-400 max-w-xl text-lg leading-relaxed"
                >
                    Your decentralized academic record is ready. Manage your on-chain credentials and share them with the world securely.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4"
            >
                <button 
                  onClick={() => fetchCredential(walletAddress, true)}
                  disabled={refreshing}
                  className={`p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : 'hover:scale-105 active:scale-95'}`}
                  title="Refresh Dashboard"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section */}
        {walletAddress && <StudentStats stats={stats} />}

        {/* Error Alert */}
        {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                   <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
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

        {/* Content Area */}
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
            
            {/* Main Credential Card - Takes up majority of space */}
            <div className="lg:col-span-8 space-y-2">
               <div className="flex items-center justify-between px-1">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <Award className="w-5 h-5 text-indigo-400" />
                       Recent Credential
                   </h2>
                   <span className="text-xs font-medium text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">Latest Issue</span>
               </div>
               <DetailedCredentialCard credential={credential} metadata={metadata} />
            </div>

            {/* Sidebar Actions - Right Column */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Quick Actions Card */}
                <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                 className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group/card"
               >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                  
                  <h3 className="text-white font-bold mb-6 flex items-center gap-3 relative z-10">
                     <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover/card:bg-indigo-500/20 transition-colors">
                        <Share2 className="w-4 h-4 text-indigo-400" />
                     </div>
                     Share & Verify
                  </h3>
                  <div className="space-y-3 relative z-10">
                     <Button 
                        onClick={handleShare}
                        icon={Share2}
                        variant="primary"
                        className="w-full justify-center py-4 bg-indigo-600 hover:bg-indigo-500 border-none shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
                     >
                        Copy Verification Link
                     </Button>
                     <Button 
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        variant="outline"
                        className="w-full justify-center py-4 border-white/10 hover:border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
                     >
                        View Original on IPFS
                     </Button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-6 text-center leading-relaxed relative z-10 font-medium">
                     Provide this link to employers or institutions. They can instantly verify the authenticity of this credential on-chain.
                  </p>
               </motion.div>

               {/* Public Profile Status Card */}
                <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                 className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group/card"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-white font-bold flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover/card:bg-purple-500/20 transition-colors">
                        <Globe className="w-4 h-4 text-purple-400" />
                      </div>
                      Public Identity
                    </h3>
                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.1em] border shadow-lg ${
                      user?.preferences?.visibility !== false 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                    }`}>
                      {user?.preferences?.visibility !== false ? 'LIVE' : 'HIDDEN'}
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                      Your verified credentials are {user?.preferences?.visibility !== false ? 'currently visible' : 'currently hidden'} to the public explorer. 
                    </p>
                    
                    <div className="flex flex-col gap-3">
                       <a 
                          href={`/profile/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-gray-200 text-xs font-black rounded-2xl transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                       >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Visit Public Profile
                       </a>
                       <button
                          onClick={() => {
                            const url = `${window.location.origin}/profile/${walletAddress}`;
                            navigator.clipboard.writeText(url);
                            alert('Profile link copied!');
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-2xl transition-all active:scale-[0.98]"
                       >
                          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                          Copy Share Link
                       </button>
                    </div>
                  </div>
               </motion.div>

               {/* Blockchain Proof Card */}
                <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                 className="bg-[#0a0a0a] rounded-[2rem] p-8 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group/card shadow-2xl"
               >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                  
                  <h3 className="text-white font-bold mb-8 flex items-center gap-3 relative z-10">
                     <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover/card:bg-emerald-500/20 transition-colors">
                        <Hash className="w-4 h-4 text-emerald-400" />
                     </div>
                     On-Chain Proof
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                           <span className="text-gray-500 font-black uppercase tracking-[0.2em]">Certificate Hash</span>
                           <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-2 py-1 rounded-md text-[9px] font-black border border-emerald-400/20 shadow-lg shadow-emerald-500/10"><CheckCircle className="w-3 h-3" /> VERIFIED</span>
                        </div>
                        <div className="font-mono text-gray-400 text-[10px] bg-black/60 p-4 rounded-xl border border-white/[0.06] break-all hover:border-indigo-500/30 hover:text-indigo-200 transition-all duration-300 cursor-text selection:bg-indigo-500/30">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] block">IPFS CID</span>
                         <div className="font-mono text-gray-400 text-[10px] bg-black/60 p-4 rounded-xl border border-white/[0.06] break-all cursor-text selection:bg-indigo-500/30 hover:border-indigo-500/30 hover:text-indigo-200 transition-all duration-300">
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

const EmptyState = ({ icon: Icon, title, message }) => (
   <motion.div 
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5, ease: "easeOut" }}
     className="flex flex-col items-center justify-center py-24 px-8 bg-[#0a0a0a] border border-white/[0.06] border-dashed rounded-[2.5rem] text-center backdrop-blur-3xl group relative overflow-hidden"
   >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none"></div>
      <div className="w-24 h-24 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
         <Icon className="w-10 h-10 text-gray-500 group-hover:text-indigo-400 transition-colors" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-4 tracking-tight relative z-10">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-lg font-medium relative z-10">{message}</p>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mb-32 pointer-events-none transition-colors group-hover:bg-indigo-500/10"></div>
   </motion.div>
);

export default StudentDashboard;
