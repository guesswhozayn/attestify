import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { User, Mail, Building, Lock, Wallet, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import blockchainService from '../services/blockchain';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    walletAddress: user?.walletAddress || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sync state with user context if it updates
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        university: user.university || prev.university, // This might be the user's organization
        walletAddress: user.walletAddress || prev.walletAddress
      }));
    }
  }, [user]);

  const handleConnectWallet = async () => {
    try {
      const address = await blockchainService.connectWallet();
      setProfileData(prev => ({ ...prev, walletAddress: address }));
      showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to connect wallet. Please try again.', 'error');
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile', profileData);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    setLoading(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showNotification('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header title="Account Settings" showSearch={false} />

      <main className="p-6 lg:p-10 max-w-5xl mx-auto">
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900/50 p-1 rounded-xl w-fit border border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
              activeTab === 'profile'
                ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profile & Organization
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
              activeTab === 'security'
                ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Personal Details Section */}
              <section className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Personal Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      icon={User}
                      placeholder="e.g. John Doe"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      icon={Mail}
                      placeholder="john@example.com"
                      disabled // Email usually shouldn't be changed easily without verification
                      className="opacity-70 cursor-not-allowed"
                    />
                 </div>
              </section>

              {/* Organization Section */}
              <section className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Organization Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Institute / University Name"
                      value={profileData.university}
                      onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                      icon={Building}
                      placeholder="e.g. State University of Technology"
                    />
                    {/* Placeholder for future org fields like Website/Address */}
                 </div>
              </section>

              {/* Blockchain Section */}
              <section className="space-y-4">
                 <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 flex items-center">
                    Blockchain Connection
                 </h3>
                 <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Connected Wallet Address</label>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="relative flex-1 w-full">
                           <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                           <input 
                              value={profileData.walletAddress || ''}
                              readOnly
                              placeholder="Not connected"
                              className="w-full bg-gray-900 text-gray-300 px-4 py-3 pl-11 rounded-lg border border-gray-700 font-mono text-sm focus:outline-none cursor-default"
                           />
                        </div>
                        <Button
                           onClick={handleConnectWallet}
                           variant="secondary"
                           icon={Wallet}
                           className="whitespace-nowrap w-full md:w-auto justify-center"
                        >
                           {profileData.walletAddress ? 'Change Wallet' : 'Connect Wallet'}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                       This wallet will be used to sign transactions when issuing or revoking credentials.
                    </p>
                 </div>
              </section>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={handleProfileUpdate}
                  loading={loading}
                  size="lg"
                  icon={Save}
                  className="w-full md:w-auto shadow-lg shadow-indigo-500/20"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Change Password</h3>
              
              <div className="space-y-5">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={Lock}
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      icon={Lock}
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      icon={Lock}
                      placeholder="••••••••"
                    />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handlePasswordChange}
                  loading={loading}
                  size="lg"
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
