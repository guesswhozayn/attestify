import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import UploadCertificateModal from '../components/certificate/UploadCertificateModal';
import { Plus, Search, Shield, Filter } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Credentials = () => {
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'TRANSCRIPT', 'CERTIFICATION'
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const isMounted = React.useRef(true);

    useEffect(() => {
        isMounted.current = true;
        fetchCertificates();
        return () => { isMounted.current = false; };
    }, [activeTab]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'all' ? { type: activeTab } : {};
            const response = await credentialAPI.getAll(params);
            
            if (isMounted.current) {
                const docs = response.data.credentials || [];
                setCertificates(docs);
                setFilteredCertificates(docs);
            }
        } catch (error) {
            if (isMounted.current) {
                // Ignore 401 errors likely caused by logout
               if (error.response?.status !== 401) {
                   showNotification('Failed to fetch credentials', 'error');
               }
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleSearch = (query) => {
        const lower = query.toLowerCase();
        const filtered = certificates.filter(cert =>
            cert.studentName.toLowerCase().includes(lower) ||
            (cert.studentWalletAddress && cert.studentWalletAddress.toLowerCase().includes(lower)) ||
            cert.university.toLowerCase().includes(lower)
        );
        setFilteredCertificates(filtered);
    };

    const handleCertificateUpload = (newCertificate) => {
        setCertificates(prev => [newCertificate, ...prev]);
        setFilteredCertificates(prev => [newCertificate, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <Header
                title="Credentials Management"
                showSearch={false} 
                className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50"
            />

            <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Issued Credentials</h1>
                        <p className="text-gray-400 mt-1">Manage and view all certificates and transcripts issued by your institute.</p>
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

                {/* Content Section */}
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         
                        {/* Tabs */}
                        <div className="flex p-1 space-x-1 bg-gray-900/50 rounded-xl border border-gray-800 self-start md:self-auto">
                           {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((tab) => (
                             <button
                               key={tab}
                               onClick={() => setActiveTab(tab)}
                               className={`
                                 px-4 py-2 text-sm font-medium rounded-lg transition-all
                                 ${activeTab === tab 
                                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                   : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                               `}
                             >
                               {tab === 'all' ? 'All' : tab === 'TRANSCRIPT' ? 'Transcripts' : 'Certificates'}
                             </button>
                           ))}
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, wallet or ID..."
                                onChange={(e) => handleSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        <CertificateGrid
                            certificates={filteredCertificates}
                            onCertificateClick={setSelectedCertificate}
                            loading={loading}
                        />
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
                        fetchCertificates();
                        setSelectedCertificate(null);
                    }}
                />
            )}
        </div>
    );
};

export default Credentials;
