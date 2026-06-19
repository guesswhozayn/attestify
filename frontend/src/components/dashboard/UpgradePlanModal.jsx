import { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Award, Zap, Building2, Shield, CheckCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const UpgradePlanModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user?.issuerDetails?.plan || 'STARTER');

  const plans = [
    {
      id: 'STARTER',
      name: 'Starter',
      icon: Shield,
      desc: 'Up to 5 credentials',
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20'
    },
    {
      id: 'PRO',
      name: 'Pro',
      icon: Zap,
      desc: 'Up to 500 credentials',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      icon: Building2,
      desc: 'Unlimited credentials',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  ];

  const handleUpgrade = async () => {
    if (selectedPlan === user?.issuerDetails?.plan) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const payload = {
        issuerDetails: {
          plan: selectedPlan
        }
      };

      const response = await userAPI.updateProfile(payload);

      if (response.data.success) {
        updateUser(response.data.user);
        showNotification(`Successfully updated plan to ${selectedPlan}`, 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Plan upgrade failed', error);
      showNotification(error.response?.data?.error || 'Failed to update plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Subscription Plan" size="lg">
      <div className="space-y-6">
        <p className="text-gray-400 text-sm text-center mb-6">
          Choose the plan that best fits your institution&apos;s credentialing needs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                selectedPlan === plan.id
                  ? `border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]`
                  : `border-white/10 bg-black/40 hover:border-white/30`
              }`}
            >
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.bg} ${plan.border} border`}>
                <plan.icon className={`w-6 h-6 ${plan.color}`} />
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-xs font-medium">{plan.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t border-white/10 mt-6 gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="white" onClick={handleUpgrade} loading={loading}>
            {selectedPlan === user?.issuerDetails?.plan ? 'Keep Current Plan' : 'Confirm Upgrade'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradePlanModal;
