import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import DetailedCertificateCard from '../components/certificate/DetailedCertificateCard';
import UploadCertificateModal from '../components/certificate/UploadCertificateModal';
import { Plus, LayoutGrid, Search, Shield, Filter, ArrowRight } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [certificates, setCertificates] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch stats and recent 5
            const [allResponse, recentResponse] = await Promise.all([
                 credentialAPI.getAll({ limit: 1 }), // Just to get total count if API doesn't have stats endpoint
                 credentialAPI.getAll({ limit: 3 })
            ]);

            // If we had a dedicated stats endpoint we would use it, but here we can calculate or use pagination data
            const totalDocs = allResponse.data.pagination?.total || 0;
            const recentDocs = recentResponse.data.credentials || [];
            
            // For active/revoked stats, ideally we have a specific endpoint. 
            // Since we don't want to fetch ALL to count them on client side if there are thousands,
            // we will use the stats endpoint if available or just rely on what we have.
            // Let's use the stats endpoint we built earlier!
            try {
                const statsResponse = await credentialAPI.getStats();
                setStats(statsResponse.data.stats);
            } catch (e) {
                // Fallback if stats fail
                setStats({ 
                    total: totalDocs, 
                    active: totalDocs, // Approximation
                    revoked: 0 
                });
            }

            setCertificates(recentDocs);
        } catch (error) {
            showNotification('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCertificateUpload = (newCertificate) => {
        fetchData(); // Refresh all
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <Header
                title="Institute Overview"
                showSearch={false} 
                className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50"
            />

            <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-indigo-950 border border-gray-800 p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium uppercase tracking-wider">
                                <Shield className="w-3 h-3" />
                                <span>Admin Access</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.instituteDetails?.institutionName || user?.name || 'Administrator'}</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                                Manage and issue secure blockchain credentials for your students.
                            </p>
                        </div>
                        
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            variant="primary"
                            icon={Plus}
                            className="shadow-lg shadow-indigo-500/20 py-4 px-6 text-base"
                        >
                            Issue New Credential
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issued</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                        <div className="text-sm text-gray-400">Credentials on blockchain</div>
                    </div>

                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.active}
                        </div>
                        <div className="text-sm text-emerald-500/80 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Valid Credentials
                        </div>
                    </div>

                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                                <Filter className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revoked</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.revoked}
                        </div>
                         <div className="text-sm text-red-500/80 flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            Action Taken
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                           Recent Activity
                        </h2>

                        <Button 
                            variant="outline" 
                            className="text-indigo-300 hover:text-indigo-200 border-gray-800 hover:border-gray-700"
                            onClick={() => navigate('/credentials')}
                        >
                            View All <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <div className="min-h-[200px]">
                        {loading ? (
                             <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                             </div>
                        ) : certificates.length > 0 ? (
                            <div className="space-y-8">
                                {/* Featured (Latest) Credential */}
                                <div>
                                    <h3 className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-4">Latest Issued</h3>
                                    <DetailedCertificateCard 
                                        credential={certificates[0]} 
                                        onClick={() => setSelectedCertificate(certificates[0])} // Optional if we want detailed modal on click? But Detailed card already shows everything.
                                    />
                                </div>
                                
                                {/* List of others if any */}
                                {certificates.length > 1 && (
                                    <div>
                                         <h3 className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-4">Other Recent</h3>
                                         <CertificateGrid
                                            certificates={certificates.slice(1)}
                                            onCertificateClick={setSelectedCertificate}
                                            loading={false}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                                <p className="text-gray-400">No credentials issued yet.</p>
                            </div>
                        )}
                    </div>
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
                        fetchData();
                        setSelectedCertificate(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
