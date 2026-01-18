import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import AdminList from '../components/admin/AdminList';
import CreateAdminModal from '../components/admin/CreateAdminModal';
import { UserPlus } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/list');
      setAdmins(response.data.admins);
    } catch (error) {
      showNotification('Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        await api.delete(`/admin/${adminId}`);
        setAdmins(prev => prev.filter(admin => admin._id !== adminId));
        showNotification('Admin removed successfully', 'success');
      } catch (error) {
        showNotification('Failed to remove admin', 'error');
      }
    }
  };

  const handleAdminCreated = (newAdmin) => {
    setAdmins(prev => [...prev, newAdmin]);
  };

  return (
    <div className="min-h-screen">
      <Header title="Admin Management" showSearch={false} />

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Manage Administrators</h2>
            <p className="text-gray-400">Add, view, and manage admin accounts</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            icon={UserPlus}
          >
            Add New Admin
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <AdminList admins={admins} onDelete={handleDeleteAdmin} />
        )}
      </div>

      <CreateAdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAdminCreated}
      />
    </div>
  );
};

export default AdminManagement;
