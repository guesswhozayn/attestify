import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import RevokeCredentialModal from '../components/credential/RevokeCredentialModal';
import CredentialsStats from '../components/credential/CredentialsStats';
import CredentialsFilter from '../components/credential/CredentialsFilter';
import CredentialTable from '../components/credential/CredentialTable';
import { Plus } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Credentials = () => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, uniqueRecipients: 0, sbtCount: 0 });

    const [selectedCredential, setSelectedCredential] = useState(null);
    const [credentialToRevoke, setCredentialToRevoke] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const { showNotification } = useNotification();
    const isMounted = React.useRef(true);

    const calculateStats = useCallback((docs) => {
        const total = docs.length;
        const revoked = docs.filter(d => d.isRevoked).length;
        const active = total - revoked;
        const sbtCount = docs.filter(d => !!d.tokenId).length;
        
        const uniqueRecipients = new Set(
            docs.map(d => d.studentWalletAddress || d.studentName)
        ).size;

        setStats({ total, active, revoked, uniqueRecipients, sbtCount });
    }, []);

    const fetchCredentials = useCallback(async () => {
        try {
            setLoading(true);
            const response = await credentialAPI.getAll();
            
            if (isMounted.current) {
                const docs = response.data.credentials || [];
                setCredentials(docs);
                calculateStats(docs);
            }
        } catch (error) {
            console.error(error);
            if (isMounted.current) {
               if (error.response?.status !== 401) {
                   showNotification('Failed to fetch credentials', 'error');
               }
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [showNotification, calculateStats]);

    useEffect(() => {
        isMounted.current = true;
        fetchCredentials();
        return () => { isMounted.current = false; };
    }, [fetchCredentials]);




    const handleCredentialUpload = () => {
        fetchCredentials();
    };

    const handleRevokeSuccess = () => {
        fetchCredentials();
        setCredentialToRevoke(null);
        if (selectedCredential && selectedCredential._id === credentialToRevoke?._id) {
            setSelectedCredential(null);
        }
    };

    const filteredCredentials = useMemo(() => {
        return credentials.filter(cred => {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesSearch = 
                cred.studentName?.toLowerCase().includes(lowerQuery) ||
                cred.studentWalletAddress?.toLowerCase().includes(lowerQuery) ||
                cred._id?.toLowerCase().includes(lowerQuery) ||
                cred.courseName?.toLowerCase().includes(lowerQuery);

            if (!matchesSearch) return false;
            if (typeFilter !== 'all' && cred.type !== typeFilter) return false;
            if (statusFilter === 'active' && cred.isRevoked) return false;
            if (statusFilter === 'revoked' && !cred.isRevoked) return false;

            return true;
        });
    }, [credentials, searchQuery, typeFilter, statusFilter]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none overflow-hidden">
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative z-10">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="text-[11px] font-bold text-indigo-300">Institutional Registry</span>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none flex flex-col md:flex-row md:items-center gap-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500">Credential</span>
                                <span className="text-indigo-500">Archive</span>
                            </h1>
                            <p className="text-zinc-500 max-w-2xl text-lg font-medium leading-relaxed">
                                Manage your institution&apos;s complete issuance history. Access immutable records, verify cryptographic proof-of-state, and maintain the integrity of your digital credentials.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            variant="white"
                            icon={Plus}
                            size="lg"
                            className="flex-1 lg:flex-none font-bold"
                        >
                            Issue
                        </Button>
                        <Button
                            onClick={() => setShowBulkModal(true)}
                            variant="outline"
                            size="lg"
                            className="flex-1 lg:flex-none font-bold"
                        >
                            Bulk Sync
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Dashboard */}
                <div className="bg-white/[0.01] border border-white/[0.04] rounded-[3rem] p-2 backdrop-blur-3xl shadow-2xl">
                    <CredentialsStats stats={stats} />
                </div>

                {/* Main Interaction Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-10"
                >
                    <CredentialsFilter 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        onRefresh={fetchCredentials}
                        loading={loading}
                    />

                    <div className="min-h-[600px] px-2">
                        <CredentialTable
                            credentials={filteredCredentials}
                            onView={setSelectedCredential}
                            onRevoke={setCredentialToRevoke}
                            loading={loading}
                        />
                    </div>
                </motion.div>
            </main>

            {/* Modal Components */}
            <IssueCredentialModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={handleCredentialUpload}
            />

            <BulkIssueModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onSuccess={handleCredentialUpload}
            />

            <AnimatePresence>
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
            </AnimatePresence>

            <RevokeCredentialModal 
                isOpen={!!credentialToRevoke}
                onClose={() => setCredentialToRevoke(null)}
                credentialId={credentialToRevoke?._id}
                onSuccess={handleRevokeSuccess}
            />
        </div>
    );
};

export default Credentials;
