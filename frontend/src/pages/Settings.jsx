import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { User, Mail, Building, Lock, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
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

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile', profileData);
      showNotification('Profile updated successfully', 'success');
    } catch {
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
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
    } catch {
      showNotification('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" showSearch={false} />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'profile'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'security'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              <div className="space-y-6">
                <Input
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  icon={User}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  icon={Mail}
                />
                <Input
                  label="University"
                  value={profileData.university}
                  onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                  icon={Building}
                />
                <Input
                  label="Wallet Address"
                  value={profileData.walletAddress}
                  onChange={(e) => setProfileData({ ...profileData, walletAddress: e.target.value })}
                  icon={Wallet}
                />
                <Button
                  onClick={handleProfileUpdate}
                  loading={loading}
                  size="lg"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-gray-900 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>
              <div className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={Lock}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  icon={Lock}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  icon={Lock}
                />
                <Button
                  onClick={handlePasswordChange}
                  loading={loading}
                  size="lg"
                >
                  Change Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
