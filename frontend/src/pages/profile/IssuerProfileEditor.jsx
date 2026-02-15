import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
    Building, 
    Upload, 
    Trash2,
    CheckCircle,
    Copy,
    Image as ImageIcon,
    Shield,
    FileCheck
} from 'lucide-react';
import api, { userAPI, credentialAPI } from '../../services/api';
import blockchainService from '../../services/blockchain';
import Avatar from '../../components/shared/Avatar';

const InputField = ({ label, value, readOnly, icon: Icon }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-300 tracking-wide ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <input 
                value={value || ''} 
                readOnly={readOnly}
                className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 outline-none transition-all duration-300 backdrop-blur-sm ${readOnly ? 'cursor-default text-gray-400' : 'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'}`}
            />
        </div>
    </div>
);

const AssetUploader = ({ title, description, value, onUpload, onRemove, loading }) => {
    let imgSrc = null;
    let isIPFS = false;
    
    if (value) {
        if (value.startsWith('http')) {
            imgSrc = value;
        } else {
            imgSrc = `https://gateway.pinata.cloud/ipfs/${value}`;
            isIPFS = true;
        }
    }

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-md group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-200 decoration-indigo-500/30 underline decoration-2 underline-offset-4">{title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                {value && (
                    <button 
                        onClick={onRemove}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="relative h-40 w-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 group/upload overflow-hidden">
                {imgSrc ? (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img 
                            src={imgSrc} 
                            alt={title} 
                            className="max-w-full max-h-full object-contain drop-shadow-lg opacity-90 group-hover/upload:opacity-100 transition-opacity" 
                        />
                         {isIPFS && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-indigo-300 font-mono border border-indigo-500/30 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> IPFS
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/[0.05] rounded-full group-hover/upload:scale-110 transition-transform duration-300">
                             <Upload className="w-5 h-5 text-gray-400 group-hover/upload:text-indigo-400 transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 group-hover/upload:text-gray-300 transition-colors">Click to upload asset</span>
                    </div>
                )}

                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    onChange={onUpload}
                    disabled={!!value || loading}
                />
            </div>
        </motion.div>
    );
};

const IssuerProfileEditor = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [branding, setBranding] = useState({
      logo: user?.issuerDetails?.branding?.logo || '',
      seal: user?.issuerDetails?.branding?.seal || '',
      signature: user?.issuerDetails?.branding?.signature || '',
      logoCID: user?.issuerDetails?.branding?.logoCID || '',
      sealCID: user?.issuerDetails?.branding?.sealCID || '',
      signatureCID: user?.issuerDetails?.branding?.signatureCID || ''
    });
    const [connectedAddress, setConnectedAddress] = useState('');

    useEffect(() => {
        const detectWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setConnectedAddress(accounts[0]);
                    }
                } catch (err) {
                    console.error('Error detecting wallet:', err);
                }
            }
        };
        detectWallet();
    }, []);
  
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
  
    const handleFileUpload = async (e, type) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setLoading(true);
      const formData = new FormData();
      const fieldName = type.replace('CID', '');
      formData.append(fieldName, file);

      try {
        const response = await api.post('/user/branding', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          updateUser(response.data.user);
          const newBranding = response.data.user.issuerDetails?.branding || {};
          setBranding({
              logo: newBranding.logo || '',
              seal: newBranding.seal || '',
              signature: newBranding.signature || '',
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
        const fieldName = type.replace('CID', '');
        
        try {
            const response = await api.delete(`/user/branding/${fieldName}`);
            if (response.data.success) {
                updateUser(response.data.user);
                const newBranding = response.data.user.issuerDetails?.branding || {};
                setBranding({
                    logo: newBranding.logo || '',
                    seal: newBranding.seal || '',
                    signature: newBranding.signature || '',
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
      <div className="min-h-screen bg-transparent text-gray-100 font-sans pb-20">

        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            
            {/* Header Section */}
            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Issuer Profile</h1>
                <p className="text-gray-400 max-w-2xl">Manage public facing branding assets and verify institutional details. These assets will be used when issuing verifiable credentials.</p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
               className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
                
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-4 space-y-6">
                     <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl shadow-lg">
                        
                        {/* Avatar */}
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="mb-4">
                                <Avatar 
                                    src={user.avatar} 
                                    initials={user.name} 
                                    size="lg" 
                                    editable={true} 
                                    uploading={uploading} 
                                    onUpload={handleAvatarUpload}
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                            <p className="text-sm text-gray-500">Issuer Administrator</p>
                        </div>

                        {/* Read-only Fields */}
                        <div className="space-y-4">
                            <div className="px-3 pb-2 border-b border-white/[0.05] text-xs font-semibold text-indigo-400 uppercase tracking-wider">Details</div>
                            <InputField label="Institution Name" value={user.issuerDetails?.institutionName || user.name} readOnly icon={Building} />
                            <InputField label="Registration ID" value={user.issuerDetails?.registrationNumber} readOnly icon={CheckCircle} />
                            <InputField label="Wallet Address" value={user.walletAddress || connectedAddress} readOnly icon={Copy} />
                        </div>
                     </div>
                </div>

                {/* Right Column: Branding Assets */}
                <div className="lg:col-span-8">
                     <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl shadow-lg h-full">
                        <div className="mb-8 flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <FileCheck className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Branding Assets</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-lg">
                                    Upload your official assets. These are pinned to IPFS for immutable verification and will appear on all issued credentials.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <AssetUploader 
                                title="Institution Logo" 
                                description="Primary identifier on credentials"
                                value={branding.logo || branding.logoCID}
                                onUpload={(e) => handleFileUpload(e, 'logoCID')}
                                onRemove={() => handleFileRemove('logoCID')}
                                loading={loading}
                            />
                            <AssetUploader 
                                title="Official Seal" 
                                description="Watermark for authenticity"
                                value={branding.seal || branding.sealCID}
                                onUpload={(e) => handleFileUpload(e, 'sealCID')}
                                onRemove={() => handleFileRemove('sealCID')}
                                loading={loading}
                            />
                            <div className="sm:col-span-2">
                                <AssetUploader 
                                    title="Authorized Signature" 
                                    description="Digital signature for issuer verification"
                                    value={branding.signature || branding.signatureCID}
                                    onUpload={(e) => handleFileUpload(e, 'signatureCID')}
                                    onRemove={() => handleFileRemove('signatureCID')}
                                    loading={loading}
                                />
                            </div>
                        </div>
                     </div>
                </div>

            </motion.div>
        </main>
      </div>
    );
};

export default IssuerProfileEditor;
