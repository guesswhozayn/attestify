import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import RevokeCredentialModal from '../components/credential/RevokeCredentialModal';
import CredentialsStats from '../components/credential/CredentialsStats';
import CredentialsFilter from '../components/credential/CredentialsFilter';
import CredentialTable from '../components/credential/CredentialTable';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const PAGE_SIZE = 20;

const CredentialArchive = () => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, uniqueRecipients: 0, sbtCount: 0 });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [credentialToRevoke, setCredentialToRevoke] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const { showNotification } = useNotification();
    const isMounted = useRef(true);
    const debounceTimer = useRef(null);

    const fetchCredentials = useCallback(async (page = 1, search = searchQuery, type = typeFilter, status = statusFilter) => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: PAGE_SIZE,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            };
            if (search.trim())            params.search  = search.trim();
            if (type !== 'all')           params.type    = type;
            if (status === 'active')      params.revoked = 'false';
            if (status === 'revoked')     params.revoked = 'true';

            const response = await credentialAPI.getAll(params);

            if (!isMounted.current) return;

            const docs = response.data.credentials || [];
            setCredentials(docs);
            setPagination(response.data.pagination || { currentPage: page, totalPages: 1, total: docs.length });

        } catch (error) {
            console.error(error);
            if (isMounted.current && error.response?.status !== 401) {
                showNotification('Failed to fetch credentials', 'error');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [showNotification]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await credentialAPI.getStats();
            if (!isMounted.current) return;
            const s = response.data?.stats;
            if (s) {
                setStats({
                    total: s.total ?? 0,
                    active: s.active ?? 0,
                    revoked: s.revoked ?? 0,
                    uniqueRecipients: 0,
                    sbtCount: 0
                });
            }
        } catch (e) {
            console.warn('Stats fetch failed:', e);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchCredentials(1);
        fetchStats();
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchCredentials(currentPage, searchQuery, typeFilter, statusFilter);
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [searchQuery, typeFilter, statusFilter, currentPage]);

    const handleFilterChange = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleCredentialUpload = () => {
        setCurrentPage(1);
        fetchCredentials(1);
        fetchStats();
    };

    const handleRevokeSuccess = () => {
        fetchCredentials(currentPage);
        fetchStats();
        setCredentialToRevoke(null);
        if (selectedCredential && selectedCredential._id === credentialToRevoke?._id) {
            setSelectedCredential(null);
        }
    };

    const { currentPage: pg, totalPages } = pagination;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-12 relative z-10">

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

                <div className="bg-white/[0.01] border border-white/[0.04] rounded-[3rem] p-2 backdrop-blur-3xl shadow-2xl">
                    <CredentialsStats stats={stats} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-10"
                >
                    <CredentialsFilter
                        searchQuery={searchQuery}
                        setSearchQuery={handleFilterChange(setSearchQuery)}
                        typeFilter={typeFilter}
                        setTypeFilter={handleFilterChange(setTypeFilter)}
                        statusFilter={statusFilter}
                        setStatusFilter={handleFilterChange(setStatusFilter)}
                        onRefresh={() => { setCurrentPage(1); fetchCredentials(1); fetchStats(); }}
                        loading={loading}
                    />

                    <div className="min-h-[600px] px-2">
                        <CredentialTable
                            credentials={credentials}
                            onView={setSelectedCredential}
                            onRevoke={setCredentialToRevoke}
                            loading={loading}
                        />
                    </div>

                    {!loading && totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={pg <= 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/4 border border-white/8 text-zinc-400 hover:text-white hover:border-indigo-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>

                            <span className="text-zinc-500 text-sm font-medium px-4 py-2 bg-white/2 border border-white/5 rounded-xl tabular-nums">
                                Page <span className="text-white font-bold">{pg}</span> of <span className="text-white font-bold">{totalPages}</span>
                            </span>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={pg >= totalPages}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/4 border border-white/8 text-zinc-400 hover:text-white hover:border-indigo-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </main>

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
                            fetchCredentials(currentPage);
                            setSelectedCredential(null);
                        }}
                    />
                )}
            </AnimatePresence>

            <RevokeCredentialModal
                isOpen={!!credentialToRevoke}
                onClose={() => setCredentialToRevoke(null)}
                credential={credentialToRevoke}
                onSuccess={handleRevokeSuccess}
            />
        </div>
    );
};

export default CredentialArchive;
