import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';
import CredentialGrid from '../components/credential/CredentialGrid';
import CredentialDetails from '../components/credential/CredentialDetails';
import UploadCredentialModal from '../components/credential/UploadCredentialModal';
import { Plus, Shield, Filter, ArrowRight, FileText, TrendingUp, Activity, Users, Award } from 'lucide-react';
import { credentialAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, subtext, gradient, iconBg, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
        className="group relative overflow-hidden bg-gray-900/40 p-6 rounded-3xl border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.03] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                     <div className="text-4xl font-bold text-white mt-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">{value}</div>
                </div>
                <div className={`p-3.5 ${iconBg} rounded-2xl border border-white/5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            
            {subtext && (
                <div className="flex items-center text-xs text-gray-400 font-medium bg-white/5 w-fit px-2 py-1 rounded-lg border border-white/5">
                    <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-400" />
                    {subtext}
                </div>
            )}
        </div>
    </motion.div>
);

const IssuerDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();

    const isMounted = React.useRef(true);
    
    useEffect(() => {
        isMounted.current = true;
        fetchDashboardData();
        return () => {
             isMounted.current = false;
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [statsResponse, recentResponse] = await Promise.all([
                 credentialAPI.getStats ? credentialAPI.getStats() : Promise.resolve({ data: { stats: { total: 0, active: 0, revoked: 0 } } }),
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
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">
            


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-12">
                
                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-white/[0.08] p-8 md:p-10 backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
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
                                 <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Issuer Nexus</span>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                                className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
                            >
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer">{user?.issuerDetails?.institutionName || user?.name || 'Issuer'}</span>
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="text-gray-400 max-w-xl text-lg leading-relaxed"
                            >
                                Manage your issuer's on-chain credentials. Issue new certificates, verify student identities, and track issuance in real-time.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                variant="primary"
                                icon={Plus}
                                className="bg-white text-black hover:bg-zinc-200 border-none px-8 py-4 text-base font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all hover:-translate-y-1 rounded-full"
                            >
                                Issue Credential
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        label="Total Issued" 
                        value={stats.total} 
                        icon={Shield} 
                        subtext="All time credentials"
                        gradient="from-indigo-500/10 to-purple-500/5"
                        iconBg="bg-indigo-500/20"
                        delay={0.4}
                    />
                    <StatCard 
                        label="Active Status" 
                        value={stats.active} 
                        icon={Activity} 
                        subtext="Currently valid on-chain"
                        gradient="from-emerald-500/10 to-teal-500/5"
                        iconBg="bg-emerald-500/20"
                        delay={0.5}
                    />
                    <StatCard 
                        label="Revoked" 
                        value={stats.revoked} 
                        icon={Filter} 
                        subtext="Withdrawn credentials"
                        gradient="from-red-500/10 to-orange-500/5"
                        iconBg="bg-red-500/20"
                        delay={0.6}
                    />
                </div>

                {/* Recent Activity Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <FileText className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Issuances</h2>
                        </div>
                        <Button 
                            variant="outline" 
                            className="text-zinc-400 hover:text-white border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-full px-6"
                            onClick={() => navigate('/credentials')}
                        >
                            View All <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <div className="min-h-[200px]">
                        {loading ? (
                             <div className="flex flex-col items-center justify-center p-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <div className="text-zinc-500 font-medium animate-pulse">Loading blockchain records...</div>
                             </div>
                        ) : credentials.length > 0 ? (
                            <div className="relative">
                                {/* Decor */}
                                <div className="absolute -left-4 top-10 bottom-10 w-px bg-white/5 hidden xl:block"></div>
                                
                                <CredentialGrid 
                                    credentials={credentials} 
                                    onCredentialClick={setSelectedCredential}
                                    loading={loading}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/[0.06] border-dashed rounded-3xl text-center backdrop-blur-sm group hover:bg-white/[0.03] transition-colors">
                                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 shadow-xl ring-8 ring-white/[0.02] group-hover:scale-110 transition-transform">
                                    <Award className="w-10 h-10 text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Credentials Issued</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto text-base mb-8">
                                    Start issuing blockchain-secured credentials to populate your dashboard.
                                </p>
                                <Button 
                                    onClick={() => setShowUploadModal(true)}
                                    variant="primary"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 shadow-lg shadow-indigo-500/20"
                                >
                                    Issue First Credential
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>

            {/* Modals */}
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
