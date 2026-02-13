import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import { 
    ShieldCheck, 
    Building2, 
    Wallet, 
    Globe, 
    ArrowLeft, 
    Loader2,
    Award
} from 'lucide-react';
import DetailedCertificateCard from '../../components/certificate/DetailedCertificateCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const PublicProfile = () => {
    const { walletAddress } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await publicAPI.getStudentProfile(walletAddress);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (walletAddress) {
            fetchProfile();
        }
    }, [walletAddress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Verifying Identity on Blockchain...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <ShieldCheck className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                <p className="text-slate-400 max-w-md mb-8">{error}</p>
                <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors"
                >
                    Back to Search
                </button>
            </div>
        );
    }

    const { student, credentials } = data;

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-purple-500/30 flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors">
                        Verified Achievements
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 hidden sm:block">Student</span>
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                             {student?.avatar ? (
                                <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                             )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
                {/* Back Navigation */}
                <button 
                    onClick={() => navigate('/search')}
                    className="flex items-center text-[10px] font-bold text-slate-500 hover:text-white mb-8 tracking-widest uppercase transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                    Achievements Search
                </button>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Large Avatar */}
                    <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-purple-600Blur opacity-40 blur-2xl rounded-full"></div>
                        <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-white/10 shadow-[0_0_40px_-5px_rgba(168,85,247,0.3)] relative z-10 overflow-hidden">
                            {student?.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-3xl font-bold text-slate-600">
                                    {student?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                            <ShieldCheck className="w-3 h-3" />
                            Identity Verified
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {student?.name || "Unknown Student"}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center text-slate-400 text-sm">
                                <Building2 className="w-4 h-4 mr-2 text-indigo-400" />
                                {student?.university || "Unknown University"}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg">
                                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs font-mono text-slate-300">
                                    {walletAddress}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12"></div>

                {/* Achievements Grid Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Achievements Grid</h2>
                        <span className="px-3 py-1 rounded-md bg-purple-900/30 border border-purple-500/20 text-purple-300 text-xs font-bold">
                            {credentials?.length || 0} BADGES SECURED
                        </span>
                    </div>

                    {credentials && credentials.length > 0 ? (
                        <div className="grid gap-6">
                            {credentials.map((cred) => (
                                <DetailedCertificateCard 
                                    key={cred._id} 
                                    credential={cred} 
                                    metadata={cred.type === 'TRANSCRIPT' ? cred.transcriptData : cred.certificationData} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Globe className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No Public Badges</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm">
                                This student hasn't added any achievements to their public achievement grid yet.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PublicProfile;
