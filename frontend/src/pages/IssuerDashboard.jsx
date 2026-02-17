import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CredentialDetails from '../components/credential/CredentialDetails';
import UploadCredentialModal from '../components/credential/UploadCredentialModal';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import { Plus, Shield, Filter, ArrowRight, FileText, TrendingUp, Activity, Users, Award, CheckCircle, Clock, Calendar, Zap, Server, Wifi, RefreshCw } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/shared/StatCard';

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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();

    const isMounted = React.useRef(true);
    
    useEffect(() => {
        isMounted.current = true;
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            if (!loading && !refreshing) {
                fetchDashboardData(true);
            }
        }, 30000);

        return () => {
             isMounted.current = false;
             clearInterval(refreshInterval);
        };
    }, [fetchDashboardData, loading, refreshing]);

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            
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
            }
        }
    }, [showNotification]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none overflow-hidden">
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10">
                
                {/* Welcome Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onMouseMove={handleMouseMove}
                    className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/[0.08] p-8 md:p-12 backdrop-blur-3xl group"
                >
                    {/* Spotlight Effect */}
                    <div 
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        style={{
                            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`
                        }}
                    />

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-700"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md cursor-default"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Issuer Command</span>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none flex flex-col md:flex-row md:items-center gap-6"
                            >
                                <div className="shrink-0 rounded-full p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl">
                                    <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                        <Shield className="w-8 h-8 text-indigo-400" />
                                    </div>
                                </div>
                                <span className="drop-shadow-2xl">Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer">{user?.issuerDetails?.institutionName || user?.name || 'Issuer'}</span></span>
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="text-zinc-400 max-w-xl text-lg leading-relaxed"
                            >
                                Manage your institution&apos;s digital footprint. Issue on-chain credentials and monitor network status in real-time.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <button 
                                onClick={() => fetchDashboardData(true)}
                                disabled={refreshing}
                                className={`p-4 rounded-[2rem] bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : 'hover:scale-105 active:scale-95'}`}
                                title="Refresh Dashboard"
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Stats and Activity */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Stats Carousel-like Grid */}
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
                            <div className="bg-[#0c0c0c] p-5 rounded-[2rem] border border-white/[0.05] flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Today</span>
                                <span className="text-2xl font-black text-white">{stats.today}</span>
                                <div className="mt-2 p-1.5 bg-pink-500/10 rounded-lg">
                                    <Clock className="w-4 h-4 text-pink-400" />
                                </div>
                            </div>
                            <div className="bg-[#0c0c0c] p-5 rounded-[2rem] border border-white/[0.05] flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Weekly</span>
                                <span className="text-2xl font-black text-white">{stats.thisWeek}</span>
                                <div className="mt-2 p-1.5 bg-violet-500/10 rounded-lg">
                                    <Calendar className="w-4 h-4 text-violet-400" />
                                </div>
                            </div>
                            <div className="bg-[#0c0c0c] p-5 rounded-[2rem] border border-white/[0.05] flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Revoked</span>
                                <span className="text-2xl font-black text-white">{stats.revoked}</span>
                                <div className="mt-2 p-1.5 bg-red-500/10 rounded-lg">
                                    <Filter className="w-4 h-4 text-red-400" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity List */}
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
                                    className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-2xl px-6 text-sm"
                                    onClick={() => navigate('/credentials')}
                                >
                                    View All <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <div className="min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full p-20 bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] border-dashed">
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
                                    <div className="flex flex-col items-center justify-center py-24 bg-[#0a0a0a] border border-white/[0.06] border-dashed rounded-[2.5rem] text-center backdrop-blur-3xl group">
                                        <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            <Award className="w-10 h-10 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                                        <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                                            Your issuance ledger is empty. Start by creating your first blockchain credential.
                                        </p>
                                        <Button 
                                        onClick={() => setShowUploadModal(true)}
                                        icon={Plus}
                                        variant="success"
                                        className="h-12 px-6"
                                    >
                                        Issue Credential
                                    </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions and Network */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                        
                        {/* Quick Action Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group/card"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                            
                            <h3 className="text-white font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover/card:bg-indigo-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-indigo-400" />
                                </div>
                                Quick Actions
                            </h3>
                            
                            <div className="space-y-4">
                                <Button 
                                    onClick={() => setShowUploadModal(true)}
                                    variant="primary"
                                    icon={Plus}
                                    className="w-full justify-center py-4 bg-indigo-600 hover:bg-indigo-500 border-none shadow-xl shadow-indigo-500/20 rounded-2xl"
                                >
                                    Issue Credential
                                </Button>
                                <Button 
                                    onClick={() => navigate('/settings')}
                                    variant="outline"
                                    className="w-full justify-center py-4 border-white/10 hover:border-white/20 backdrop-blur-md rounded-2xl"
                                >
                                    Issuer Settings
                                </Button>
                            </div>
                        </motion.div>

                        {/* Network Health Card */}
                        <motion.div
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ duration: 0.5, delay: 0.4 }}
                             className="rounded-[2.5rem] bg-[#0c0c0c] border border-white/[0.08] backdrop-blur-xl p-8 space-y-8 group/card overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>

                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover/card:bg-emerald-500/20 transition-colors">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    Network Health
                                </h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${stats.networkStats?.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-[10px] font-black uppercase tracking-widest border shadow-lg`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${stats.networkStats?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    {stats.networkStats?.connected ? 'Syncing' : 'Isolated'}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex justify-between items-center group/item hover:bg-white/[0.03] transition-colors">
                                    <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Blockchain</span>
                                    <span className="text-zinc-300 text-xs font-medium">Sepolia Testnet</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex justify-between items-center hover:bg-white/[0.03] transition-colors">
                                    <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Latest Block</span>
                                    <span className="text-white font-mono text-sm font-bold tracking-tighter">
                                        {stats.networkStats?.blockNumber}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex justify-between items-center hover:bg-white/[0.03] transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Gas Price</span>
                                        <span className="text-[10px] text-zinc-600 mt-0.5">Estimated cost</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-mono text-sm font-bold">{stats.networkStats?.gasPrice}</span>
                                        <span className="text-zinc-500 text-[10px] ml-1 font-bold">GWEI</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest px-1">
                                    <span>Success Rate</span>
                                    <span>{stats.transactionSuccessRate}%</span>
                                </div>
                                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.transactionSuccessRate}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    ></motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Success Card */}
                        <div className="p-6 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 text-center">
                            <span className="text-indigo-400 text-xs font-bold block mb-2">Network Verification</span>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                                All issued credentials are cryptographic proofs stored on the Ethereum blockchain.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <UploadCredentialModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    fetchDashboardData();
                    showNotification('Credential issued successfully', 'success');
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
