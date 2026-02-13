import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { 
    ShieldCheck, 
    Building2, 
    Wallet, 
    Globe, 
    ArrowLeft, 
    Loader2,
    Award,
    Search,
    Share2,
    CheckCircle,
    Shield
} from 'lucide-react';
import DetailedCertificateCard from '../components/certificate/DetailedCertificateCard';
import Button from '../components/shared/Button';

const StudentPublicProfile = () => {
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
                 {/* Background Elements */}
                 <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                    <p className="text-slate-400 animate-pulse font-medium tracking-wide uppercase text-sm">Verifying Identity on Blockchain...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                
                <div className="relative z-10 max-w-md w-full bg-gray-900/40 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 mx-auto">
                        <ShieldCheck className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Profile Not Found</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
                    <Button 
                        onClick={() => navigate('/search')}
                        className="w-full bg-white text-black hover:bg-gray-200"
                    >
                        Back to Search
                    </Button>
                </div>
            </div>
        );
    }

    const { student, credentials } = data;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            
            {/* Background Elements */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navbar - Floating Island */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="w-full max-w-5xl bg-[#030014]/60 backdrop-blur-2xl border border-white/10 rounded-full pl-6 pr-2 py-2 flex items-center justify-between shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:border-indigo-500/30 transition-colors">
                    
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black p-[1px] border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors hidden sm:block">
                            Attestify
                        </span>
                    </div>

                    {/* Center: Navigation Links */}
                     <div className="hidden md:flex items-center gap-1">
                        <button onClick={() => navigate('/search')} className="px-5 py-2 text-sm font-medium text-white bg-white/10 rounded-full flex items-center gap-2 border border-white/5 shadow-inner">
                             <Search className="w-3.5 h-3.5 text-indigo-400" />
                             Public Explorer
                        </button>
                     </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={() => navigate('/search')}
                            className="bg-white/5 hover:bg-white/10 text-white border-0 rounded-full w-10 h-10 p-0 flex items-center justify-center group"
                            title="Back to Search"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Profile Header Card */}
                <div className="relative mb-20">
                     {/* Glow behind card */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] -z-10 rounded-full"></div>

                    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                        
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative w-32 h-32 rounded-2xl bg-gray-900 border-2 border-white/10 overflow-hidden shadow-2xl">
                                    {student?.avatar ? (
                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-gray-900 flex items-center justify-center text-4xl font-bold text-indigo-300">
                                            {student?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-gray-900 p-1.5 rounded-full border border-gray-800">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 text-center md:text-left pt-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <ShieldCheck className="w-3 h-3" />
                                    Identity Verified
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                    {student?.name || "Unknown Student"}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                                    <div className="flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors">
                                        <Building2 className="w-4 h-4 mr-2 text-purple-400" />
                                        {student?.university || "Unknown University"}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-colors group/wallet cursor-pointer" title="Copy Address">
                                        <Wallet className="w-4 h-4 text-emerald-400" />
                                        <span className="font-mono text-gray-400 group-hover/wallet:text-white transition-colors">
                                            {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <Button className="h-10 px-6 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                                        Connect
                                    </Button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-end justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verified Credentials</h2>
                            <p className="text-gray-400 text-sm">Blockchain-verified academic achievements and certifications.</p>
                        </div>
                        <div className="hidden sm:block">
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold font-mono">
                                <Award className="w-3.5 h-3.5" />
                                {credentials?.length || 0} BADGES
                            </div>
                        </div>
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
                        <div className="w-full bg-gray-900/40 border border-white/10 rounded-3xl p-16 text-center backdrop-blur-sm relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           
                            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                <Globe className="w-8 h-8 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">No Public Badges</h3>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm relative z-10">
                                This student hasn't added any achievements to their public achievement grid yet.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentPublicProfile;
