import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { Lock, ShieldCheck, KeyRound, Cpu } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { userAPI } from '../services/api';

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
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white pb-20">
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Manage your password, account security, and active sessions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
              <span>Signed in</span>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,24,40,0.02)] relative overflow-hidden">
            <div className="space-y-6 max-w-2xl relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-center text-stone-700">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">Change Password</h3>
                  <p className="text-xs text-stone-500">Update your account credentials to keep your profile secure.</p>
                </div>
              </div>

              <div className="grid gap-5">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  icon={Lock}
                  placeholder="••••••••"
                />

                <div className="h-px bg-[#F2F4F7] w-full"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              <div className="pt-3 border-t border-[#F2F4F7]">
                <Button
                  onClick={handlePasswordChange}
                  loading={loading}
                  size="md"
                  variant="primary"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>

          {/* Security Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SecurityInfoCard
              icon={ShieldCheck}
              label="Encryption"
              value="AES-256"
              status="Active"
              isSuccess={true}
            />
            <SecurityInfoCard
              icon={Lock}
              label="Session"
              value="Signed JWT"
              status="Verified"
              isSuccess={true}
            />
            <SecurityInfoCard
              icon={Cpu}
              label="Network"
              value="Sepolia RPC"
              status="Operational"
              isSuccess={true}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const SecurityInfoCard = ({ icon: Icon, label, value, status, isSuccess }) => (
  <div className="p-5 bg-white border border-[#EAECF0] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.02)] flex flex-col justify-between hover:border-stone-300 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="w-7 h-7 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-center text-stone-700">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={`text-xs font-medium ${
        isSuccess ? 'text-emerald-700' : 'text-stone-500'
      }`}>
        {status}
      </span>
    </div>
    <div>
      <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</h4>
      <p className="text-stone-900 font-bold text-base tracking-tight font-mono mt-0.5">{value}</p>
    </div>
  </div>
);

export default Settings;
