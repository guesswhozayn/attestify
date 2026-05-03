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
import Avatar from '../components/shared/Avatar';
import Input from '../components/shared/Input';
import AccountLayout from '../components/layout/AccountLayout';

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
                    institutionName: formData.name,
                    registrationNumber: formData.registrationNumber
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
      <AccountLayout>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <div>
                   <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                       {isIssuer ? 'Institution Profile' : 'User Profile'}
                   </h1>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          {isIssuer ? 'Verified' : 'Active'}
                      </p>
                   </div>
                </div>
                <div className="flex gap-3">
                   {isEditing ? (
                       <>
                           <Button 
                                onClick={() => setIsEditing(false)}
                                variant="ghost"
                                icon={X}
                                className="text-zinc-500 hover:text-white"
                           >
                                Cancel
                           </Button>
                           <Button 
                                onClick={handleSave}
                                loading={loading}
                                variant="success"
                                icon={Save}
                                className="shadow-lg shadow-emerald-500/20"
                           >
                                Save Changes
                           </Button>
                       </>
                   ) : (
                       <Button 
                           onClick={() => setIsEditing(true)}
                           variant="outline"
                           icon={Edit2}
                           className="border-white/5 bg-white/5 hover:bg-white/10"
                       >
                           Edit Profile
                       </Button>
                   )}
                </div>
            </div>

            {/* Profile Hero Card */}
            <div className="relative bg-[#0a0a0a] rounded-4xl p-8 md:p-12 border border-white/4 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/2 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* Avatar Container */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <Avatar 
                            src={user?.avatar} 
                            initials={user?.name} 
                            size="xl" 
                            editable={true} 
                            uploading={uploading} 
                            onUpload={handleAvatarUpload}
                            className="ring-1 ring-white/10"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 p-2 rounded-2xl shadow-xl">
                            {isIssuer ? (
                                <Shield className="w-6 h-6 text-indigo-400" />
                            ) : (
                                <BadgeCheck className="w-6 h-6 text-emerald-400" />
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 w-full space-y-6">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label={isIssuer ? "Institution Name" : "Display Name"}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    icon={isIssuer ? Building : User}
                                />
                                {!isIssuer && (
                                    <Input 
                                        label="Academic Title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        icon={Award}
                                    />
                                )}
                                {isIssuer && (
                                    <Input
                                        label="Registration Number"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                        icon={Shield}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
                                    {user?.name || (isIssuer ? "Institution" : "Identity")}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">{user?.email}</span>
                                    </div>
                                    {!isIssuer && user?.title && (
                                        <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-400 uppercase tracking-widest">
                                            {user.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-white/4 w-full"></div>

                        {/* Bio/About */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-zinc-600" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Biography</span>
                            </div>
                            {isEditing ? (
                                <textarea 
                                    value={formData.about}
                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                    className="w-full bg-white/2 text-zinc-100 p-6 rounded-3xl border border-white/10 text-sm focus:outline-none focus:border-indigo-500/50 transition-all min-h-[150px] resize-none"
                                    placeholder="Write a brief description..."
                                />
                            ) : (
                                <p className="text-zinc-400 leading-relaxed font-medium text-lg max-w-2xl text-center md:text-left">
                                    {user?.about || (isIssuer ? "The institutional profile description is currently empty." : "Your digital identity bio has not been initialized.")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Academic/Institutional Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Shield className={`w-4 h-4 ${isIssuer ? 'text-purple-400' : 'text-indigo-400'}`} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{isIssuer ? 'Institutional Details' : 'Account Details'}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing && !isIssuer ? (
                            <Input
                                label="Learning Institution"
                                value={formData.university}
                                onChange={(e) => setFormData({...formData, university: e.target.value})}
                                icon={Building}
                            />
                        ) : (
                            <ProfileCard 
                                icon={Building}
                                label={isIssuer ? "Registration ID" : "Institution"}
                                value={isIssuer ? (formData.registrationNumber || 'None') : (user?.university || 'None')}
                                color="text-indigo-400"
                            />
                        )}

                        <ProfileCard 
                            icon={Calendar}
                            label="Joined"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'long', day: 'numeric'
                            }) : 'Pending'}
                            color="text-emerald-400"
                        />
                        
                        <ProfileCard 
                            icon={Activity}
                            label="Status"
                            value={user?.isActive ? 'Active' : 'Inactive'}
                            color="text-blue-400"
                        />

                        {isIssuer && (
                            <ProfileCard 
                                icon={Award}
                                label="Plan Tier"
                                value={user?.issuerDetails?.plan || 'STARTER'}
                                color="text-purple-400"
                            />
                        )}
                    </div>
                </div>

                {/* Blockchain Passport Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Wallet Connection</h3>
                    </div>
                    
                    <div className="bg-[#0a0a0a] rounded-4xl p-8 border border-white/4 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                        
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 transition-transform group-hover:scale-110">
                                <Wallet className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                Connected
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Wallet Address</label>
                                <button 
                                   onClick={copyWalletAddress}
                                   className="w-full text-left group/copy focus:outline-none"
                                >
                                    <div className="w-full font-mono text-[11px] text-zinc-400 break-all bg-black p-5 rounded-2xl border border-white/5 group-hover/copy:border-emerald-500/30 group-hover/copy:text-emerald-300 transition-all flex justify-between items-center h-20">
                                        <span className="flex-1 pr-4 leading-relaxed font-bold uppercase">{user?.walletAddress || connectedAddress || "Not Linked"}</span>
                                        <Copy className="w-4 h-4 opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                </button>
                            </div>
                            
                            <div className="pt-6 border-t border-white/4 flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Network</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">Sepolia Testnet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </AccountLayout>
    );
};

const ProfileCard = ({ icon: LucideIcon, label, value, color }) => (
  <div className="flex items-center gap-5 p-6 bg-[#0a0a0a] rounded-4xl border border-white/4 hover:bg-white/2 hover:border-white/10 transition-all duration-300 group">
    <div className={`p-4 rounded-2xl bg-white/2 border border-white/5 transition-all group-hover:scale-110 group-hover:bg-white/5 group-hover:border-white/10`}>
      <LucideIcon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0">
      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">{label}</h4>
      <p className="text-zinc-200 font-black tracking-tight text-sm truncate uppercase">{value || 'NOT_SET'}</p>
    </div>
  </div>
);

export default Profile;
