import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import CredentialDetails from '../components/credential/CredentialDetails';
import CredentialTable from '../components/credential/CredentialTable';
import { Search, Wallet, Shield, RefreshCw } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import blockchainService from '../services/blockchain';
import StudentStats from '../components/credential/StudentStats';
import EmptyState from '../components/shared/EmptyState';

const StudentCredentials = () => {
    const { user } = useAuth();
    const [credentials, setCredentials] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, sbtCount: 0, uniqueIssuers: 0 });
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [loading, setLoading] = useState(!!user?.walletAddress);
    const [refreshing, setRefreshing] = useState(false);
    const { showNotification } = useNotification();
    const [walletAddress, setWalletAddress] = useState(user?.walletAddress);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCredentials = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            const response = await credentialAPI.getByWalletAddress(walletAddress);
            const docs = response.data.credentials || [];

            const total = docs.length;
            const revokedCount = docs.filter(d => d.isRevoked).length;
            const active = total - revokedCount;
            const sbtCount = docs.filter(d => !!d.tokenId).length;
            const uniqueIssuers = new Set(docs.map(d => d.university || d.issuedBy?.name)).size;

            setStats({ total, active, sbtCount, uniqueIssuers });
            setCredentials(docs);
        } catch (error) {
            console.error('Failed to fetch credentials:', error);
            showNotification('Failed to fetch your credentials. Please ensure your wallet is connected.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [walletAddress, showNotification]);

    useEffect(() => {
        if (!walletAddress) {
            blockchainService.connectWallet()
                .then(address => address && setWalletAddress(address))
                .catch(e => console.log("Wallet not auto-connected", e));
        }
    }, [walletAddress]);

    useEffect(() => {
        if (!walletAddress) return;
        let active = true;
        Promise.resolve().then(() => {
            if (active) setLoading(true);
            return credentialAPI.getByWalletAddress(walletAddress);
        }).then(response => {
            if (!active) return;
            const docs = response.data.credentials || [];
            const total = docs.length;
            const revokedCount = docs.filter(d => d.isRevoked).length;
            const activeCount = total - revokedCount;
            const sbtCount = docs.filter(d => !!d.tokenId).length;
            const uniqueIssuers = new Set(docs.map(d => d.university || d.issuedBy?.name)).size;
            setStats({ total, active: activeCount, sbtCount, uniqueIssuers });
            setCredentials(docs);
        }).catch(error => {
            console.error('Failed to fetch credentials:', error);
            if (active) showNotification('Failed to fetch your credentials. Please ensure your wallet is connected.', 'error');
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [walletAddress, showNotification]);

    const filteredCredentials = useMemo(() => {
        let filtered = credentials;
        if (activeTab !== 'all') {
            filtered = filtered.filter(doc => doc.type === activeTab);
        }
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(cred =>
                cred.studentName.toLowerCase().includes(lower) ||
                (cred.university && cred.university.toLowerCase().includes(lower)) ||
                (cred.certificateHash && cred.certificateHash.toLowerCase().includes(lower))
            );
        }
        return filtered;
    }, [credentials, activeTab, searchQuery]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-stone-900 selection:bg-stone-900 selection:text-white overflow-x-hidden font-sans relative pb-20">
            <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6 relative z-10">

                {/* Header Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                            My Credentials
                        </h1>
                        <p className="text-xs text-stone-500 font-normal mt-0.5">
                            All certificates and transcripts associated with your account.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={() => fetchCredentials(true)}
                            loading={refreshing}
                            rounded="xl"
                            title="Refresh credentials"
                            icon={RefreshCw}
                            variant="outline"
                            className="p-2 flex items-center justify-center bg-white hover:bg-stone-50 text-stone-700 border-[#EAECF0] rounded-xl shadow-2xs cursor-pointer"
                        />
                    </div>
                </motion.div>

                {walletAddress && <StudentStats stats={stats} />}

                {/* Filter and Table Container */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="space-y-5"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAECF0] shadow-[0_1px_3px_rgba(16,24,40,0.02)]">

                        <div className="flex p-1 space-x-1 bg-[#F8F9FA] rounded-xl border border-[#EAECF0]">
                            {['all', 'TRANSCRIPT', 'CERTIFICATION'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === tab
                                            ? 'bg-stone-900 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {tab === 'all' ? 'All Credentials' : tab === 'TRANSCRIPT' ? 'Transcripts' : 'Certificates'}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-80 group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search credentials..."
                                onChange={(e) => handleSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 bg-[#F8F9FA] hover:bg-white focus:bg-white border border-stone-200/80 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400 transition-all shadow-2xs"
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {!walletAddress ? (
                            <EmptyState
                                icon={Wallet}
                                title="Wallet not connected"
                                message="Connect your wallet to view your certificates."
                            />
                        ) : (
                            <CredentialTable
                                credentials={filteredCredentials}
                                onView={setSelectedCredential}
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
