import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import UploadCredentialModal from '../components/credential/UploadCredentialModal';
import RevokeCredentialModal from '../components/credential/RevokeCredentialModal';
import CredentialsStats from '../components/credential/CredentialsStats';
import CredentialsFilter from '../components/credential/CredentialsFilter';
import CredentialTable from '../components/credential/CredentialTable';
import { Plus } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Credentials = () => {
    // Data States
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, uniqueRecipients: 0, sbtCount: 0 });

    // UI States
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [credentialToRevoke, setCredentialToRevoke] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const { showNotification } = useNotification();
    const isMounted = React.useRef(true);

    useEffect(() => {
        isMounted.current = true;
        fetchCredentials();
        return () => { isMounted.current = false; };
    }, []);

    const fetchCredentials = async () => {
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
    };

    const calculateStats = (docs) => {
        const total = docs.length;
        const revoked = docs.filter(d => d.isRevoked).length;
        const active = total - revoked;
        const sbtCount = docs.filter(d => !!d.tokenId).length;
        
        // Count unique recipients by wallet address or name
        const uniqueRecipients = new Set(
            docs.map(d => d.studentWalletAddress || d.studentName)
        ).size;

        setStats({ total, active, revoked, uniqueRecipients, sbtCount });
    };

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

    // Filter Logic
    const filteredCredentials = useMemo(() => {
        return credentials.filter(cred => {
            // Search Filter
            const lowerQuery = searchQuery.toLowerCase();
            const matchesSearch = 
                cred.studentName?.toLowerCase().includes(lowerQuery) ||
                cred.studentWalletAddress?.toLowerCase().includes(lowerQuery) ||
                cred._id?.toLowerCase().includes(lowerQuery) ||
                cred.courseName?.toLowerCase().includes(lowerQuery);

            if (!matchesSearch) return false;

            // Type Filter
            if (typeFilter !== 'all' && cred.type !== typeFilter) return false;

            // Status Filter
            if (statusFilter === 'active' && cred.isRevoked) return false;
            if (statusFilter === 'revoked' && !cred.isRevoked) return false;

            return true;
        });
    }, [credentials, searchQuery, typeFilter, statusFilter]);

    return (
        <div className="min-h-screen bg-transparent text-gray-100 pb-20 relative">
             {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[0%] left-[20%] w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[120px]"></div>
            </div>

            <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 relative z-10">
                
                {/* Header & Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div className="relative">
                         <div className="absolute -left-6 top-1 w-1.5 h-12 bg-indigo-500 rounded-r-full hidden md:block opacity-60"></div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Issued Credentials</h1>
                        <p className="text-gray-400 max-w-xl">
                            Manage and track all credentials issued by your institution. Verify status, handle revocations, and issue new certificates.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            variant="primary"
                            icon={Plus}
                            className="rounded-full shadow-lg shadow-indigo-500/20 px-6 py-3"
                        >
                            Issue Credential
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Section */}
                <CredentialsStats stats={stats} />

                {/* Content Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <CredentialsFilter 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        onRefresh={fetchCredentials}
                        onBulkIssue={() => setShowUploadModal(true)}
                    />

                    <CredentialTable
                        credentials={filteredCredentials}
                        onView={setSelectedCredential}
                        onRevoke={setCredentialToRevoke}
                        loading={loading}
                    />
                </motion.div>
            </main>

            {/* Modals */}
            <UploadCredentialModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
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

            {/* Revocation Modal */}
            <RevokeCredentialModal 
                isOpen={!!credentialToRevoke}
                onClose={() => setCredentialToRevoke(null)}
                credentialId={credentialToRevoke?._id}
                onSuccess={handleRevokeSuccess}
            />
        </div>
    );
};

// Add AnimatePresence import as it was missing in my variable list but used in JSX
export default Credentials;
