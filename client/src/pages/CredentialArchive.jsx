import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import RevokeCredentialModal from '../components/credential/RevokeCredentialModal';
import CredentialsStats from '../components/credential/CredentialsStats';
import CredentialsFilter from '../components/credential/CredentialsFilter';
import CredentialTable from '../components/credential/CredentialTable';
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

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
    const { user } = useAuth();
    const isMounted = useRef(true);
    const debounceTimer = useRef(null);

    const handleExportData = () => {
        try {
            const exportContent = {
                exportedAt: new Date().toISOString(),
                institution: user?.issuerDetails?.institutionName || user?.name,
                stats,
                credentials
            };
            const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attestify-report-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('Report exported successfully', 'success');
        } catch {
            showNotification('Could not export report', 'error');
        }
    };

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
            if (status === 'failed')      params.status  = 'FAILED';
            if (status === 'processing')  params.status  = 'PROCESSING_ALL';

            const response = await credentialAPI.getAll(params);

            if (!isMounted.current) return;

            const docs = response.data.credentials || [];
            setCredentials(docs);
            setSelectedCredential(prev => {
                if (!prev) return null;
                const prevId = prev.id || prev._id;
                return docs.find(c => (c.id || c._id) === prevId) || prev;
            });
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
            })
            .catch(e => console.warn('Stats fetch failed:', e));
    }, []);

    useEffect(() => {
        isMounted.current = true;
        loadStats();
        return () => {
            isMounted.current = false;
        };
    }, [loadStats]);

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchCredentials(currentPage, searchQuery, typeFilter, statusFilter);
        }, 300);
        return () => clearTimeout(debounceTimer.current);
    }, [fetchCredentials, searchQuery, typeFilter, statusFilter, currentPage]);

    const hasPending = credentials.some(c => c.status === 'PENDING' || c.status === 'PROCESSING');

    useEffect(() => {
        if (!hasPending) return;
        const interval = setInterval(() => {
            fetchCredentials(currentPage, searchQuery, typeFilter, statusFilter);
            loadStats();
        }, 8000);
        return () => clearInterval(interval);
    }, [hasPending, fetchCredentials, loadStats, currentPage, searchQuery, typeFilter, statusFilter]);

    useEffect(() => {
        const handleRefreshEvent = () => {
            fetchCredentials(currentPage, searchQuery, typeFilter, statusFilter);
            loadStats();
        };
        window.addEventListener('credentials-updated', handleRefreshEvent);
        return () => window.removeEventListener('credentials-updated', handleRefreshEvent);
    }, [fetchCredentials, loadStats, currentPage, searchQuery, typeFilter, statusFilter]);

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
        const selId = selectedCredential?.id || selectedCredential?._id;
        const revId = credentialToRevoke?.id || credentialToRevoke?._id;
        if (selId && selId === revId) {
            setSelectedCredential(null);
        }
    };

    const { currentPage: pg, totalPages } = pagination;

    return (
        <div className="w-full text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                            Credentials
                        </h1>
                        <p className="text-xs text-stone-500 font-normal mt-0.5">
                            Search, filter, and view certificates issued by your school.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            variant="primary"
                            icon={Plus}
                            size="sm"
                        >
                            Issue
                        </Button>
                        <Button
                            onClick={() => setShowBulkModal(true)}
                            variant="outline"
                            size="sm"
                        >
                            Bulk issue
                        </Button>
                        <Button
                            onClick={handleExportData}
                            variant="ghost"
                            size="sm"
                            icon={Download}
                        >
                            Export
                        </Button>
                    </div>
                </motion.div>

                <div>
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
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={pg <= 1}
                                variant="outline"
                                size="sm"
                                icon={ChevronLeft}
                            >
                                Previous
                            </Button>

                            <span className="text-stone-500 text-xs font-medium px-3 py-1.5 bg-stone-50 border border-[#EAECF0] rounded-xl tabular-nums">
                                Page <span className="text-stone-900 font-bold">{pg}</span> of <span className="text-stone-900 font-bold">{totalPages}</span>
                            </span>

                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={pg >= totalPages}
                                variant="outline"
                                size="sm"
                            >
                                Next <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>

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
                            loadStats();
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
