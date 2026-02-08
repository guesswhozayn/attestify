import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import IPFSService from '../services/ipfs';
import { Download, Share2, Award, Calendar, ExternalLink, ShieldAlert, Wallet, CheckCircle, GraduationCap, FileText, Hash } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { credentialAPI } from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (user?.registrationNumber) {
        try {
           const address = await blockchainService.connectWallet(); 
           setWalletAddress(address);
        } catch (e) {
           console.log("Wallet not auto-connected", e);
        }
        fetchCredential();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      setError('');
      
      const connectedWallet = await blockchainService.getAccount();
      setWalletAddress(connectedWallet);

      if (user.walletAddress && connectedWallet && connectedWallet.toLowerCase() !== user.walletAddress.toLowerCase()) {
        setError(`Wallet mismatch! Your registered wallet is ${user.walletAddress.substring(0,6)}...${user.walletAddress.substring(38)}, but you are connected with ${connectedWallet.substring(0,6)}...${connectedWallet.substring(38)}.`);
        setLoading(false);
        return;
      }

      // Get from Backend
      try {
        const response = await credentialAPI.getByRegistrationNumber(user.registrationNumber);
        const cred = response.data.credential;
        
        if (cred) {
           // Verify against Blockchain
           const blockchainData = await blockchainService.getCredential(user.registrationNumber);
           
           setCredential({
             ...cred,
             ...blockchainData,
             ipfsCID: cred.ipfsCID || blockchainData.ipfsCID  
           });
           
           setMetadata(cred.type === 'TRANSCRIPT' ? cred.transcriptData : cred.certificationData);
           
        } else {
             setCredential(null);
        }

      } catch (apiError) {
        if (apiError.response && apiError.response.status === 404) {
            setCredential(null);
        } else {
            throw apiError;
        }
      }

    } catch (err) {
      console.error('Error fetching credential:', err);
      setError('Failed to load your credential. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!credential || !user.registrationNumber) return;
    const shareUrl = `${window.location.origin}/verify?registrationNumber=${user.registrationNumber}`;
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
      fetchCredential();
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
        {!user?.registrationNumber ? (
           <EmptyState 
             icon={Award} 
             title="No Registration Number Linked" 
             message="Your profile is not yet linked to a Registration Number. Please contact your institute administrator." 
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
               <div className="group relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-500">
                  
                  {/* Card Header / Banner */}
                  <div className="relative h-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-8 md:p-10 flex flex-col justify-between overflow-hidden">
                     {/* Decorative Elements */}
                     <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                     <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/10">
                              {credential.type === 'TRANSCRIPT' ? <GraduationCap className="w-6 h-6 text-white" /> : <Award className="w-6 h-6 text-white" />}
                           </div>
                           <div className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white tracking-wider uppercase">
                              {credential.type}
                           </div>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm border ${
                           credential.isRevoked 
                             ? 'bg-red-500/20 border-red-500/50 text-red-200' 
                             : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                        }`}>
                           {credential.isRevoked ? (
                              <><ShieldAlert className="w-3.5 h-3.5" /> REVOKED</>
                           ) : (
                              <><CheckCircle className="w-3.5 h-3.5" /> VERIFIED</>
                           )}
                        </div>
                     </div>

                     <div className="relative z-10 mt-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                           {metadata?.degreeName || metadata?.title || 'Credential Title'}
                        </h2>
                        <div className="flex items-center text-indigo-200/80 text-sm font-medium">
                           <Calendar className="w-4 h-4 mr-2" />
                           Issued on {new Date(credential.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                     </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 md:p-10 bg-gray-900">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-10 border-b border-gray-800">
                        <div className="space-y-1">
                           <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Recipient</label>
                           <p className="text-2xl text-white font-semibold tracking-tight">{metadata?.studentName || user?.name}</p>
                           <p className="text-sm text-gray-400 font-mono">{user.registrationNumber}</p>
                        </div>
                        <div className="md:text-right space-y-1">
                           <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Issued By</label>
                           <p className="text-xl text-white font-medium">{metadata?.university || credential.university}</p>
                           <div className="flex md:justify-end">
                              <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                 <CheckCircle className="w-3 h-3 mr-1" /> trusted issuer
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                           <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">GPA/Score</label>
                           <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                              {metadata?.gpa || metadata?.score || 'N/A'}
                           </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Major / Field</label>
                           <p className="text-white font-medium text-lg leading-snug">{metadata?.major || metadata?.department || 'N/A'}</p>
                        </div>
                        {metadata?.admissionYear && (
                           <div>
                              <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Class Of</label>
                              <p className="text-white font-medium text-lg">{metadata?.graduationYear || 'N/A'}</p>
                           </div>
                        )}
                     </div>

                     {credential.isRevoked && (
                        <div className="mt-8 p-6 bg-red-950/30 border border-red-500/20 rounded-2xl flex gap-4">
                           <div className="p-3 bg-red-500/10 rounded-full h-fit">
                              <ShieldAlert className="w-6 h-6 text-red-500" />
                           </div>
                           <div>
                              <h4 className="text-red-400 font-bold mb-2">Revocation Notice</h4>
                              <p className="text-sm text-red-300/80 leading-relaxed">
                                 This credential has been officially revoked by the issuing authority. It is no longer considered valid proof of qualification. Please contact the institution for more details.
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
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
