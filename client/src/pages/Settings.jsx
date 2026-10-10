import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { Lock } from 'lucide-react';
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
    <main className="p-6 lg:p-12 max-w-7xl mx-auto relative z-10 text-stone-900">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >

            <div className="px-1">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-1">Account settings</h1>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <p className="text-xs font-semibold text-stone-500">Active authenticated session</p>
                </div>
            </div>

            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-8 md:p-12 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)] relative overflow-hidden">
              <div className="space-y-8 max-w-3xl relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-stone-700">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-stone-900 tracking-tight">Change password</h3>
                        <p className="text-stone-500 text-sm">Update your account credentials to keep your profile secure.</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <Input
                      label="Current password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      icon={Lock}
                      placeholder="••••••••"
                    />

                    <div className="h-px bg-[#E8E4DC] w-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="New password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          icon={Lock}
                          placeholder="••••••••"
                        />
                        <Input
                          label="Confirm password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          icon={Lock}
                          placeholder="••••••••"
                        />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8E4DC]">
                    <Button
                      onClick={handlePasswordChange}
                      loading={loading}
                      size="md"
                      variant="primary"
                      className="w-full md:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
                    >
                      Update password
                    </Button>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SecurityInfoCard
                    label="Encryption"
                    value="AES-256"
                    status="Active"
                    color="text-emerald-700"
                />
                <SecurityInfoCard
                    label="Session verification"
                    value="Signed token"
                    status="Verified"
                    color="text-stone-700"
                />
                <SecurityInfoCard
                    label="Security status"
                    value="Protected"
                    status="Operational"
                    color="text-emerald-700"
                />
            </div>
        </motion.div>
      </main>
    );
};

const SecurityInfoCard = ({ label, value, status, color }) => (
    <div className="p-6 bg-white border border-[#E8E4DC] rounded-2xl shadow-[0_2px_12px_-4px_rgba(28,25,23,0.03)] hover:border-stone-400 transition-colors">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{label}</h4>
        <div className="flex justify-between items-end">
            <p className="text-stone-900 font-bold text-lg tracking-tight">{value}</p>
            <span className={`text-xs font-semibold ${color}`}>{status}</span>
        </div>
    </div>
);

export default Settings;
