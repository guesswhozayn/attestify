import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import StudentProfile from '../components/student/StudentProfile';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Building, Shield, Lock, Mail, Upload, Activity, Wallet, FileCheck, User } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    logoCID: user?.instituteDetails?.branding?.logoCID || '',
    sealCID: user?.instituteDetails?.branding?.sealCID || '',
    signatureCID: user?.instituteDetails?.branding?.signatureCID || ''
  });

  const [gasBalance, setGasBalance] = useState('0.00');

  useEffect(() => {
    if (user?.role === 'INSTITUTE' && user?.instituteDetails?.authorizedWalletAddress) {
        setGasBalance('0.45'); // Mock for now
    }
  }, [user]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const mockCID = `Qm${Math.random().toString(36).substring(7)}...`; 
      const updatedBranding = { ...branding, [type]: mockCID };
      setBranding(updatedBranding);

      const response = await api.put('/user/profile', {
        instituteDetails: {
          branding: { ...branding, [type]: mockCID }
        }
      });
      
      if (response.data.success) {
        updateUser(response.data.user);
        showNotification(`${type} uploaded successfully`, 'success');
      }
    } catch (error) {
      console.error('Upload failed', error);
      showNotification('Failed to upload file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isInstitute = user?.role === 'INSTITUTE';

  return (
    <div className="min-h-screen">
      <Header title="My Profile" showSearch={false} />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {isInstitute ? (
            <div className="space-y-6">
              {/* Identity Details */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-500" />
                  Institute Identity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Institution Name</label>
                    <p className="text-white font-medium text-lg">{user.instituteDetails?.institutionName || user.university || user.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Registration Number</label>
                    <p className="text-white font-medium text-lg">{user.instituteDetails?.registrationNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Official Email</label>
                    <p className="text-white font-medium text-lg flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Authorized Wallet</label>
                    <p className="text-white font-medium text-lg flex items-center font-mono">
                      <Lock className="w-4 h-4 mr-2 text-gray-500" />
                      {user.instituteDetails?.authorizedWalletAddress || user.walletAddress || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Gas Balance</h3>
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{gasBalance} ETH</p>
                  <p className="text-xs text-gray-500 mt-1">Sepolia Network</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Last Active</h3>
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-white">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                 <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Issued</h3>
                    <FileCheck className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    142
                  </p>
                </div>
              </div>

              {/* Branding Assets */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-500" />
                  Official Branding Assets
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Logo */}
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-3">Institute Logo</h3>
                    <div className="bg-gray-900 h-40 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors relative group cursor-pointer overflow-hidden">
                        {branding.logoCID ? (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                              <span className="text-green-500 font-bold text-xl">CID Linked</span>
                              <span className="text-xs text-gray-500 mt-2 truncate max-w-[80%]">{branding.logoCID}</span>
                           </div>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm">Upload Logo</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'logoCID')} />
                    </div>
                  </div>

                  {/* Seal */}
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-3">Digital Seal</h3>
                     <div className="bg-gray-900 h-40 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors relative group cursor-pointer overflow-hidden">
                        {branding.sealCID ? (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                              <span className="text-green-500 font-bold text-xl">CID Linked</span>
                              <span className="text-xs text-gray-500 mt-2 truncate max-w-[80%]">{branding.sealCID}</span>
                           </div>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm">Upload Seal</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'sealCID')} />
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-3">Authorized Signature</h3>
                     <div className="bg-gray-900 h-40 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors relative group cursor-pointer overflow-hidden">
                        {branding.signatureCID ? (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                              <span className="text-green-500 font-bold text-xl">CID Linked</span>
                              <span className="text-xs text-gray-500 mt-2 truncate max-w-[80%]">{branding.signatureCID}</span>
                           </div>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm">Upload Signature</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'signatureCID')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StudentProfile />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
