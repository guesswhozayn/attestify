import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Settings = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    <div className="min-h-screen bg-transparent text-gray-100 pb-20">
      <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
         <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
         >
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Security Settings</h1>
            <p className="text-gray-400">Manage your password and account security.</p>
         </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>

          {/* Security Content */}
          <div className="space-y-8 max-w-2xl relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <Lock className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Change Password</h3>
              </div>
              
              <div className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={Lock}
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="pt-8">
                <Button
                  onClick={handlePasswordChange}
                  loading={loading}
                  size="lg"
                  variant="primary"
                  className="w-full md:w-auto shadow-lg shadow-indigo-500/20 px-8 py-3 rounded-full"
                >
                  Update Password
                </Button>
              </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
