import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Building, Shield, Lock, FileCheck, Upload, Activity, Wallet, Camera, Edit2, Loader, Trash2 } from 'lucide-react';
import api, { userAPI } from '../../services/api';
import Button from '../../components/shared/Button';

const AdminProfile = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [branding, setBranding] = useState({
      logoCID: user?.instituteDetails?.branding?.logoCID || '',
      sealCID: user?.instituteDetails?.branding?.sealCID || '',
      signatureCID: user?.instituteDetails?.branding?.signatureCID || ''
    });
  
    const [gasBalance, setGasBalance] = useState('0.00');
  
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size exceeds 5MB limit', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await userAPI.uploadAvatar(formData);
            if (response.data.success) {
                updateUser(response.data.user);
                showNotification('Profile picture updated successfully', 'success');
            }
        } catch (error) {
            console.error('Avatar upload failed', error);
            showNotification('Failed to upload profile picture', 'error');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
      if (user?.role === 'INSTITUTE' && user?.instituteDetails?.authorizedWalletAddress) {
          setGasBalance('0.45'); // Mock for now - replace with actual web3 call if available
      }
    }, [user]);
  
    const handleFileUpload = async (e, type) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setLoading(true);
      const formData = new FormData();
      // 'type' comes in as 'logoCID', 'sealCID', etc.
      // The backend expects 'logo', 'seal', 'signature'.
      const fieldName = type.replace('CID', '');
      formData.append(fieldName, file);

      try {
        const response = await api.post('/user/branding', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          updateUser(response.data.user);
          // Update local state to reflect new CIDs immediately
          const newBranding = response.data.user.instituteDetails?.branding || {};
          setBranding({
              logoCID: newBranding.logoCID || '',
              sealCID: newBranding.sealCID || '',
              signatureCID: newBranding.signatureCID || ''
          });
          showNotification(`${fieldName} uploaded successfully`, 'success');
        }
      } catch (error) {
        console.error('Upload failed', error);
        showNotification('Failed to upload file', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleFileRemove = async (type) => {
        if (!window.confirm('Are you sure you want to remove this asset?')) return;

        setLoading(true);
        // type is 'logoCID', backend expects 'logo'
        const fieldName = type.replace('CID', '');
        
        try {
            const response = await api.delete(`/user/branding/${fieldName}`);
            if (response.data.success) {
                updateUser(response.data.user);
                // Update local state
                const newBranding = response.data.user.instituteDetails?.branding || {};
                setBranding({
                    logoCID: newBranding.logoCID || '',
                    sealCID: newBranding.sealCID || '',
                    signatureCID: newBranding.signatureCID || ''
                });
                showNotification(`${fieldName} removed successfully`, 'success');
            }
        } catch (error) {
            console.error('Delete failed', error);
            showNotification('Failed to remove file', 'error');
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 pb-12">
        <Header title="Institute Profile" showSearch={false} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Cover Image & Header */}
          <div className="relative mb-24">
              <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
                  <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl bg-gray-900 border-4 border-gray-950 shadow-2xl flex items-center justify-center overflow-hidden relative">
                          {user.avatar ? (
                               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                              branding.logoCID ? (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl font-bold text-white">
                                      {user.name?.charAt(0)}
                                  </div>
                              ) : (
                                  <Building className="w-12 h-12 text-gray-600" />
                              )
                          )}

                           {/* Upload Overlay */}
                           <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                                {uploading ? (
                                    <Loader className="w-8 h-8 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </label>
                      </div>
                  </div>
                  
                  <div className="mb-4">
                      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                          {user.instituteDetails?.institutionName || user.name}
                          <Shield className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                      </h1>
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                          <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded text-sm font-medium border border-indigo-500/20">
                              Verified Institute
                          </span>
                          <span className="text-gray-600">•</span>
                          <span>{user.email}</span>
                      </p>
                  </div>
              </div>
  
              <div className="absolute -bottom-16 right-8 flex gap-3">
                   <Button variant="outline" className="gap-2">
                       <Edit2 className="w-4 h-4" /> Edit Profile
                   </Button>
              </div>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Identity & Info */}
              <div className="space-y-6">
                   {/* Quick Stats */}
                   <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Overview</h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                      <Wallet className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <p className="text-sm text-gray-400">Gas Balance</p>
                                      <p className="font-semibold text-white">{gasBalance} ETH</p>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                      <FileCheck className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <p className="text-sm text-gray-400">Total Issued</p>
                                      <p className="font-semibold text-white">142</p>
                                  </div>
                              </div>
                          </div>
                           <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                      <Activity className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <p className="text-sm text-gray-400">Last Active</p>
                                      <p className="font-semibold text-white">
                                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Just now'}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
  
                  {/* Institute Details */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Details</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs text-gray-500 block mb-1">Registration Number</label>
                              <div className="flex items-center gap-2 text-gray-200 bg-gray-800/50 p-2.5 rounded-lg border border-gray-800 font-mono text-sm">
                                  <Shield className="w-4 h-4 text-gray-500" />
                                  {user.instituteDetails?.registrationNumber || 'N/A'}
                              </div>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 block mb-1">Authorized Wallet</label>
                              <div className="flex items-center gap-2 text-gray-200 bg-gray-800/50 p-2.5 rounded-lg border border-gray-800 font-mono text-xs break-all">
                                  <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                                  {user.instituteDetails?.authorizedWalletAddress || user.walletAddress || 'N/A'}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              {/* Right Column: Branding Assets */}
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                       <div className="flex items-center justify-between mb-6">
                          <div>
                              <h2 className="text-xl font-bold text-white">Branding Assets</h2>
                              <p className="text-gray-400 text-sm mt-1">Manage your institute's digital assets for certificates.</p>
                          </div>
                          <span className="bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                              3 Assets Required
                          </span>
                       </div>
  
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Logo Upload */}
                          <AssetUploader 
                              title="Institute Logo"
                              description="Used on certificate header"
                              type="logo"
                              cid={branding.logoCID}
                              onUpload={(e) => handleFileUpload(e, 'logoCID')}
                              onRemove={() => handleFileRemove('logoCID')}
                          />
  
                          {/* Seal Upload */}
                          <AssetUploader 
                              title="Official Seal"
                              description="Watermark validation"
                              type="seal"
                              cid={branding.sealCID}
                              onUpload={(e) => handleFileUpload(e, 'sealCID')}
                              onRemove={() => handleFileRemove('sealCID')}
                          />
  
                          {/* Signature Upload */}
                          <AssetUploader 
                              title="Authorized Signature"
                              description="Signatory verification"
                              type="signature"
                              cid={branding.signatureCID}
                              onUpload={(e) => handleFileUpload(e, 'signatureCID')}
                              onRemove={() => handleFileRemove('signatureCID')}
                              className="md:col-span-2"
                          />
                       </div>
                  </div>
              </div>
          </div>
        </main>
      </div>
    );
};

const AssetUploader = ({ title, description, type, cid, onUpload, onRemove, className = "" }) => {
    return (
        <div className={`bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300 group ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                   <h4 className="font-semibold text-white">{title}</h4>
                   <p className="text-xs text-gray-400 mt-1">{description}</p>
                </div>
                {cid && (
                    <div className="flex items-center gap-2">
                         <div className="p-1 bg-green-500/10 rounded-full text-green-400">
                            <FileCheck className="w-4 h-4" />
                         </div>
                         <button 
                            onClick={onRemove}
                            className="p-1 hover:bg-red-500/10 rounded-full text-gray-500 hover:text-red-400 transition-colors"
                            title="Remove asset"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden rounded-lg bg-gray-900/50 border-2 border-dashed border-gray-700 group-hover:border-indigo-500/50 transition-colors h-40 flex items-center justify-center">
                {cid ? (
                    <div className="text-center p-4 w-full relative group/preview">
                        <div className="w-full h-32 flex items-center justify-center mb-1">
                             <img 
                                src={`https://gateway.pinata.cloud/ipfs/${cid}`} 
                                alt={title} 
                                className="max-w-full max-h-full object-contain"
                             />
                        </div>
                         
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                             <p className="text-xs font-mono text-gray-300 bg-black/50 px-2 py-1 rounded">
                                CID: {cid.substring(0, 8)}...
                             </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                             <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-indigo-300 transition-colors">Click to upload</p>
                        <p className="text-xs text-gray-600 mt-1">SVG, PNG or JPG</p>
                    </div>
                )}
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={onUpload}
                    disabled={!!cid} // Disable input if CID matches, user must remove first
                />
            </div>
        </div>
    )
}

export default AdminProfile;
