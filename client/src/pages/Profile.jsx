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
      <div className="min-h-screen bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white pb-20">
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto relative z-10 space-y-6">
          <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
          >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                         {isIssuer ? 'Institution Profile' : 'User Profile'}
                     </h1>
                     <p className="text-xs text-stone-500 font-medium mt-0.5">
                       Manage your profile, account details, and connected wallet.
                     </p>
                  </div>
                  <div className="flex gap-2.5">
                     {isEditing ? (
                         <>
                             <Button
                                  onClick={() => setIsEditing(false)}
                                  variant="ghost"
                                  icon={X}
                                  className="text-stone-500 hover:text-stone-900 rounded-xl px-3 py-2 text-xs font-semibold"
                             >
                                  Cancel
                             </Button>
                             <Button
                                  onClick={handleSave}
                                  loading={loading}
                                  variant="primary"
                                  icon={Save}
                                  className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
                             >
                                  Save Changes
                             </Button>
                         </>
                     ) : (
                         <Button
                             onClick={() => setIsEditing(true)}
                             variant="outline"
                             icon={Edit2}
                             className="border-[#EAECF0] bg-white hover:bg-stone-50 text-stone-800 rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs cursor-pointer"
                         >
                             Edit Profile
                         </Button>
                     )}
                  </div>
              </div>

              {/* Main Profile Info Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

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
                          <div className="absolute -bottom-1 -right-1 bg-white border border-stone-200 p-1.5 rounded-xl shadow-xs">
                              {isIssuer ? (
                                  <Shield className="w-4 h-4 text-stone-700" />
                              ) : (
                                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                              )}
                          </div>
                      </div>

                      <div className="flex-1 w-full space-y-5">
                          {isEditing ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2">
                                      {user?.name || (isIssuer ? "Institution" : "Identity")}
                                  </h2>
                                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-600">
                                      <div className="flex items-center gap-1.5">
                                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                                          <span>{user?.email}</span>
                                      </div>
                                      {!isIssuer && user?.title && (
                                          <span className="text-stone-500">• {user.title}</span>
                                      )}
                                  </div>
                              </div>
                          )}

                          <div className="h-px bg-[#F2F4F7] w-full"></div>

                          <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-stone-400" />
                                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Biography & Mission</span>
                              </div>
                              {isEditing ? (
                                  <textarea
                                      value={formData.about}
                                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                                      className="w-full bg-[#F8F9FA] hover:bg-white focus:bg-white text-stone-900 p-3.5 rounded-xl border border-stone-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400 transition-all min-h-[100px] resize-none shadow-2xs"
                                      placeholder="Write a brief description..."
                                  />
                              ) : (
                                  <p className="text-stone-600 leading-relaxed text-xs font-normal max-w-2xl text-center md:text-left">
                                      {user?.about || (isIssuer ? "No description provided yet." : "No biography provided yet.")}
                                  </p>
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Lower Section: Details + Wallet */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Left: Account Details (lg:col-span-8) */}
                  <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center gap-2 px-1">
                          <div className="w-6 h-6 bg-stone-50 border border-stone-200/60 rounded-md flex items-center justify-center text-stone-700">
                              <Shield className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">{isIssuer ? 'Institution Details' : 'Account Details'}</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                  value={isIssuer ? (formData.registrationNumber || 'Verified') : (user?.university || 'Not set')}
                              />
                          )}

                          <ProfileCard
                              icon={Calendar}
                              label="Joined"
                              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric', month: 'short', day: 'numeric'
                              }) : 'Recent'}
                          />

                          <ProfileCard
                              icon={Activity}
                              label="Status"
                              value={user?.isActive ? 'Active' : 'Inactive'}
                          />
                      </div>
                  </div>

                  {/* Right: Wallet Connection Card (lg:col-span-4) */}
                  <div className="lg:col-span-4 space-y-4">
                      <div className="flex items-center gap-2 px-1">
                          <div className="w-6 h-6 bg-stone-50 border border-stone-200/60 rounded-md flex items-center justify-center text-stone-700">
                              <Wallet className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Wallet</h3>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)] space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-stone-900">Status</span>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                                  <span>Connected</span>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <div>
                                  <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">Wallet Address</label>
                                  <button
                                     onClick={copyWalletAddress}
                                     className="w-full text-left group/copy focus:outline-none cursor-pointer"
                                     title="Click to copy address"
                                  >
                                      <div className="w-full font-mono text-xs text-stone-700 break-all bg-[#F8F9FA] hover:bg-white p-3 rounded-xl border border-stone-200/80 hover:border-stone-400 transition-all flex justify-between items-center shadow-2xs">
                                          <span className="flex-1 pr-2 leading-relaxed font-semibold">{user?.walletAddress || connectedAddress || "Not connected"}</span>
                                          <Copy className="w-3.5 h-3.5 opacity-50 group-hover/copy:opacity-100 transition-opacity shrink-0" />
                                      </div>
                                  </button>
                              </div>

                              <div className="pt-3 border-t border-[#F2F4F7] flex justify-between items-center text-xs">
                                  <span className="text-stone-400 font-medium">Network</span>
                                  <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                      <span className="font-semibold text-stone-800">Ethereum (Sepolia)</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </motion.div>
        </main>
      </div>
    );
};

const ProfileCard = ({ icon: LucideIcon, label, value }) => (
  <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)]">
    <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-700 shrink-0">
      <LucideIcon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{label}</h4>
      <p className="text-stone-900 font-bold text-xs truncate mt-0.5">{value || 'Not set'}</p>
    </div>
  </div>
);

export default Profile;
