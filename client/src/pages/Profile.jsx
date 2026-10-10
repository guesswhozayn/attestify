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

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState('');

    const isIssuer = user?.role === 'ISSUER';

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

    const [formData, setFormData] = useState(() => ({
        name: user?.name || '',
        title: user?.title || '',
        university: user?.university || '',
        about: user?.about || '',
        institutionName: user?.issuerDetails?.institutionName || user?.name || '',
        registrationNumber: user?.issuerDetails?.registrationNumber || ''
    }));
    const [prevUser, setPrevUser] = useState(user);

    if (user !== prevUser) {
        setPrevUser(user);
        setFormData({
            name: user?.name || '',
            title: user?.title || '',
            university: user?.university || '',
            about: user?.about || '',
            institutionName: user?.issuerDetails?.institutionName || user?.name || '',
            registrationNumber: user?.issuerDetails?.registrationNumber || ''
        });
    }

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
      <main className="p-6 lg:p-12 max-w-7xl mx-auto relative z-10 text-stone-900">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                   <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                       {isIssuer ? 'Institution profile' : 'User profile'}
                   </h1>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                      <p className="text-xs font-semibold text-stone-500">
                          {isIssuer ? 'Verified institution' : 'Active student account'}
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
                                className="text-stone-500 hover:text-stone-900"
                           >
                                Cancel
                           </Button>
                           <Button
                                onClick={handleSave}
                                loading={loading}
                                variant="primary"
                                icon={Save}
                                className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs"
                           >
                                Save changes
                           </Button>
                       </>
                   ) : (
                       <Button
                           onClick={() => setIsEditing(true)}
                           variant="outline"
                           icon={Edit2}
                           className="border-stone-200 bg-white hover:bg-stone-50 text-stone-800 rounded-xl shadow-2xs"
                       >
                           Edit profile
                       </Button>
                   )}
                </div>
            </div>

            <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-[#E8E4DC] shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)] overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">

                    <div className="relative shrink-0">
                        <Avatar
                            src={user?.avatar}
                            initials={user?.name}
                            size="xl"
                            editable={true}
                            uploading={uploading}
                            onUpload={handleAvatarUpload}
                            className="ring-2 ring-stone-200"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white border border-stone-200 p-2 rounded-xl shadow-sm">
                            {isIssuer ? (
                                <Shield className="w-5 h-5 text-stone-700" />
                            ) : (
                                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label={isIssuer ? "Institution name" : "Display name"}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    icon={isIssuer ? Building : User}
                                />
                                {!isIssuer && (
                                    <Input
                                        label="Academic title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        icon={Award}
                                    />
                                )}
                                {isIssuer && (
                                    <Input
                                        label="Registration number"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                        icon={Shield}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-3">
                                    {user?.name || (isIssuer ? "Institution" : "Identity")}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-full flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                                        <span className="text-xs font-semibold text-stone-700">{user?.email}</span>
                                    </div>
                                    {!isIssuer && user?.title && (
                                        <div className="px-3.5 py-1.5 bg-stone-100 border border-stone-200 rounded-full text-xs font-semibold text-stone-700">
                                             {user.title}
                                         </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-[#E8E4DC] w-full"></div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-stone-400" />
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Biography</span>
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={formData.about}
                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                    className="w-full bg-[#FAF8F5] text-stone-900 p-4 rounded-2xl border border-[#E8E4DC] text-sm focus:outline-none focus:border-stone-400 focus:bg-white transition-all min-h-[120px] resize-none"
                                    placeholder="Write a brief description..."
                                />
                            ) : (
                                <p className="text-stone-600 leading-relaxed font-normal text-base max-w-2xl text-center md:text-left">
                                    {user?.about || (isIssuer ? "No description provided yet." : "No biography provided yet.")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                            <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-stone-900">{isIssuer ? 'Institution details' : 'Account details'}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEditing && !isIssuer ? (
                            <Input
                                label="Institution"
                                value={formData.university}
                                onChange={(e) => setFormData({...formData, university: e.target.value})}
                                icon={Building}
                            />
                        ) : (
                            <ProfileCard
                                icon={Building}
                                label={isIssuer ? "Registration ID" : "Institution"}
                                value={isIssuer ? (formData.registrationNumber || 'None') : (user?.university || 'None')}
                                color="text-stone-700"
                            />
                        )}

                        <ProfileCard
                            icon={Calendar}
                            label="Joined"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'long', day: 'numeric'
                            }) : 'Pending'}
                            color="text-emerald-700"
                        />

                        <ProfileCard
                            icon={Activity}
                            label="Status"
                            value={user?.isActive ? 'Active' : 'Inactive'}
                            color="text-stone-700"
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-stone-900">Wallet connection</h3>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-[#E8E4DC] shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)] space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-stone-100 rounded-xl text-stone-700">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div className="px-3 py-1 bg-[#EDF5EE] border border-[#CFE6D3] rounded-full text-xs font-semibold text-[#25562C] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                                Connected
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-stone-500 block mb-2">Wallet address</label>
                                <button
                                   onClick={copyWalletAddress}
                                   className="w-full text-left group/copy focus:outline-none cursor-pointer"
                                >
                                    <div className="w-full font-mono text-xs text-stone-700 break-all bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E4DC] hover:border-stone-400 transition-all flex justify-between items-center">
                                        <span className="flex-1 pr-3 leading-relaxed font-semibold">{user?.walletAddress || connectedAddress || "Not connected"}</span>
                                        <Copy className="w-4 h-4 opacity-50 group-hover/copy:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-[#E8E4DC] flex justify-between items-center text-xs">
                                <span className="text-stone-500 font-medium">Network</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                    <span className="font-semibold text-stone-800">Sepolia testnet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </main>
    );
};

const ProfileCard = ({ icon: LucideIcon, label, value, color }) => (
  <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E8E4DC] shadow-xs">
    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-stone-700">
      <LucideIcon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0">
      <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{label}</h4>
      <p className="text-stone-900 font-bold text-sm truncate">{value || 'Not set'}</p>
    </div>
  </div>
);

export default Profile;
