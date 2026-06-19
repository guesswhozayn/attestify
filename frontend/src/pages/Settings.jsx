import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { Lock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { userAPI } from '../services/api';
import AccountLayout from '../components/layout/AccountLayout';

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

    if (passwordData.newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    setLoading(true);
    try {
        await userAPI.changePassword({
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
    <AccountLayout>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >

            <div className="px-2">
                <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Account Settings</h1>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Secure session</p>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/4 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">

              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/2 rounded-full blur-[100px] pointer-events-none group-hover:bg-red-500/5 transition-colors duration-700"></div>

              <div className="space-y-10 max-w-3xl relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Lock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Change Password</h3>
                        <p className="text-zinc-500 text-xs font-medium">Update your account password.</p>
                    </div>
                  </div>

                  <div className="grid gap-8">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      icon={Lock}
                      placeholder="••••••••"
                    />

                    <div className="h-px bg-white/4 w-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                          label="New Password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          icon={Lock}
                          placeholder="••••••••"
                        />
                        <Input
                          label="Confirm Password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          icon={Lock}
                          placeholder="••••••••"
                        />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/4">
                    <Button
                      onClick={handlePasswordChange}
                      loading={loading}
                      size="lg"
                      variant="white"
                      className="w-full md:w-auto px-12 py-4 rounded-full uppercase tracking-widest text-[11px] font-black shadow-xl shadow-white/5"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SecurityInfoCard
                    label="Encryption"
                    value="AES-256"
                    status="Active"
                    color="text-emerald-400"
                />
                <SecurityInfoCard
                    label="Last Update"
                    value="14 days ago"
                    status="Verified"
                    color="text-indigo-400"
                />
                <SecurityInfoCard
                    label="Security"
                    value="Secure"
                    status="Active"
                    color="text-blue-400"
                />
            </div>
        </motion.div>
    </AccountLayout>
  );
};

const SecurityInfoCard = ({ label, value, status, color }) => (
    <div className="p-6 bg-[#0a0a0a] border border-white/4 rounded-3xl hover:border-white/10 transition-colors group">
        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{label}</h4>
        <div className="flex justify-between items-end">
            <p className="text-white font-black tracking-tight">{value}</p>
            <span className={`text-[9px] font-black ${color} opacity-60 group-hover:opacity-100 transition-opacity`}>{status}</span>
        </div>
    </div>
);

export default Settings;
