import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import GradientBackground from '../components/shared/GradientBackground';
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
    const isMounted = React.useRef(true);
    const loadingRef = React.useRef(true);
    const refreshingRef = React.useRef(false);

    const welcomeTitle = useMemo(() => (
      <>
        Welcome,{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-white to-indigo-300 bg-size-[200%_auto] animate-shimmer">
          {user?.issuerDetails?.institutionName || user?.name || 'Issuer'}
        </span>
      </>
    ), [user?.issuerDetails?.institutionName, user?.name]);

    const welcomeAvatar = useMemo(() => (
      <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
        <Shield className="w-6 h-6 text-indigo-400" />
      </div>
    ), []);

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                refreshingRef.current = true;
            } else {
                setLoading(true);
                loadingRef.current = true;
            }

            const [statsResponse, recentResponse] = await Promise.all([
                 credentialAPI.getStats ? credentialAPI.getStats() : Promise.resolve({ data: { stats: { total: 0, active: 0, revoked: 0, today: 0, thisWeek: 0, verificationRequests: 0, transactionSuccessRate: 100, networkStats: { blockNumber: 0, gasPrice: '0', connected: false } } } }),
                 credentialAPI.getAll({ limit: 6 })
            ]);

            if (!isMounted.current) return;

            if (statsResponse.data?.stats) {
                setStats(statsResponse.data.stats);
            }

            setCredentials(recentResponse.data?.credentials || []);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            if (isMounted.current) {
                showNotification('Failed to load dashboard data', 'error');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setRefreshing(false);
                loadingRef.current = false;
                refreshingRef.current = false;
            }
        }
    }, [showNotification]);

    useEffect(() => {
        isMounted.current = true;
        fetchDashboardData();

        const refreshInterval = setInterval(() => {
            if (!loadingRef.current && !refreshingRef.current) {
                fetchDashboardData(true);
            }
        }, 30000);

        return () => {
             isMounted.current = false;
             clearInterval(refreshInterval);
        };
    }, [fetchDashboardData]);

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">

            <GradientBackground />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10 space-y-6 md:space-y-10">

                <WelcomeHeroCard
                  badge="Issuer Command"
                  title={welcomeTitle}
                  subtitle="Manage your institution's digital footprint. Issue on-chain credentials and monitor network status in real-time."
                  avatar={welcomeAvatar}
                  onRefresh={() => fetchDashboardData(true)}
                  refreshing={refreshing}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start flex-col-reverse lg:flex-row">

                    <div className="lg:col-span-8 space-y-6 md:space-y-8 order-last lg:order-first">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                label="Total Issued"
                                value={stats.total}
                                icon={Award}
                                subtext="All-time verified"
                                gradient="from-indigo-500 to-transparent"
                                iconBg="bg-indigo-500/10"
                                delay={0.1}
                            />
                            <StatCard
                                label="Active Now"
                                value={stats.active}
                                icon={CheckCircle}
                                subtext="Live credentials"
                                gradient="from-emerald-500 to-transparent"
                                iconBg="bg-emerald-500/10"
                                delay={0.2}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard variant="mini" label="Today" value={stats.today} icon={Clock} iconBg="bg-pink-500/10" iconColor="text-pink-400" delay={0.3} />
                            <StatCard variant="mini" label="Weekly" value={stats.thisWeek} icon={Calendar} iconBg="bg-violet-500/10" iconColor="text-violet-400" delay={0.35} />
                            <StatCard variant="mini" label="Revoked" value={stats.revoked} icon={Filter} iconBg="bg-red-500/10" iconColor="text-red-400" delay={0.4} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Recent Issuances</h2>
                                </div>
                                <Button
                                    variant="outline"
                                    icon={ArrowRight}
                                    className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-2xl px-6 text-sm flex-row-reverse"
                                    onClick={() => navigate('/credentials')}
                                >
                                    View All
                                </Button>
                            </div>

                            <div className="min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full p-20 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] border-dashed">
                                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <div className="text-zinc-500 font-medium animate-pulse">Scanning chain...</div>
                                    </div>
                                ) : credentials.length > 0 ? (
                                    <RecentActivityList
                                        credentials={credentials}
                                        onCredentialClick={setSelectedCredential}
                                        loading={loading}
                                    />
                                ) : (
                                    <EmptyState icon={Award} title="No Records Found" message="Your issuance ledger is empty. Start by creating your first blockchain credential.">
                                        <Button
                                            onClick={() => setShowUploadModal(true)}
                                            icon={Plus}
                                            variant="success"
                                            className="h-12 px-6"
                                        >
                                            Issue Credential
                                        </Button>
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
                            className="bg-[#0a0a0a] rounded-4xl p-8 border border-white/8 shadow-2xl backdrop-blur-xl relative overflow-hidden group/card"
                        >
                            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-left">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover/card:bg-indigo-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-indigo-400" />
                                </div>
                                Quick Actions
                            </h3>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => setShowUploadModal(true)}
                                    variant="white"
                                    icon={Plus}
                                    className="w-full justify-center py-3.5 sm:py-4 uppercase tracking-widest text-xs"
                                >
                                    Issue Credential
                                </Button>
                                <Button
                                    onClick={() => setShowBulkModal(true)}
                                    variant="outline"
                                    icon={Users}
                                    className="w-full justify-center py-3.5 sm:py-4 uppercase tracking-widest text-xs"
                                >
                                    Bulk Sync
                                </Button>
                                <Button
                                    onClick={() => navigate('/settings')}
                                    variant="outline"
                                    className="w-full justify-center py-3.5 sm:py-4 uppercase tracking-widest text-xs"
                                >
                                    Issuer Settings
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.5, delay: 0.4 }}
                             className="rounded-4xl bg-[#0c0c0c] border border-white/8 backdrop-blur-xl p-8 space-y-8 group/card overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-4 md:mb-2 text-left">
                                <h3 className="text-white font-bold flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover/card:bg-emerald-500/20 transition-colors">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    Network Health
                                </h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${stats.networkStats?.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-[11px] font-bold border shadow-lg`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${stats.networkStats?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    {stats.networkStats?.connected ? 'Syncing' : 'Isolated'}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group/item hover:bg-white/10 transition-colors">
                                    <span className="text-zinc-500 text-[11px] font-bold">Blockchain</span>
                                    <span className="text-zinc-300 text-xs font-medium">Sepolia Testnet</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                                    <span className="text-zinc-500 text-[11px] font-bold">Latest Block</span>
                                    <span className="text-white font-mono text-sm font-bold tracking-tighter">
                                        {stats.networkStats?.blockNumber}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-500 text-[11px] font-bold">Gas Price</span>
                                        <span className="text-[10px] text-zinc-600 mt-0.5">Estimated cost</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-mono text-sm font-bold">{stats.networkStats?.gasPrice}</span>
                                        <span className="text-zinc-500 text-[10px] ml-1 font-bold">GWEI</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-emerald-400/60 px-1">
                                    <span>Success Rate</span>
                                    <span>{stats.transactionSuccessRate}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.transactionSuccessRate}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-linear-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-6 rounded-4xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                            <span className="text-indigo-400 text-xs font-bold block mb-2">Network Verification</span>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                                All issued credentials are cryptographic proofs stored on the Ethereum blockchain.
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
