import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CertificateGrid from '../components/certificate/CertificateGrid';
import CertificateDetails from '../components/certificate/CertificateDetails';
import { Search, Wallet, Shield } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';

const StudentCredentials = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'TRANSCRIPT', 'CERTIFICATION'
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const [walletAddress, setWalletAddress] = useState(user?.walletAddress);

    useEffect(() => {
        const init = async () => {
            if (!walletAddress) {
                try {
                    const address = await blockchainService.connectWallet();
                    setWalletAddress(address);
                } catch (e) {
                    console.log("Wallet not auto-connected", e);
                }
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (walletAddress) {
            fetchCertificates();
        } else {
            setLoading(false);
        }
    }, [walletAddress, activeTab]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            // Fetch credentials by wallet address
            const response = await credentialAPI.getByWalletAddress(walletAddress);
            let docs = response.data.credentials || [];
            
            // Filter by type if not 'all'
            if (activeTab !== 'all') {
                docs = docs.filter(doc => doc.type === activeTab);
            }

            setCertificates(docs);
            setFilteredCertificates(docs);
        } catch (error) {
            console.error('Failed to fetch credentials:', error);
            showNotification('Failed to fetch your credentials. Please ensure your wallet is connected.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        const lower = query.toLowerCase();
        const filtered = certificates.filter(cert =>
            cert.studentName.toLowerCase().includes(lower) ||
            (cert.university && cert.university.toLowerCase().includes(lower)) ||
            (cert.certificateHash && cert.certificateHash.toLowerCase().includes(lower))
        );
        setFilteredCertificates(filtered);
    };

    const WalletStatus = () => (
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border backdrop-blur-md ${
          walletAddress 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">
            {walletAddress 
              ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` 
              : 'Wallet Not Connected'}
          </span>
        </div>
      );

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
            <Header
                title="My Credentials"
                showSearch={false} 
                rightContent={<WalletStatus />}
                className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50"
            />

            <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Your Academic Records</h1>
                        <p className="text-gray-400 mt-1">View and manage your blockchain-verified certificates and transcripts.</p>
                    </div>
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
                                placeholder="Search by name, university..."
                                onChange={(e) => handleSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {(!walletAddress) ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl text-center">
                                <div className="w-24 h-24 bg-gray-800/80 rounded-full flex items-center justify-center mb-8 shadow-xl ring-8 ring-gray-800/40">
                                    <Wallet className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Wallet Not Connected</h3>
                                <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-lg">Please connect your wallet to view your credentials.</p>
                            </div>
                        ) : (
                            <CertificateGrid
                                certificates={filteredCertificates}
                                onCertificateClick={setSelectedCertificate}
                                loading={loading}
                            />
                        )}
                    </div>
                </div>
            </main>

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

export default StudentCredentials;
