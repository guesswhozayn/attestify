import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { User, Mail, Building, Wallet } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const CreateAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    university: '',
    walletAddress: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.university) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/admin/create', formData);
      showNotification('Admin created successfully!', 'success');
      onSuccess(response.data.admin);
      onClose();
      setFormData({ title: '', name: '', email: '', university: '', walletAddress: '' });
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to create admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create an Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Mr. / Mrs."
          />
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            icon={User}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="johndoe@university.com"
            icon={Mail}
            required
          />
          <Input
            label="University"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="Enter university name"
            icon={Building}
            required
          />
        </div>

        <Input
          label="Wallet Address"
          name="walletAddress"
          value={formData.walletAddress}
          onChange={handleChange}
          placeholder="0x12345..."
          icon={Wallet}
        />

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            size="lg"
          >
            Assign new admin
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAdminModal;
