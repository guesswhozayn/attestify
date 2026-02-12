import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import IPFSService from '../services/ipfs';
import { Download, Share2, Award, Calendar, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI } from '../services/api';
import DetailedCertificateCard from '../components/certificate/DetailedCertificateCard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchCredential = async (address) => {
    try {
      setLoading(true);
      setError('');
      
      const targetAddress = address || walletAddress;

      if (!targetAddress) {
        setLoading(false);
        return;
      }

      // Get from Backend
      try {
        const response = await credentialAPI.getByWalletAddress(targetAddress);
        if (!isMounted.current) return;

        const credentials = response.data.credentials;
        
        if (credentials && credentials.length > 0) {
           // For now, just show the most recent one or allow selection. 
           // Implementation Plan said: fetch multiple, but dashboard is designed for one.
           // Let's pick the first one (sorted by createdAt desc in backend)
           const latestCred = credentials[0];

           setCredential(latestCred);
           setMetadata(latestCred.type === 'TRANSCRIPT' ? latestCred.transcriptData : latestCred.certificationData);
           
        } else {
             setCredential(null);
        }

      } catch (apiError) {
        if (!isMounted.current) return;
        if (apiError.response && apiError.response.status === 404) {
            setCredential(null);
        } else {
            throw apiError;
        }
      }

    } catch (err) {
      if (isMounted.current) {
          console.error('Error fetching credential:', err);
          setError('Failed to load your credential. ' + (err.message || ''));
      }
    } finally {
      if (isMounted.current) {
          setLoading(false);
      }
    }
  };

  const handleShare = () => {
    if (!credential || !walletAddress) return;
    const shareUrl = `${window.location.origin}/verify?walletAddress=${walletAddress}`;
    navigator.clipboard.writeText(shareUrl);
    // You might want to use a toast notification here instead of alert
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
      <div className="min-h-screen bg-gray-950">
        <Header title="Student Dashboard" showSearch={false} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
          <LoadingSpinner size="lg" text="Retrieving blockchain records..." />
        </div>
      </div>
    );
  }

  // --- UI COMPONENTS ---

  const WalletStatus = () => (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border backdrop-blur-md ${
      walletAddress 
        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    }`}>
      <Wallet className="w-4 h-4" />
      <span className="text-sm font-medium">
        {walletAddress 
          ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` 
          : 'Wallet Not Connected'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30 pb-20">
      <Header title="My Credentials" showSearch={false} rightContent={<WalletStatus />} />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-indigo-950 border border-gray-800 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Access your verified academic achievements securely on the blockchain. Your credentials are decentralized and tamper-proof.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-200">{error}</span>
              </div>
              {(error.includes('connect your wallet') || error.includes('Wallet mismatch')) && (
                <Button onClick={handleConnect} icon={Wallet} variant="primary" size="sm">
                  {error.includes('mismatch') ? 'Switch Wallet' : 'Connect Wallet'}
                </Button>
              )}
            </div>
        )}

        {/* Content Area */}
        {!walletAddress ? (
           <EmptyState 
             icon={Wallet}
             title="Wallet Not Connected" 
             message="Please connect your wallet to view your credentials." 
           />
        ) : !credential ? (
           <EmptyState 
             icon={FileText} 
             title="No Credentials Found" 
             message="You haven't been issued any blockchain credentials yet. Once issued, they will appear here." 
           />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Credential Card */}
            <div className="lg:col-span-8 space-y-6">
               <DetailedCertificateCard credential={credential} metadata={metadata} />
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-4 space-y-6">
               
               {/* Quick Actions Card */}
               <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 shadow-xl">
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                     <Share2 className="w-5 h-5 text-indigo-500" />
                     Share & Verify
                  </h3>
                  <div className="space-y-4">
                     <Button 
                        onClick={handleShare}
                        icon={Share2}
                        className="w-full justify-center py-4 bg-indigo-600 hover:bg-indigo-500 border-transparent shadow-lg shadow-indigo-500/20 text-white font-semibold"
                     >
                        Copy Verification Link
                     </Button>
                     <Button 
                        onClick={openIPFSLink}
                        icon={ExternalLink}
                        className="w-full justify-center py-4 bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 font-medium"
                     >
                        View Original on IPFS
                     </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
                     Sharing the link allows 3rd parties to verify the authenticity of this credential directly against the blockchain.
                  </p>
               </div>

               {/* Blockchain Proof Card */}
               <div className="bg-gray-900/80 rounded-3xl p-6 border border-gray-800 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                     <Hash className="w-5 h-5 text-gray-400" />
                     On-Chain Proof
                  </h3>
                  
                  <div className="space-y-5">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-gray-500 font-semibold uppercase">Certificate Hash</span>
                           <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</span>
                        </div>
                        <div className="font-mono text-gray-400 text-xs bg-black/40 p-3 rounded-xl border border-gray-700/50 break-all hover:border-gray-600 transition-colors cursor-text selection:bg-indigo-500/30">
                           {credential.certificateHash}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <span className="text-gray-500 text-xs font-semibold uppercase block">IPFS CID</span>
                         <div className="font-mono text-gray-400 text-xs bg-black/40 p-3 rounded-xl border border-gray-700/50 break-all cursor-text selection:bg-indigo-500/30">
                           {credential.ipfsCID}
                        </div>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, message }) => (
   <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-gray-800/80 rounded-full flex items-center justify-center mb-8 shadow-xl ring-8 ring-gray-800/40">
         <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-lg">{message}</p>
   </div>
);

export default StudentDashboard;
