import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userAPI } from '../services/api';
import { 
    User, 
    Mail, 
    Building, 
    Calendar, 
    Wallet, 
    Shield, 
    BadgeCheck, 
    Activity, 
    ExternalLink,
    Edit2,
    Save,
    X,
    Copy,
    Award
} from 'lucide-react';
import Button from '../components/shared/Button';
import Toggle from '../components/shared/Toggle';
import Avatar from '../components/shared/Avatar';
import Input from '../components/shared/Input';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState('');

    const isIssuer = user?.role === 'ISSUER';

    // Sync connected wallet for display if not set in profile
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
    
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        university: '',
        about: '',
        institutionName: '',
        registrationNumber: ''
    });

    // Initialize/Sync Form Data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                title: user.title || '',
                university: user.university || '',
                about: user.about || '',
                institutionName: user.issuerDetails?.institutionName || user.name || '',
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
        const uploadData = new FormData();
        uploadData.append('avatar', file);

        try {
            const response = await userAPI.uploadAvatar(uploadData);
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
            const payload = {
                name: formData.name,
                about: formData.about
            };

            if (isIssuer) {
                payload.issuerDetails = {
                    institutionName: formData.name, // Usually name is institution name for issuers
                    registrationNumber: formData.registrationNumber,
                    plan: user.issuerDetails?.plan || 'STARTER'
                };
            } else {
                payload.title = formData.title;
                payload.university = formData.university;
            }

            const response = await userAPI.updateProfile(payload);
            
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
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
            >
                <div>
                   <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                       {isIssuer ? 'Institution Profile' : 'My Identity'}
                   </h1>
                   <p className="text-gray-400">
                       {isIssuer 
                        ? 'Manage your institution\'s public profile and branding assets.' 
                        : 'Manage your public academic profile and blockchain identity.'}
                   </p>
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
                  className="relative bg-white/3 rounded-3xl overflow-hidden border border-white/8 shadow-2xl backdrop-blur-xl group"
                >
                    <div className="px-8 pb-10 flex flex-col md:flex-row items-start gap-8 pt-10 relative z-10">
                        {/* Avatar */}
                        <div className="relative group/avatar shrink-0 mx-auto md:mx-0">
                             <Avatar 
                                 src={user?.avatar} 
                                 initials={user?.name} 
                                 size="xl" 
                                 editable={true} 
                                 uploading={uploading} 
                                 onUpload={handleAvatarUpload}
                             />
                             <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md p-1.5 rounded-full ring-4 ring-black/50 border border-white/10 shadow-lg" title={isIssuer ? "Verified Issuer" : "Identity Verified"}>
                                {isIssuer ? (
                                    <Shield className="w-6 h-6 text-indigo-400 fill-indigo-400/10" />
                                ) : (
                                    <BadgeCheck className="w-6 h-6 text-emerald-400 fill-emerald-400/10" />
                                )}
                             </div>
                        </div>
                
                        {/* Name & Role */}
                        <div className="flex-1 w-full pt-4 md:pt-24 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 w-full max-w-2xl text-center md:text-left">
                                    {isEditing ? (
                                        <div className={`grid grid-cols-1 ${!isIssuer ? 'md:grid-cols-2' : ''} gap-4`}>
                                            <div className="space-y-4">
                                                <Input 
                                                    label={isIssuer ? "Institution Name" : "Full Name"}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    placeholder={isIssuer ? "Institution Name" : "Your Name"}
                                                    icon={isIssuer ? Building : User}
                                                    className="font-bold text-lg"
                                                />
                                                {isIssuer && (
                                                    <div className="space-y-2 text-left">
                                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-4">Institution Registered Name</label>
                                                        <Input
                                                            value={formData.registrationNumber}
                                                            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                                            placeholder="Registration Number"
                                                            icon={Building}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {!isIssuer && (
                                                <Input 
                                                    label="Title / Major"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    placeholder="e.g. Computer Science Student"
                                                    icon={Award}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                                {user?.name || (isIssuer ? "Institution Name" : "Student")}
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isIssuer ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'} backdrop-blur-md uppercase tracking-wide`}>
                                                    {isIssuer ? 'Verified Issuer' : 'Verified Student'}
                                                </span>
                                                {!isIssuer && user?.title && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 backdrop-blur-md uppercase tracking-wide">
                                                        {user.title}
                                                    </span>
                                                )}
                                                <span className="text-gray-400 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-medium">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* About Section */}
                                    <div className="pt-2">
                                         {isEditing ? (
                                             <div className="space-y-2 text-left">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-4">About</label>
                                                <div className="relative group overflow-hidden">
                                                    <div className="absolute left-0 top-4 w-12 flex justify-center pointer-events-none">
                                                        <Activity className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
                                                    </div>
                                                    <textarea 
                                                        value={formData.about}
                                                        onChange={(e) => setFormData({...formData, about: e.target.value})}
                                                        className="w-full bg-black/40 text-gray-100 pl-12 pr-5 py-3.5 rounded-xl border border-white/10 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-black/60 transition-all duration-200 backdrop-blur-md min-h-[120px] resize-none"
                                                        placeholder={isIssuer ? "Tell us a bit about your institution..." : "Tell us a bit about yourself..."}
                                                    />
                                                </div>
                                             </div>
                                         ) : (
                                             <p className="text-gray-300 leading-relaxed text-lg max-w-3xl">
                                                {user?.about || (isIssuer ? "No institution description added yet." : "No bio added yet.")}
                                             </p>
                                         )}
                                    </div>
                                </div>
                                                           </div>
                        </div>
                    </div>
                </motion.div>
        
                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Role-specific Details column */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                          className="space-y-6"
                        >
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {isIssuer ? <Building className="w-5 h-5 text-purple-400" /> : <User className="w-5 h-5 text-indigo-400" />}
                                {isIssuer ? "Institution Details" : "Academic Details"}
                             </h2>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {isEditing && !isIssuer ? (
                                     <Input
                                         label="Institution"
                                         value={formData.university}
                                         onChange={(e) => setFormData({...formData, university: e.target.value})}
                                         placeholder="University Name"
                                         icon={Building}
                                     />
                                 ) : (
                                    <ProfileCard 
                                        icon={Building}
                                        label={isIssuer ? "Registration ID" : "Institution"}
                                        value={isIssuer ? (formData.registrationNumber || 'N/A') : user?.university}
                                        color="text-purple-400"
                                        bg="bg-purple-500/10"
                                        border="border-purple-500/20"
                                    />
                                 )}

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

                                <ProfileCard 
                                    icon={Shield}
                                    label="Verification Level"
                                    value={isIssuer ? "Institutional (Tier 1)" : "Level 2 (Verified)"}
                                    color="text-blue-400"
                                    bg="bg-blue-500/10"
                                    border="border-blue-500/20"
                                />

                                {isIssuer && (
                                    <ProfileCard 
                                        icon={Award}
                                        label="Current Plan"
                                        value={user?.issuerDetails?.plan || 'STARTER'}
                                        color="text-indigo-400"
                                        bg="bg-indigo-500/10"
                                        border="border-indigo-500/20"
                                    />
                                )}
                             </div>
                        </motion.div>

                    </div>

                    {/* Blockchain Identity */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                      className="space-y-6"
                    >
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                            Blockchain Identity
                         </h2>
                         
                         <div className="bg-[#050505] rounded-3xl p-6 border border-white/8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
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
                                        className="w-full p-0! bg-transparent! border-none! group/copy overflow-visible"
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
    );
};

const ProfileCard = ({ icon: LucideIcon, label, value, color, bg, border }) => (
  <div className="flex items-start space-x-4 p-5 bg-white/2 rounded-2xl border border-white/6 hover:bg-white/4 hover:border-white/10 transition-all duration-300 backdrop-blur-md group h-full">
    <div className={`p-3 rounded-xl border transition-colors ${bg} ${border} group-hover:bg-opacity-20`}>
      <LucideIcon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</h4>
      <p className="text-gray-200 font-bold break-all">{value || 'Not set'}</p>
    </div>
  </div>
);

export default Profile;
