import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api';
import { User, Mail, Building, Calendar, Wallet, Shield, Camera, Loader, BadgeCheck, Activity, ExternalLink } from 'lucide-react';

const StudentProfileEditor = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [uploading, setUploading] = useState(false);
  
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

    const ProfileField = ({ icon: Icon, label, value }) => (
      <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors">
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
          <p className="text-gray-200 font-medium break-all">{value || 'Not set'}</p>
        </div>
      </div>
    );
  
    return (
      <div className="min-h-screen bg-gray-950">
        <Header title="My Profile" showSearch={false} />
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
            <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
                    {/* Cover Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900 relative">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    </div>
            
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 relative z-10">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl">
                            <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white max-w-full truncate px-2">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                
                                {/* Upload Overlay */}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    {uploading ? (
                                        <Loader className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
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
                        <div className="absolute -bottom-2 -right-2 bg-gray-900 p-1 rounded-full">
                            <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-gray-900"></div>
                        </div>
                    </div>
            
                    {/* Name & Role */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        {user?.email}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        {user?.role || 'Student'}
                                    </span>
                                    {user?.title && (
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {user.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {user?.walletAddress && (
                                <a 
                                    href={`/profile/${user.walletAddress}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 w-fit"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Public Profile
                                </a>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
        
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField 
                    icon={Building} 
                    label="Institution / University" 
                    value={user?.university} 
                    />
                    <ProfileField 
                    icon={BadgeCheck} 
                    label="Title" 
                    value={user?.title || 'No Title Set'} 
                    />
                    <ProfileField 
                    icon={Wallet} 
                    label="Wallet Address" 
                    value={user?.walletAddress} 
                    />
                    <ProfileField 
                    icon={Calendar} 
                    label="Member Since" 
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'N/A'} 
                    />
                    <ProfileField 
                    icon={Activity} 
                    label="Account Status" 
                    value={user?.isActive ? 'Active' : 'Inactive'} 
                    />
                </div>

                {/* About Section */}
                {user?.about && (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                        <p className="text-gray-300 leading-relaxed">{user.about}</p>
                    </div>
                )}
        
                {/* Security/Trust Badge */}
                <div className="bg-indigo-900/10 rounded-xl p-4 border border-indigo-500/20 flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-full">
                    <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                    <h4 className="text-indigo-200 font-medium">Verified Account</h4>
                    <p className="text-sm text-indigo-400/70">Your identity and credentials are secured on the blockchain.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};
  
export default StudentProfileEditor;
