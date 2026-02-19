import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api, { userAPI } from '../../services/api';
import { 
    Building,
    Edit2,
    Shield,
    Share2,
    Wallet,
    Copy,
    Calendar,
    Activity,
    Mail
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Avatar from '../../components/shared/Avatar';
import Input from '../../components/shared/Input';
import { X, Save } from 'lucide-react';

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
        institutionName: '', 
        registrationNumber: '' 
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
            const response = await userAPI.updateProfile({
                name: formData.name,
                about: formData.about
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

    const copyWalletAddress = () => {
        const address = user?.walletAddress || connectedAddress;
        if (address) {
            navigator.clipboard.writeText(address);
            showNotification('Wallet address copied!', 'success');
        }
    };

    return (
      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden relative">
        
        {/* Background Elements */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
            <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-between items-end"
            >
                <div>
                   <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Issuer Profile</h1>
                   <p className="text-gray-400">Manage your institution&apos;s public profile and branding assets.</p>
                </div>
                <div className="flex gap-3">
                   {isEditing ? (
                       <>
                           <Button 
                               onClick={() => setIsEditing(false)}
                               variant="secondary"
                               icon={X}
                           >
                               Cancel
                           </Button>
                           <Button 
                               onClick={handleSave}
                               loading={loading}
                               variant="success"
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
                    {/* Cover Banner Removed */}
                    <div className="h-0 relative overflow-hidden"></div>
            
                    <div className="px-8 pb-10 flex flex-col md:flex-row items-start gap-8 pt-10 relative z-10">
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
                                            <Input 
                                                label="Institution Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                placeholder="Institution Name"
                                                icon={Building}
                                                className="font-bold text-lg"
                                            />
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
                                             <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-4">About</label>
                                                <div className="relative group overflow-hidden">
                                                    <div className="absolute left-0 top-4 w-12 flex justify-center pointer-events-none">
                                                        <Activity className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
                                                    </div>
                                                    <textarea 
                                                        value={formData.about}
                                                        onChange={(e) => setFormData({...formData, about: e.target.value})}
                                                        className="w-full bg-black/40 text-gray-100 pl-12 pr-5 py-3.5 rounded-xl border border-white/10 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-black/60 transition-all duration-200 backdrop-blur-md min-h-[120px] resize-none"
                                                        placeholder="Tell us a bit about your institution..."
                                                    />
                                                </div>
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
                                        <Button 
                                            href={`/issuer/wallet/${user.walletAddress}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            variant="white"
                                            icon={ExternalLink}
                                            className="w-full h-12 rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)]"
                                        >
                                            View Public Profile
                                        </Button>
                                    )}
                                    <Button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/issuer/wallet/${user?.walletAddress}`;
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
                    {/* Main Content Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                         <Button 
                                            onClick={copyWalletAddress}
                                            variant="ghost"
                                            className="w-full !p-0 !bg-transparent !border-none group/copy overflow-visible"
                                         >
                                             <div className="w-full font-mono text-sm text-gray-300 break-all bg-black/40 p-4 rounded-xl border border-white/10 group-hover/copy:border-emerald-500/30 group-hover/copy:text-white transition-all flex justify-between items-center text-left">
                                                 <span>{user?.walletAddress || connectedAddress || "Not Connected"}</span>
                                                 <Copy className="w-4 h-4 opacity-0 group-hover/copy:opacity-100 transition-opacity text-emerald-400" />
                                             </div>
                                         </Button>
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

const ProfileCard = ({ icon: LucideIcon, label, value, color, bg, border }) => (
  <div className="flex items-start space-x-4 p-5 bg-white/[0.02] rounded-2xl border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-md group h-full">
    <div className={`p-3 rounded-xl border transition-colors ${bg} ${border} group-hover:bg-opacity-20`}>
      <LucideIcon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</h4>
      <p className="text-gray-200 font-bold break-all">{value || 'Not set'}</p>
    </div>
  </div>
);

export default IssuerProfileEditor;
