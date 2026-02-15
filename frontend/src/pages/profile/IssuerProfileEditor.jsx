import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api, { userAPI } from '../../services/api';
import { 
    Building, 
    Upload, 
    Trash2,
    CheckCircle,
    Copy,
    Image as ImageIcon,
    Shield,
    FileCheck,
    Edit2,
    Save,
    X,
    ExternalLink,
    Share2,
    Wallet,
    Calendar,
    Activity,
    Mail
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Avatar from '../../components/shared/Avatar';

const IssuerProfileEditor = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
    
    // Form State for Profile Info
    const [formData, setFormData] = useState({
        name: '',
        about: '',
        institutionName: '', // Specific to Issuer
        registrationNumber: '' // Specific to Issuer
    });

    // Branding Assets State
    const [branding, setBranding] = useState({
        logo: '',
        seal: '',
        signature: '',
        logoCID: '',
        sealCID: '',
        signatureCID: ''
    });

    // Initialize Data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                about: user.about || '',
                institutionName: user.issuerDetails?.institutionName || '',
                registrationNumber: user.issuerDetails?.registrationNumber || ''
            });

            const brandingData = user.issuerDetails?.branding || {};
            setBranding({
                logo: brandingData.logo || '',
                seal: brandingData.seal || '',
                signature: brandingData.signature || '',
                logoCID: brandingData.logoCID || '',
                sealCID: brandingData.sealCID || '',
                signatureCID: brandingData.signatureCID || ''
            });
        }
    }, [user]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size exceeds 5MB limit', 'error');
            return;
        }

        setUploading(true);
        const formDataPayload = new FormData();
        formDataPayload.append('avatar', file);

        try {
            const response = await userAPI.uploadAvatar(formDataPayload);
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

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update basic profile info
            const response = await userAPI.updateProfile({
                name: formData.name,
                about: formData.about
                // Note: userAPI.updateProfile might need to support issuerDetails update if backend supports it.
                // Assuming basic profile update here for Name/About. 
                // Institution Name/Reg Number specific handling might be needed if backend separates it.
                // For now, valid fields are name, title, university, about.
                // Issuers might treat "university" as "institution name" or have separate fields.
                // If backend updates issuerDetails via a separate route, we'd need that.
                // Based on context, I'll send name and about.
            });
            
            if (response.data.success) {
                updateUser(response.data.user);
                showNotification('Profile updated successfully', 'success');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Profile update failed', error);
            showNotification(error.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formDataPayload = new FormData();
        const fieldName = type.replace('CID', '');
        formDataPayload.append(fieldName, file);

        try {
            const response = await api.post('/user/branding', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
             
            if (response.data.success) {
                updateUser(response.data.user);
                const newBranding = response.data.user.issuerDetails?.branding || {};
                // Determine if we need to update local branding state directly or if user effect handles it
                // It's safer to rely on the effect but immediate update is good for UX
                setBranding(prev => ({
                    ...prev,
                    [fieldName]: newBranding[fieldName] || '',
                    [type]: newBranding[type] || ''
                }));
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
                setBranding(prev => ({
                    ...prev,
                    [fieldName]: '',
                    [type]: ''
                }));
                showNotification(`${fieldName} removed successfully`, 'success');
            }
        } catch (error) {
            console.error('Delete failed', error);
            showNotification('Failed to remove file', 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyWalletAddress = () => {
        const address = user?.walletAddress || connectedAddress;
        if (address) {
            navigator.clipboard.writeText(address);
            showNotification('Wallet address copied!', 'success');
        }
    };

    return (
      <div className="min-h-screen bg-transparent text-gray-100 pb-20">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-between items-end"
            >
                <div>
                   <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Issuer Profile</h1>
                   <p className="text-gray-400">Manage your institution's public profile and branding assets.</p>
                </div>
                <div className="flex gap-3">
                   {isEditing ? (
                       <>
                           <Button 
                               onClick={() => setIsEditing(false)}
                               variant="danger"
                               icon={X}
                           >
                               Cancel
                           </Button>
                           <Button 
                               onClick={handleSave}
                               loading={loading}
                               className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20"
                               icon={Save}
                           >
                               Save Changes
                           </Button>
                       </>
                   ) : (
                       <Button 
                           onClick={() => setIsEditing(true)}
                           variant="secondary"
                           icon={Edit2}
                       >
                           Edit Profile
                       </Button>
                   )}
                </div>
            </motion.div>

            <div className="space-y-8">
                {/* Profile Hero Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="relative bg-white/[0.03] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl backdrop-blur-xl group"
                >
                    {/* Cover Banner */}
                    <div className="h-56 bg-[#0a0a0a] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-black/80"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                        <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
                    </div>
            
                    <div className="px-8 pb-10 flex flex-col md:flex-row items-start gap-8 -mt-20 relative z-10">
                        {/* Avatar */}
                        <div className="relative group/avatar shrink-0">
                             <Avatar 
                                 src={user?.avatar} 
                                 initials={user?.name} 
                                 size="xl" 
                                 editable={true} 
                                 uploading={uploading} 
                                 onUpload={handleAvatarUpload}
                             />
                             <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md p-1.5 rounded-full ring-4 ring-black/50 border border-white/10 shadow-lg" title="Verified Issuer">
                                <Shield className="w-6 h-6 text-indigo-400 fill-indigo-400/10" />
                             </div>
                        </div>
                
                        {/* Name & Role */}
                        <div className="flex-1 w-full pt-20 md:pt-24 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 w-full max-w-2xl">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Institution Name</label>
                                                <input 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-lg"
                                                    placeholder="Integration Name"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                                {user?.name || "Institution Name"}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md uppercase tracking-wide">
                                                    Verified Issuer
                                                </span>
                                                <span className="text-gray-400 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-medium">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bio Section */}
                                    <div className="pt-2">
                                         {isEditing ? (
                                             <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">About</label>
                                                <textarea 
                                                    value={formData.about}
                                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[100px] resize-none"
                                                    placeholder="Tell us a bit about your institution..."
                                                />
                                             </div>
                                         ) : (
                                             <p className="text-gray-300 leading-relaxed text-lg max-w-3xl">
                                                {user?.about || "No institution description added yet."}
                                             </p>
                                         )}
                                    </div>
                                </div>
                                
                                {/* Actions - Share Only for now since issuers might not have public profile page same way or it's same route */}
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    {user?.walletAddress && (
                                        <a 
                                            href={`/profile/${user.walletAddress}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 text-sm font-bold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)] active:scale-95 duration-200"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Public Profile
                                        </a>
                                    )}
                                    <Button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/profile/${user?.walletAddress}`;
                                            navigator.clipboard.writeText(url);
                                            showNotification('Profile link copied!', 'success');
                                        }}
                                        variant="outline"
                                        icon={Share2}
                                        className="w-full"
                                    >
                                        Share Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
        
                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Branding Assets */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                      className="lg:col-span-2 space-y-6"
                    >
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-indigo-400" />
                            Official Branding Assets
                         </h2>
                         <p className="text-gray-400 text-sm -mt-4 mb-4">Upload your official assets. These are pinned to IPFS for immutable verification and will appear on all issued credentials.</p>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="md:col-span-2">
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
                    </motion.div>

                    {/* Right Column: Institution Stats & Wallet */}
                    <div className="space-y-8">
                        {/* Institution Details */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building className="w-5 h-5 text-purple-400" />
                                Institution Details
                            </h2>

                            <div className="space-y-4">
                                <ProfileCard 
                                    icon={Building}
                                    label="Registration ID"
                                    value={formData.registrationNumber || 'N/A'}
                                    color="text-purple-400"
                                    bg="bg-purple-500/10"
                                    border="border-purple-500/20"
                                />

                                <ProfileCard 
                                    icon={Calendar}
                                    label="Member Since"
                                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                    color="text-amber-400"
                                    bg="bg-amber-500/10"
                                    border="border-amber-500/20"
                                />
                                
                                <ProfileCard 
                                    icon={Activity}
                                    label="Account Status"
                                    value={user?.isActive ? 'Active' : 'Inactive'}
                                    color="text-emerald-400"
                                    bg="bg-emerald-500/10"
                                    border="border-emerald-500/20"
                                />
                            </div>
                        </motion.div>

                        {/* Blockchain Identity */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                          className="space-y-6"
                        >
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-400" />
                                Blockchain Identity
                             </h2>
                             
                             <div className="bg-[#050505] rounded-3xl p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                                 {/* Card Gloss */}
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                                 
                                 <div className="flex justify-between items-start mb-8 relative z-10">
                                     <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                         <Wallet className="w-6 h-6 text-emerald-400" />
                                     </div>
                                     <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                         <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                         Active
                                     </div>
                                 </div>

                                 <div className="space-y-4 relative z-10">
                                     <div>
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Wallet Address</label>
                                         <button 
                                            onClick={copyWalletAddress}
                                            className="w-full text-left group/copy"
                                         >
                                             <div className="font-mono text-sm text-gray-300 break-all bg-black/40 p-4 rounded-xl border border-white/10 group-hover/copy:border-emerald-500/30 group-hover/copy:text-white transition-all flex justify-between items-center">
                                                 <span>{user?.walletAddress || connectedAddress || "Not Connected"}</span>
                                                 <Copy className="w-4 h-4 opacity-0 group-hover/copy:opacity-100 transition-opacity text-emerald-400" />
                                             </div>
                                         </button>
                                     </div>
                                     
                                     <div className="pt-4 border-t border-white/5">
                                         <div className="flex justify-between items-center text-sm">
                                             <span className="text-gray-400">Network</span>
                                             <span className="font-bold text-white flex items-center gap-2">
                                                 <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                 Sepolia Testnet
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};

const ProfileCard = ({ icon: Icon, label, value, color, bg, border }) => (
  <div className="flex items-start space-x-4 p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-md group h-full">
    <div className={`p-3 rounded-xl border transition-colors ${bg} ${border} group-hover:bg-opacity-20`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</h4>
      <p className="text-gray-200 font-bold break-all">{value || 'Not set'}</p>
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
            className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-md group h-full flex flex-col"
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

            <div className="relative flex-1 min-h-[160px] w-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 group/upload overflow-hidden">
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

export default IssuerProfileEditor;
