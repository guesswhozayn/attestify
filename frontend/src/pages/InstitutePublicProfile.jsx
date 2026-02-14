import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    Building2, 
    Globe, 
    Loader2,
    Share2,
    CheckCircle,
    Mail,
    Calendar,
    Award,
    Copy,
    ExternalLink,
    Hash,
    Cpu,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicAPI } from '../services/api';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const DataField = ({ label, value, mono = false, copyable = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="group relative">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                {label}
            </label>
            <div className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                <span className={`text-sm text-gray-300 truncate pr-4 ${mono ? 'font-mono' : 'font-sans'}`}>
                    {value || 'N/A'}
                </span>
                {copyable && value && (
                    <button 
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

const InstitutePublicProfile = () => {
    const { id, walletAddress } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstituteProfile = async () => {
            setLoading(true);
            try {
                let response;
                if (id) {
                    response = await publicAPI.getInstituteProfile(id);
                } else if (walletAddress) {
                    response = await publicAPI.getInstituteProfileByWallet(walletAddress);
                } else {
                    throw new Error('No identifier provided');
                }

                if (response.data.success) {
                    setData(response.data.institute);
                }
            } catch (err) {
                console.error('Failed to fetch institute profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (id || walletAddress) {
            fetchInstituteProfile();
        }
    }, [id, walletAddress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden font-mono">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                 <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-full bg-cyan-500"
                    />
                 </div>
                 <p className="mt-4 text-xs text-cyan-500 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                
                <div className="relative z-10 max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 p-12 rounded-2xl shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 mx-auto">
                        <ShieldCheck className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 font-mono uppercase tracking-tight text-red-500">Entity Not Found</h2>
                    <p className="text-gray-400 mb-8 text-sm">{error}</p>
                    <Button 
                        onClick={() => navigate('/search')}
                        className="w-full bg-white text-black hover:bg-gray-200 font-mono text-xs uppercase tracking-widest"
                    >
                        Return to Search
                    </Button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
            
            {/* Global Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                
                {/* Glowing Orbs - Subtle */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            <Navbar showBackSearch={true} />

            <main className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Digital Passport Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    
                    {/* Left Column: Entity Identity (The "Passport" Cover) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden relative group">
                            {/* Neural Network Abstract BG */}
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50"></div>
                            
                            <div className="p-8 flex flex-col items-center text-center relative z-10">
                                {/* Logo Container */}
                                <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                                    <div className="relative w-40 h-40 bg-[#0a0a0a] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                         {data.details?.branding?.logo ? (
                                            <img src={data.details.branding.logo} alt={data.name} className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <Building2 className="w-16 h-16 text-zinc-700" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg shadow-cyan-900/20">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Verified Entity</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    {data.details?.institutionName || data.name}
                                </h1>
                                <p className="text-zinc-500 text-sm mb-8 font-mono">
                                    ID: {data.details?.registrationNumber || 'UNKNOWN_ID'}
                                </p>

                                <div className="w-full grid grid-cols-2 gap-3">
                                    <Button className="w-full bg-white text-black hover:bg-zinc-200 font-mono text-[10px] uppercase tracking-widest h-10">
                                        View Creds
                                    </Button>
                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white rounded-lg font-mono text-[10px] uppercase tracking-widest h-10 transition-colors flex items-center justify-center gap-2">
                                        <Share2 className="w-3 h-3" /> Share
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Footer of Card */}
                            <div className="bg-black/40 border-t border-white/5 p-4 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase">
                                <span>Attestify Protocol</span>
                                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> v2.4.0</span>
                            </div>
                        </div>

                         {/* Quick Stats Mini-Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Network</div>
                                <div className="text-cyan-400 font-mono text-sm flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Sepolia
                                </div>
                            </div>
                            <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Since</div>
                                <div className="text-white font-mono text-sm">
                                     {data.createdAt ? new Date(data.createdAt).getFullYear() : '2024'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Data & Verification (The "Passport" Pages) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Status Bar */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Issuer Authorization</div>
                                    <div className="text-emerald-500 text-xs font-mono">0x...ACTIVE</div>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Trust Score</div>
                                    <div className="text-white font-mono font-bold">100/100</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Valid Until</div>
                                    <div className="text-white font-mono font-bold">PERMANENT</div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Tabs (Visual only for now) */}
                        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl min-h-[500px] flex flex-col relative overflow-hidden">
                            {/* Header Line */}
                            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent"></div>
                            
                            <div className="p-8">
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-cyan-500" />
                                        Entity Profile Data
                                    </h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                                         {data.about || "No public description available for this entity. All on-chain actions are verifiable through the Attestify Registry contract."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <DataField label="Official Email" value={data.email} copyable />
                                    <DataField label="Wallet Address" value={walletAddress || data.walletAddress || "0x0000...0000"} mono copyable />
                                    <DataField label="Registry ID" value={data._id} mono copyable />
                                    <DataField label="Contract Version" value="v1.0.2 (Beta)" mono />
                                </div>

                                {/* Official Seal Section */}
                                {data.details?.branding?.seal && (
                                    <div className="border-t border-white/5 pt-8">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-purple-500" />
                                            Cryptographic Seal
                                        </h3>
                                        <div className="flex items-center gap-8 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed">
                                            <div className="w-24 h-24 shrink-0 relative">
                                                <img src={data.details.branding.seal} alt="Seal" className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 hover:opacity-50 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-zinc-500 font-mono mb-2">SEAL FINGERPRINT</div>
                                                <div className="text-sm text-purple-300 font-mono break-all">
                                                    0x8f2d...9a1b
                                                </div>
                                                <p className="text-zinc-600 text-[10px] mt-2 max-w-sm">
                                                    This seal is automatically embedded into every credential issued by this address.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Background Watermark */}
                            <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                <Building2 className="w-64 h-64" />
                            </div>
                        </div>

                    </div>
                </motion.div>

            </main>
            <Footer />
        </div>
    );
};

export default InstitutePublicProfile;
