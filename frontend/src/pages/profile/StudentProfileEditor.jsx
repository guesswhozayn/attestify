import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api'; 
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
    Share2,
    Copy,
    Globe
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Avatar from '../../components/shared/Avatar';

const StudentProfileEditor = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        university: '',
        about: '',
        email: '',
        visibility: true
    });

    // Initialize/Sync Form Data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                title: user.title || '',
                university: user.university || '',
                about: user.about || '',
                email: user.email || '',
                visibility: user.preferences?.visibility !== false
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

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await userAPI.updateProfile({
                name: formData.name,
                title: formData.title,
                university: formData.university,
                about: formData.about,
                preferences: {
                    visibility: formData.visibility
                }
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
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
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
                   <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Identity</h1>
                   <p className="text-gray-400">Manage your public academic profile and blockchain identity.</p>
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
                        
                        {/* Animated Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                        {/* Top Right Blob */}
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
                             {/* Online Status / Verification Badge */}
                             <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md p-1.5 rounded-full ring-4 ring-black/50 border border-white/10 shadow-lg" title="Identity Verified">
                                <BadgeCheck className="w-6 h-6 text-emerald-400 fill-emerald-400/10" />
                             </div>
                        </div>
                
                        {/* Name & Role */}
                        <div className="flex-1 w-full pt-20 md:pt-24 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 w-full max-w-2xl">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                                <input 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-lg"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Title / Major</label>
                                                <input 
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                    placeholder="e.g. Computer Science Student"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                                {user?.name || "Student"}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                {user?.role && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md uppercase tracking-wide shadow-[0_0_10px_-2px_rgba(99,102,241,0.2)]">
                                                        {user.role}
                                                    </span>
                                                )}
                                                {user?.title && (
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

                                    {/* Bio Section */}
                                    <div className="pt-2">
                                         {isEditing ? (
                                             <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">About</label>
                                                <textarea 
                                                    value={formData.about}
                                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[100px] resize-none"
                                                    placeholder="Tell us a bit about yourself..."
                                                />
                                             </div>
                                         ) : (
                                             <p className="text-gray-300 leading-relaxed text-lg max-w-3xl">
                                                {user?.about || "No bio added yet."}
                                             </p>
                                         )}
                                    </div>
                                </div>
                                
                                {/* Actions */}
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
                    
                    {/* Public details & settings column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Academic Details */}
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                          className="space-y-6"
                        >
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-400" />
                                Academic Details
                             </h2>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {isEditing ? (
                                     <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2 backdrop-blur-sm">
                                         <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                             <Building className="w-3.5 h-3.5" /> Institution
                                         </label>
                                         <input 
                                            value={formData.university}
                                            onChange={(e) => setFormData({...formData, university: e.target.value})}
                                            className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                                            placeholder="University Name"
                                         />
                                     </div>
                                 ) : (
                                    <ProfileCard 
                                        icon={Building}
                                        label="Institution"
                                        value={user?.university}
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
                                    value="Level 2 (Verified)"
                                    color="text-blue-400"
                                    bg="bg-blue-500/10"
                                    border="border-blue-500/20"
                                />
                             </div>
                        </motion.div>

                        {/* Public Profile Settings */}
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                          className="space-y-6"
                        >
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-purple-400" />
                                Public Profile Settings
                             </h2>

                             <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                                 {/* Gloss */}
                                 <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -ml-16 -mt-16 pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                                 
                                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                     <div className="flex-1">
                                         <h3 className="text-lg font-bold text-white mb-2">Public Visibility</h3>
                                         <p className="text-gray-400 text-sm leading-relaxed">
                                             When enabled, your academic profile and verified credentials will be visible to anyone with your public profile link. Disabling this will hide your profile from the public.
                                         </p>
                                     </div>
                                     
                                     <div className="flex flex-col items-center gap-3">
                                         <button
                                             onClick={() => isEditing && setFormData({...formData, visibility: !formData.visibility})}
                                             disabled={!isEditing}
                                             className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                                                 formData.visibility ? 'bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]' : 'bg-gray-700'
                                             }`}
                                         >
                                             <span
                                                 className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                                                     formData.visibility ? 'translate-x-9' : 'translate-x-1'
                                                 }`}
                                             />
                                         </button>
                                         <span className={`text-[10px] font-black uppercase tracking-widest ${formData.visibility ? 'text-emerald-400' : 'text-gray-500'}`}>
                                             {formData.visibility ? 'LIVE ON-CHAIN' : 'HIDDEN'}
                                         </span>
                                     </div>
                                 </div>
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
                                             <span>{user?.walletAddress || "Not Connected"}</span>
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

export default StudentProfileEditor;
