import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';
import IPFSService from '../services/ipfs';
import { Download, Share2, Award, Calendar, ExternalLink, ShieldAlert } from 'lucide-react';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.studentId) {
      fetchCredential();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Get credential from blockchain
      const cred = await blockchainService.getCredential(user.studentId);
      
      if (!cred || cred.certificateHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        // No credential found
        setCredential(null);
      } else {
        setCredential(cred);
        
        // 2. Fetch metadata from IPFS
        if (cred.ipfsCID) {
          const meta = await IPFSService.fetchJSON(cred.ipfsCID);
          setMetadata(meta);
        }
      }
    } catch (err) {
      console.error('Error fetching credential:', err);
      setError('Failed to load your credential. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!credential || !metadata) return;
    
    // Generate a shareable link (mock for now, or use a specific verification route)
    const shareUrl = `${window.location.origin}/verify?studentId=${user.studentId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Verification link copied to clipboard!');
  };

  const openIPFSLink = () => {
    if (credential?.ipfsCID) {
      window.open(IPFSService.getUrl(credential.ipfsCID), '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Student Dashboard" showSearch={false} />
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="Loading your credentials..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="My Credentials" showSearch={false} />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.name || 'Student'}</h2>
          <p className="text-gray-400">
            View and manage your blockchain-verified academic credentials
          </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
        )}

        {!user?.studentId ? (
           <div className="bg-gray-800 rounded-2xl p-12 text-center">
             <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
               <Award className="w-8 h-8 text-gray-500" />
             </div>
             <h3 className="text-xl font-semibold text-white mb-2">No Student ID Linked</h3>
             <p className="text-gray-400 max-w-md mx-auto">
               Your profile is not yet linked to a Student ID. Please contact your institute administrator.
             </p>
           </div>
        ) : !credential ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Credentials Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You haven't been issued any blockchain credentials yet. Once issued, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Award className="w-64 h-64" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center space-x-3 mb-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${credential.isRevoked ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                     {credential.isRevoked ? 'Revoked' : 'Verified Valid'}
                   </span>
                   <span className="text-indigo-200 text-sm flex items-center">
                     <Calendar className="w-4 h-4 mr-1" />
                     Issued {credential.issuedAt.toLocaleDateString()}
                   </span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                   {metadata?.degreeName || 'Academic Degree'}
                 </h1>
                 <p className="text-xl text-indigo-200">
                   {metadata?.university || user?.university || 'University Name'}
                 </p>
               </div>
            </div>

            {/* Certificate Body */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Student Name</h4>
                    <p className="text-xl text-white font-semibold">{metadata?.studentName || user?.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                       <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Student ID</h4>
                       <p className="text-lg text-white">{user.studentId}</p>
                     </div>
                     <div>
                       <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">GPA / Grade</h4>
                       <p className="text-lg text-white">{metadata?.gpa || 'N/A'}</p>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Major / Field</h4>
                     <p className="text-lg text-white">{metadata?.major || 'General Studies'}</p>
                  </div>

                  {credential.isRevoked && (
                    <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg">
                      <h4 className="text-red-400 font-bold flex items-center mb-1">
                        <ShieldAlert className="w-5 h-5 mr-2" />
                        Certificate Revoked
                      </h4>
                      <p className="text-red-300/80 text-sm">
                        This certificate has been revoked by the issuing institution and is no longer valid.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions & Metadata */}
                <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8 flex flex-col space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Actions</h4>
                  
                  <Button 
                    onClick={handleShare}
                    icon={Share2}
                    className="w-full justify-center"
                    variant="primary"
                  >
                    Share Certificate
                  </Button>

                  <Button 
                    onClick={openIPFSLink}
                    icon={ExternalLink}
                    variant="outline"
                    className="w-full justify-center"
                  >
                    View on IPFS
                  </Button>

                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Blockchain Metadata</h4>
                    <div className="space-y-3">
                       <div>
                         <span className="text-xs text-gray-600 block mb-1">Certificate Hash</span>
                         <code className="block bg-gray-900 p-2 rounded text-xs text-gray-400 break-all font-mono">
                           {credential.certificateHash}
                         </code>
                       </div>
                       <div>
                         <span className="text-xs text-gray-600 block mb-1">IPFS CID</span>
                         <code className="block bg-gray-900 p-2 rounded text-xs text-gray-400 break-all font-mono">
                           {credential.ipfsCID}
                         </code>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
