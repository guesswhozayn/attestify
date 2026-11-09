import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { Lock, KeyRound } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Settings = () => {
  const { showNotification } = useNotification();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      showNotification('Enter your current password', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      showNotification('New password must be different from current password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      showNotification('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-stone-500 font-normal mt-0.5">
              Update your account password.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,24,40,0.02)] max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-center text-stone-700">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900 tracking-tight">Change password</h2>
                <p className="text-xs text-stone-500">Enter your current password and choose a new one.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <Input
                label="Current password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                icon={Lock}
                placeholder="••••••••"
              />

              <div className="h-px bg-[#F2F4F7] w-full" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="New password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  icon={Lock}
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm new password"
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
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
