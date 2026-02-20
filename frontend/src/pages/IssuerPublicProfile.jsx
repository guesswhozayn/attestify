import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    Loader2,
    Share2,
    CheckCircle,
    Copy,
    Mail,
    Hash,
    Award
} from 'lucide-react';
import { publicAPI } from '../services/api';
import Button from '../components/shared/Button';
import Avatar from '../components/shared/Avatar';
import BackButton from '../components/shared/BackButton';
import PoweredBy from '../components/shared/PoweredBy';

const IssuerPublicProfile = () => {
    const { id, walletAddress } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIssuerProfile = async () => {
            setLoading(true);
            try {
                let response;
                if (id) {
                    response = await publicAPI.getIssuerProfile(id);
                } else if (walletAddress) {
                    response = await publicAPI.getIssuerProfileByWallet(walletAddress);
                } else {
                    throw new Error('No identifier provided');
                }

                if (response.data.success) {
                    setData(response.data.issuer);
                }
            } catch (err) {
                console.error('Failed to fetch issuer profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (id || walletAddress) {
            fetchIssuerProfile();
        }
    }, [id, walletAddress]);

    const handleCopy = (text) => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    useEffect(() => {
        if (error) {
            navigate('/search', { 
                state: { 
                    autoSearch: true, 
                    query: id || walletAddress, 
                    type: 'issuer' 
                },
                replace: true
            });
        }
    }, [error, navigate, id, walletAddress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
                 {/* Background Elements */}
                 <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                 <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                    <p className="text-slate-400 animate-pulse font-medium tracking-wide uppercase text-sm">Verifying Issuer Identity...</p>
                </div>
            </div>
        );
    }

    if (error) return null;

    if (!data) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col">
            
            {/* Background Elements */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <BackButton fallbackPath="/search" />

            <main className="relative z-10 flex-grow flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                
                {/* Profile Header Card */}
                <div className="relative mb-12">
                     {/* Glow behind card */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] -z-10 rounded-full"></div>

                    <div className="rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                        
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            {/* Logo/Avatar */}
                            <div className="relative shrink-0 group/avatar">
                                <Avatar 
                                    src={data.avatar} 
                                    initials={data.details?.institutionName || data.name} 
                                    size="lg" 
                                    className="!w-24 !h-24 sm:!w-32 sm:!h-32"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-gray-900 p-1.5 rounded-full border border-gray-800 z-20">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 text-center md:text-left pt-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified Issuer
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                    {data.details?.institutionName || data.name}
                                </h1>

                                <p className="text-gray-400 max-w-2xl mb-6 text-sm leading-relaxed mx-auto md:mx-0">
                                    {data.about || "This issuer has been verified by the Attestify protocol and is authorized to issue on-chain credentials."}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <Button 
                                        variant="white"
                                        rounded="full"
                                        size="sm"
                                        className="h-10 px-6 normal-case tracking-normal"
                                    >
                                        View Credentials
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        rounded="full"
                                        size="sm"
                                        className="h-10 w-10 !px-0 !py-0 group/share"
                                    >
                                        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issuer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* Public Contact */}
                    <div className="bg-gray-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-gray-900/50 transition-colors group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Contact</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Official Channel</p>
                            </div>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-gray-300 font-mono truncate">
                                {data.email}
                            </span>
                            <Button 
                                onClick={() => handleCopy(data.email)}
                                variant="ghost"
                                size="sm"
                                rounded="full"
                                className="!p-2 text-gray-500 hover:text-white"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Registry Info */}
                    <div className="bg-gray-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-gray-900/50 transition-colors group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Registry ID</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">On-Chain Identifier</p>
                            </div>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                            <span className="text-sm text-gray-300 font-mono truncate">
                                {data._id}
                            </span>
                            <Button 
                                onClick={() => handleCopy(data._id)}
                                variant="ghost"
                                size="sm"
                                rounded="full"
                                className="!p-2 text-gray-500 hover:text-white"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>



            </main>
            <PoweredBy />
        </div>
    );
};

export default IssuerPublicProfile;
