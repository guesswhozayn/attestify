import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import UploadCertificateModal from '../components/certificate/UploadCertificateModal';
import StatisticsCard from '../components/admin/StatisticsCard';
import { FileText, Users, Shield, TrendingUp } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AdminDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    active: 0,
    revoked: 0,
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await credentialAPI.getAll();
      setCertificates(response.data.credentials);
      setFilteredCertificates(response.data.credentials);
      
      // Calculate stats
      const total = response.data.credentials.length;
      const revoked = response.data.credentials?.filter(c => c.isRevoked).length || 0;
      const active = total - revoked;
      
      setStats({
        total,
        thisMonth: response.data.credentials?.filter(c => {
          const date = new Date(c.createdAt);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0,
        active,
        revoked,
      });
    } catch (error) {
      showNotification('Failed to fetch certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const filtered = certificates.filter(cert =>
      cert.studentName.toLowerCase().includes(query.toLowerCase()) ||
      cert.studentId.toLowerCase().includes(query.toLowerCase()) ||
      cert.university.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCertificates(filtered);
  };

  const handleCertificateUpload = (newCertificate) => {
    setCertificates(prev => [newCertificate, ...prev]);
    setFilteredCertificates(prev => [newCertificate, ...prev]);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        showSearch={true}
        onSearch={handleSearch}
        searchPlaceholder="Search certificates..."
      />

      <div className="p-8">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-8">
          <Button
            onClick={() => setShowUploadModal(true)}
            variant="primary"
          >
            Upload a certificate
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title="Total Certificates"
            value={stats.total}
            icon={FileText}
            trend={12}
            color="green"
          />
          <StatisticsCard
            title="This Month"
            value={stats.thisMonth}
            icon={TrendingUp}
            trend={8}
            color="blue"
          />
          <StatisticsCard
            title="Active"
            value={stats.active}
            icon={Shield}
            color="purple"
          />
          <StatisticsCard
            title="Revoked"
            value={stats.revoked}
            icon={Users}
            color="orange"
          />
        </div>

        {/* Certificates Grid */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">
            All Certificates ({filteredCertificates.length})
          </h2>
        </div>

        <CertificateGrid
          certificates={filteredCertificates}
          onCertificateClick={setSelectedCertificate}
          loading={loading}
        />
      </div>

      {/* Modals */}
      <UploadCertificateModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleCertificateUpload}
      />

      {selectedCertificate && (
        <CertificateDetails
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
          onUpdate={() => {
            fetchCertificates();
            setSelectedCertificate(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
