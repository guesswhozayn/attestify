import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import IssueCredentialModal from '../components/credential/IssueCredentialModal';
import BulkIssueModal from '../components/credential/BulkIssueModal';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import { Plus, Shield, Filter, ArrowRight, FileText, Users, Award, CheckCircle, Clock, Calendar, Zap} from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/shared/StatCard';
import WelcomeHeroCard from '../components/shared/WelcomeHeroCard';
import EmptyState from '../components/shared/EmptyState';

const IssuerDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        revoked: 0,
        today: 0,
        thisWeek: 0,
        verificationRequests: 0,
        transactionSuccessRate: 100,
        networkStats: { blockNumber: 0, gasPrice: '0', connected: false }
    });
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const isFetching = React.useRef(false);

    const welcomeTitle = (
      <>
        Welcome,{' '}
        <span className="text-stone-900 font-bold">
          {user?.issuerDetails?.institutionName || user?.name || 'Issuer'}
        </span>
      </>
    );

    const welcomeAvatar = (
      <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
        <Shield className="w-5 h-5 text-white" />
      </div>
    );

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isFetching.current) return;
        try {
            isFetching.current = true;
            if (isRefresh) setRefreshing(true);

            const [statsResponse, recentResponse] = await Promise.all([
                 credentialAPI.getStats ? credentialAPI.getStats() : Promise.resolve({ data: { stats: { total: 0, active: 0, revoked: 0, today: 0, thisWeek: 0, verificationRequests: 0, transactionSuccessRate: 100, networkStats: { blockNumber: 0, gasPrice: '0', connected: false } } } }),
                 credentialAPI.getAll({ limit: 6 })
            ]);

            if (statsResponse.data?.stats) {
                setStats(statsResponse.data.stats);
            }

            setCredentials(recentResponse.data?.credentials || []);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
            isFetching.current = false;
        }
    }, [showNotification]);

    useEffect(() => {
        let active = true;
        const load = () => {
            Promise.all([
                 credentialAPI.getStats ? credentialAPI.getStats() : Promise.resolve({ data: { stats: { total: 0, active: 0, revoked: 0, today: 0, thisWeek: 0, verificationRequests: 0, transactionSuccessRate: 100, networkStats: { blockNumber: 0, gasPrice: '0', connected: false } } } }),
                 credentialAPI.getAll({ limit: 6 })
            ]).then(([statsRes, recentRes]) => {
                if (!active) return;
                if (statsRes.data?.stats) setStats(statsRes.data.stats);
                setCredentials(recentRes.data?.credentials || []);
            }).catch(error => {
                console.error('Failed to fetch dashboard data:', error);
                if (active) showNotification('Failed to load dashboard data', 'error');
            }).finally(() => {
                if (active) {
                    setLoading(false);
                    setRefreshing(false);
                }
            });
        };

        load();
        const refreshInterval = setInterval(load, 30000);
        return () => {
            active = false;
            clearInterval(refreshInterval);
        };
    }, [showNotification]);

    return (
        <div className="min-h-screen bg-transparent text-stone-900 selection:bg-stone-900 selection:text-white overflow-x-hidden font-sans relative pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10 space-y-6 md:space-y-10">

                <WelcomeHeroCard
                  badge="Issuer overview"
                  title={welcomeTitle}
                  subtitle="Issue credentials to students and track verification status."
                  avatar={welcomeAvatar}
                  onRefresh={() => fetchDashboardData(true)}
                  refreshing={refreshing}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start flex-col-reverse lg:flex-row">

                    <div className="lg:col-span-8 space-y-6 md:space-y-8 order-last lg:order-first">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                label="Total issued"
                                value={stats.total}
                                icon={Award}
                                subtext="All time"
                                delay={0.1}
                            />
                            <StatCard
                                label="Active"
                                value={stats.active}
                                icon={CheckCircle}
                                subtext="Valid credentials"
                                delay={0.2}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard variant="mini" label="Today" value={stats.today} icon={Clock} delay={0.3} />
                            <StatCard variant="mini" label="This week" value={stats.thisWeek} icon={Calendar} delay={0.35} />
                            <StatCard variant="mini" label="Revoked" value={stats.revoked} icon={Filter} delay={0.4} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200/80">
                                        <FileText className="w-5 h-5 text-stone-700" />
                                    </div>
                                    <h2 className="text-xl font-bold text-stone-900 tracking-tight">Recent issuances</h2>
                                </div>
                                <button
                                    onClick={() => navigate('/credentials')}
                                    className="border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 rounded-xl px-4 py-2 text-xs font-semibold text-stone-800 flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
                                >
                                    <span>View all</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {loading || credentials.length > 0 ? (
                                    <RecentActivityList
                                        credentials={credentials}
                                        onCredentialClick={setSelectedCredential}
                                        loading={loading}
                                    />
                                ) : (
                                    <EmptyState icon={Award} title="No credentials yet" message="You have not issued any credentials yet. Start by creating your first credential.">
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="h-11 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Issue credential</span>
                                        </button>
                                    </EmptyState>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 md:p-7 border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.03),0_8px_24px_-6px_rgba(28,25,23,0.04)] relative overflow-hidden group/card"
                        >
                            <h3 className="text-stone-900 font-bold mb-5 flex items-center gap-3 text-left">
                                <div className="p-2 bg-stone-100 rounded-xl border border-stone-200/80">
                                    <Plus className="w-4 h-4 text-stone-700" />
                                </div>
                                Quick actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Issue credential</span>
                                </button>
                                <button
                                    onClick={() => setShowBulkModal(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold uppercase tracking-wider shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <Users className="w-4 h-4 text-stone-600" />
                                    <span>Issue in bulk</span>
                                </button>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <span>Issuer settings</span>
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="rounded-2xl bg-white border border-[#E8E4DC] shadow-[0_1px_3px_rgba(28,25,23,0.03),0_8px_24px_-6px_rgba(28,25,23,0.04)] p-6 md:p-7 space-y-5 overflow-hidden relative"
                        >
                            <div className="flex items-center justify-between mb-2 text-left">
                                <h3 className="text-stone-900 font-bold flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
                                        <Zap className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    System status
                                </h3>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${stats.networkStats?.connected ? 'bg-[#EDF5EE] text-[#25562C] border-[#CFE6D3]' : 'bg-[#FDF0EE] text-[#9E2D2D] border-[#F8D0CD]'} text-xs font-semibold border`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${stats.networkStats?.connected ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
                                    {stats.networkStats?.connected ? 'Online' : 'Offline'}
                                </div>
                            </div>

                            <div className="grid gap-2.5">
                                <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 flex justify-between items-center">
                                    <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider">Network</span>
                                    <span className="text-stone-800 text-xs font-semibold">Ethereum (Sepolia)</span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 flex justify-between items-center">
                                    <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider">Current block</span>
                                    <span className="text-stone-900 font-mono text-xs font-bold">
                                        #{stats.networkStats?.blockNumber || 10482}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider">Network fee</span>
                                        <span className="text-[10px] text-stone-400">Estimated gas</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-stone-800 font-medium text-xs">Standard</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex justify-between text-xs font-semibold text-stone-600 px-0.5">
                                    <span>Success rate</span>
                                    <span className="text-emerald-700 font-bold">{stats.transactionSuccessRate}%</span>
                                </div>
                                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200/80">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.transactionSuccessRate}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-emerald-600 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE7DE] text-center">
                            <span className="text-stone-800 text-xs font-bold block mb-1">Cryptographic verification</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                                All issued credentials are secure digital records that are tamper-proof and verifiable on-chain.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <IssueCredentialModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    fetchDashboardData();
                }}
            />

            <BulkIssueModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onSuccess={() => {
                    fetchDashboardData();
                }}
            />

            <CredentialDetails
                isOpen={!!selectedCredential}
                onClose={() => setSelectedCredential(null)}
                credential={selectedCredential}
                onUpdate={fetchDashboardData}
            />
        </div>
    );
};

export default IssuerDashboard;
