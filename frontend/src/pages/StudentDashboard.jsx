import React, { useState, useEffect } from 'react';
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
  const [credentials, setCredentials] = useState([]);
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, sbtCount: 0, uniqueIssuers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);

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
  }, []);

  const fetchCredential = async (address, isRefresh = false) => {
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
      setCredentials(docs);
      
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
         setMetadata(latestCred.type === 'TRANSCRIPT' ? latestCred.transcriptData : latestCred.certificationData);
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
  };

  const handleShare = () => {
    if (!credential || !walletAddress) return;
    const shareUrl = `${window.location.origin}/verify?walletAddress=${walletAddress}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Verification link copied to clipboard!');
  };

  const openIPFSLink = () => {
    if (credential?.ipfsCID) {
      window.open(IPFSService.getUrl(credential.ipfsCID), '_blank');
    }
  };

  const handleConnect = async () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">

        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
          <LoadingSpinner size="lg" text="Retrieving blockchain records..." />
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 pb-20">


      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-white/[0.08] p-8 md:p-10 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight flex flex-col md:flex-row md:items-center gap-4"
                >
                    <div className="shrink-0 mb-2 md:mb-0">
                        <Avatar 
                            src={user?.avatar} 
                            initials={user?.name} 
                            size="md" 
                            className="ring-4 ring-indigo-500/20"
                        />
                    </div>
                    <span>Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer">{user?.name?.split(' ')[0] || 'Student'}</span></span>
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
                <Button onClick={handleConnect} icon={Wallet} variant="primary" size="sm" className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/20">
                  {error.includes('mismatch') ? 'Switch Wallet' : 'Connect Wallet'}
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
            <div className="lg:col-span-8 space-y-6">
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
                 className="bg-gray-900/60 rounded-3xl p-6 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2 relative z-10">
                     <Share2 className="w-5 h-5 text-indigo-400" />
                     Share & Verify
                  </h3>
                  <div className="space-y-3 relative z-10">
                     <Button 
                        onClick={handleShare}
                        icon={Share2}
                        variant="primary"
                        className="w-full justify-center py-4 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                     >
                        Copy Verification Link
                     </Button>
                     <Button 
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        variant="outline"
                        className="w-full justify-center py-4 backdrop-blur-md transition-all hover:scale-[1.02]"
                     >
                        View Original on IPFS
                     </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed relative z-10">
                     Provide this link to employers or institutions. They can instantly verify the authenticity of this credential on-chain.
                  </p>
               </motion.div>

               {/* Public Profile Status Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                 className="bg-gray-900/60 rounded-3xl p-6 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      Public Profile
                    </h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border ${
                      user?.preferences?.visibility !== false 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                    }`}>
                      {user?.preferences?.visibility !== false ? 'LIVE' : 'HIDDEN'}
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your verified credentials are {user?.preferences?.visibility !== false ? 'currently visible' : 'currently hidden'} to the public. 
                      You can manage this in your profile settings.
                    </p>
                    
                    <div className="flex flex-col gap-2">
                       <a 
                          href={`/profile/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
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
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl transition-all"
                       >
                          <Share2 className="w-3.5 h-3.5" />
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
                 className="bg-gray-900/60 rounded-3xl p-6 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden"
               >
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                     <Hash className="w-5 h-5 text-emerald-500" />
                     On-Chain Proof
                  </h3>
                  
                  <div className="space-y-5">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-gray-500 font-semibold uppercase tracking-wider">Certificate Hash</span>
                           <span className="text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-400/20"><CheckCircle className="w-3 h-3" /> VERIFIED</span>
                        </div>
                        <div className="font-mono text-gray-400 text-[10px] md:text-xs bg-black/40 p-3 rounded-xl border border-white/[0.06] break-all hover:border-indigo-500/30 hover:text-indigo-200 transition-colors cursor-text selection:bg-indigo-500/30 shadow-inner">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">IPFS CID</span>
                         <div className="font-mono text-gray-400 text-[10px] md:text-xs bg-black/40 p-3 rounded-xl border border-white/[0.06] break-all cursor-text selection:bg-indigo-500/30 hover:border-indigo-500/30 hover:text-indigo-200 transition-colors shadow-inner">
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
     className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.02] border border-white/[0.06] border-dashed rounded-3xl text-center backdrop-blur-xl"
   >
      <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-8 shadow-xl ring-8 ring-white/[0.02]">
         <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-lg">{message}</p>
   </motion.div>
);

export default StudentDashboard;
