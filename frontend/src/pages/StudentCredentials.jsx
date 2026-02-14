import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialGrid from '../components/credential/CredentialGrid';
import CredentialDetails from '../components/credential/CredentialDetails';
import { Search, Wallet, Shield, FileText, Filter } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/blockchain';

const StudentCredentials = () => {
    const { user } = useAuth();
    const [credentials, setCredentials] = useState([]);
    const [filteredCredentials, setFilteredCredentials] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCredential, setSelectedCredential] = useState(null);
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
            fetchCredentials();
        } else {
            setLoading(false);
        }
    }, [walletAddress, activeTab]);

    const fetchCredentials = async () => {
        try {
            setLoading(true);
            const response = await credentialAPI.getByWalletAddress(walletAddress);
            let docs = response.data.credentials || [];
            
            if (activeTab !== 'all') {
                docs = docs.filter(doc => doc.type === activeTab);
            }

            setCredentials(docs);
            setFilteredCredentials(docs);
        } catch (error) {
            console.error('Failed to fetch credentials:', error);
            showNotification('Failed to fetch your credentials. Please ensure your wallet is connected.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        const lower = query.toLowerCase();
        const filtered = credentials.filter(cred =>
            cred.studentName.toLowerCase().includes(lower) ||
            (cred.university && cred.university.toLowerCase().includes(lower)) ||
            (cred.certificateHash && cred.certificateHash.toLowerCase().includes(lower))
        );
        setFilteredCredentials(filtered);
    };



    return (
        <div className="min-h-screen bg-transparent text-gray-100 pb-20">


            <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Header & Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div className="relative">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-indigo-500 rounded-full hidden md:block"></div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Academic Records</h1>
                        <p className="text-gray-400 max-w-2xl">View and manage your blockchain-verified certificates and transcripts.</p>
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                    className="space-y-6"
                >
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05] backdrop-blur-sm">
                         
                        {/* Tabs */}
                        <div className="flex p-1 space-x-1 bg-black/20 rounded-xl">
                           {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((tab) => (
                             <button
                               key={tab}
                               onClick={() => setActiveTab(tab)}
                               className={`
                                 px-4 py-2 text-sm font-medium rounded-lg transition-all
                                 ${activeTab === tab 
                                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                   : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}
                               `}
                             >
                               {tab === 'all' ? 'All Records' : tab === 'TRANSCRIPT' ? 'Transcripts' : 'Certificates'}
                             </button>
                           ))}
                        </div>

                        <div className="relative w-full md:w-80 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search credentials..."
                                onChange={(e) => handleSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/[0.05] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all focus:bg-black/40"
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {(!walletAddress) ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center py-24 px-4 bg-white/[0.02] border border-white/[0.06] border-dashed rounded-3xl text-center backdrop-blur-xl"
                            >
                                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 shadow-xl ring-8 ring-white/[0.02]">
                                    <Wallet className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">Connect your wallet to access your decentralized academic vault.</p>
                            </motion.div>
                        ) : (
                            <CredentialGrid
                                credentials={filteredCredentials}
                                onCredentialClick={setSelectedCredential}
                                loading={loading}
                            />
                        )}
                    </div>
                </motion.div>
            </main>

            {selectedCredential && (
                <CredentialDetails
                    isOpen={!!selectedCredential}
                    onClose={() => setSelectedCredential(null)}
                    credential={selectedCredential}
                    onUpdate={() => {
                        fetchCredentials();
                        setSelectedCredential(null);
                    }}
                />
            )}
        </div>
    );
};

export default StudentCredentials;
