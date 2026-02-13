import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    User, Building, Award, CheckCircle, Clock, ExternalLink, 
    ChevronRight, ArrowLeft, Loader, Shield, Globe, Wallet
} from 'lucide-react';
import Header from '../components/layout/Header';
import api from '../services/api';

const PublicProfile = () => {
    const { walletAddress } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/public/student/${walletAddress}`);
                if (response.data.success) {
                    setData(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch public profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (walletAddress) {
            fetchPublicProfile();
        }
    }, [walletAddress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Achievement Grid...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-200">
                <Header title="Public Profile" showSearch={false} />
                <main className="max-w-xl mx-auto px-6 py-32 text-center space-y-8">
                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-400">
                        <Shield className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white">{error}</h2>
                        <p className="text-gray-500 font-medium tracking-tight">
                            {error === 'This profile is private' 
                                ? "The student has restricted their profile visibility. Only authorized entities can view these achievements." 
                                : "We couldn't find any student profile associated with this wallet address."}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/public/search')}
                        className="px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-black uppercase tracking-widest rounded-3xl transition-all flex items-center gap-3 mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Search
                    </button>
                </main>
            </div>
        );
    }

    const { student, credentials } = data;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-indigo-500/30 pb-20">
            <Header title="Verified Achievements" showSearch={false} />

            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
                {/* Back Link */}
                <Link 
                    to="/public/search"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] mb-12 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Achievements Search
                </Link>

                {/* Profile Header */}
                <section className="relative mb-20 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative w-40 h-40 rounded-[2.5rem] bg-gray-900 border-4 border-gray-950 overflow-hidden">
                                {student.avatar ? (
                                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center text-5xl font-black text-white/50">
                                        {student.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-4 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Shield className="w-3 h-3" />
                                Identity Verified
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight">{student.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                    <Building className="w-5 h-5 text-indigo-400" />
                                    {student.university}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-mono text-xs bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-800">
                                    <Wallet className="w-4 h-4 text-indigo-400" />
                                    {student.walletAddress.substring(0, 6)}...{student.walletAddress.substring(38)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Achievements Grid */}
                <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-white tracking-tight shrink-0">Achievements Grid</h2>
                        <div className="h-[1px] bg-gray-800 flex-1"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                            {credentials.length} Badges Secured
                        </div>
                    </div>

                    {credentials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {credentials.map((cred, i) => (
                                <Link 
                                    key={cred._id} 
                                    to={`/verify/${cred._id}`}
                                    className="group relative bg-gray-900/40 backdrop-blur-xl border border-gray-800 hover:border-indigo-500/30 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-indigo-600/5">
                                            <Award className="w-8 h-8" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                                                {cred.type === 'TRANSCRIPT' ? 'Academic Transcript' : (cred.certificationData?.title || 'Certification')}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                                {cred.university}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {new Date(cred.issueDate).getFullYear()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-20 text-center space-y-6">
                            <Globe className="w-16 h-16 text-gray-700 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">No Public Badges</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                    This student hasn't added any achievements to their public achievement grid yet.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default PublicProfile;
