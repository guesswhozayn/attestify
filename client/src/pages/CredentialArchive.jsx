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

    const isInitial = useRef(true);

    const fetchCredentials = useCallback(async (page = 1, search = searchQuery, type = typeFilter, status = statusFilter) => {
        try {
            if (!isInitial.current) setLoading(true);
            isInitial.current = false;

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
    }, [searchQuery, typeFilter, statusFilter, showNotification]);

    const loadStats = useCallback(() => {
        credentialAPI.getStats()
            .then(response => {
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
            })
            .catch(e => console.warn('Stats fetch failed:', e));
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchCredentials(currentPage, searchQuery, typeFilter, statusFilter);
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [fetchCredentials, searchQuery, typeFilter, statusFilter, currentPage]);

    const handleFilterChange = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleCredentialUpload = () => {
        setCurrentPage(1);
        fetchCredentials(1);
        loadStats();
    };

    const handleRevokeSuccess = () => {
        fetchCredentials(currentPage);
        loadStats();
        setCredentialToRevoke(null);
        if (selectedCredential && selectedCredential._id === credentialToRevoke?._id) {
            setSelectedCredential(null);
        }
    };

    const { currentPage: pg, totalPages } = pagination;

    return (
        <div className="min-h-screen bg-transparent text-stone-900 selection:bg-stone-200 overflow-x-hidden font-sans relative pb-20">
            <main className="p-6 lg:p-12 max-w-[1600px] mx-auto space-y-10 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-semibold text-stone-600">Credentials registry</span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none">
                                All credentials
                            </h1>
                            <p className="text-stone-500 max-w-2xl text-base font-normal leading-relaxed">
                                View and manage all credentials issued by your institution.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            variant="primary"
                            icon={Plus}
                            className="flex-1 lg:flex-none bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3 px-5 text-sm font-medium shadow-sm"
                        >
                            Issue credential
                        </Button>
                        <Button
                            onClick={() => setShowBulkModal(true)}
                            variant="outline"
                            className="flex-1 lg:flex-none bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl py-3 px-5 text-sm font-medium shadow-xs"
                        >
                            Issue in bulk
                        </Button>
                    </div>
                </motion.div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8E4DC] shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)]">
                    <CredentialsStats stats={stats} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                >
                    <CredentialsFilter
                        searchQuery={searchQuery}
                        setSearchQuery={handleFilterChange(setSearchQuery)}
                        typeFilter={typeFilter}
                        setTypeFilter={handleFilterChange(setTypeFilter)}
                        statusFilter={statusFilter}
                        setStatusFilter={handleFilterChange(setStatusFilter)}
                        onRefresh={() => { setCurrentPage(1); fetchCredentials(1); loadStats(); }}
                        loading={loading}
                    />

                    <div className="min-h-[500px]">
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
                            className="flex items-center justify-center gap-3 pt-4"
                        >
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={pg <= 1}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-2xs cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>

                            <span className="text-stone-500 text-sm font-medium px-4 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl tabular-nums">
                                Page <span className="text-stone-900 font-bold">{pg}</span> of <span className="text-stone-900 font-bold">{totalPages}</span>
                            </span>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={pg >= totalPages}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-2xs cursor-pointer"
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
