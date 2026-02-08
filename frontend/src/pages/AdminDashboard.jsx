import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import UploadCertificateModal from '../components/certificate/UploadCertificateModal';
import StatisticsCard from '../components/admin/StatisticsCard';
import { FileText, Users, Shield, TrendingUp, Plus, LayoutGrid, Search } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

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
    const { user } = useAuth(); // For personalization

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await credentialAPI.getAll();
            const docs = response.data.credentials || [];
            setCertificates(docs);
            setFilteredCertificates(docs);

            // Calculate stats
            const total = docs.length;
            const revoked = docs.filter(c => c.isRevoked).length || 0;
            const active = total - revoked;

            setStats({
                total,
                thisMonth: docs.filter(c => {
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
        const lower = query.toLowerCase();
        const filtered = certificates.filter(cert =>
            cert.studentName.toLowerCase().includes(lower) ||
            cert.registrationNumber.toLowerCase().includes(lower) ||
            cert.university.toLowerCase().includes(lower)
        );
        setFilteredCertificates(filtered);
    };

    const handleCertificateUpload = (newCertificate) => {
        setCertificates(prev => [newCertificate, ...prev]);
        setFilteredCertificates(prev => [newCertificate, ...prev]);
        fetchCertificates(); // Re-fetch to update stats correctly
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Header
                title="Admin Dashboard"
                showSearch={true}
                onSearch={handleSearch}
                searchPlaceholder="Search students, reg no..."
            />

            <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                
                {/* Welcome & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Overview
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage issued credentials and view platform analytics.
                        </p>
                    </div>
                     <Button
                        onClick={() => setShowUploadModal(true)}
                        variant="primary"
                        icon={Plus}
                        className="shadow-lg shadow-indigo-500/20"
                    >
                        Issue New
                    </Button>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatisticsCard
                        title="Total Issued"
                        value={stats.total}
                        icon={FileText}
                        trend={12}
                        color="blue"
                    />
                    <StatisticsCard
                        title="Issued This Month"
                        value={stats.thisMonth}
                        icon={TrendingUp}
                        trend={8}
                        color="green" 
                    />
                    <StatisticsCard
                        title="Active Certificates"
                        value={stats.active}
                        icon={Shield}
                        color="purple"
                    />
                    <StatisticsCard
                        title="Revoked"
                        value={stats.revoked}
                        icon={Users} // Users icon might not be perfect, but keeping as requested or finding better
                        color="orange" // Keeping distinct
                    />
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                         <h2 className="text-xl font-semibold flex items-center">
                            <LayoutGrid className="w-5 h-5 mr-2 text-indigo-400" />
                            Recent Certificates
                            <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full">
                                {filteredCertificates.length}
                            </span>
                         </h2>
                         {/* Could add filters here later */}
                    </div>

                    <CertificateGrid
                        certificates={filteredCertificates}
                        onCertificateClick={setSelectedCertificate}
                        loading={loading}
                    />
                </div>
            </main>

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
