import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    User, Building, Award, CheckCircle, Clock, ExternalLink, 
    ChevronRight, ArrowLeft, Loader, Shield, Globe, Mail, MapPin, Calendar
} from 'lucide-react';
import Header from '../components/layout/Header';
import api from '../services/api';

const InstituteProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstituteProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/public/institute/${id}`);
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

        if (id) {
            fetchInstituteProfile();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Institute Public Record...</p>
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
                            We couldn't find any institute associated with this ID.
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

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-indigo-500/30 pb-20">
            <Header title="Verified Institute" showSearch={false} />

            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
                {/* Back Link */}
                <Link 
                    to="/public/search"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-400 font-black uppercase tracking-widest text-[10px] mb-12 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Search
                </Link>

                {/* Profile Header */}
                <section className="relative mb-20 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative w-40 h-40 rounded-[2.5rem] bg-gray-900 border-4 border-gray-950 overflow-hidden flex items-center justify-center">
                                {data.details?.branding?.logo ? (
                                    <img src={data.details.branding.logo} alt={data.name} className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center text-5xl font-black text-white/50">
                                        <Building className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-4 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Shield className="w-3 h-3" />
                                Authorized Issuer
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight">{data.details?.institutionName || data.name}</h1>
                            
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                {data.email && (
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <Mail className="w-5 h-5 text-indigo-400" />
                                        {data.email}
                                    </div>
                                )}
                                {data.details?.registrationNumber && (
                                    <div className="flex items-center gap-2 text-gray-500 font-mono text-xs bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-800">
                                        <span className="text-gray-400">Reg:</span>
                                        {data.details.registrationNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    {/* About Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8">
                            <h2 className="text-2xl font-black text-white mb-6">About Institute</h2>
                            <p className="text-gray-400 leading-relaxed text-lg">
                                {data.about || "This institute has not provided a public description yet."}
                            </p>
                        </section>

                       {/* Official Seal Display (if available) */}
                        {data.details?.branding?.seal && (
                             <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 flex items-center gap-8">
                                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center p-4 border border-white/10">
                                    <img src={data.details.branding.seal} alt="Official Seal" className="w-full h-full object-contain opacity-80" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Official Digital Seal</h3>
                                    <p className="text-gray-500 text-sm">
                                        This cryptographic seal is included in all verifiable credentials issued by this institute.
                                    </p>
                                </div>
                             </section>
                        )}
                    </div>

                    {/* Sidebar / Metrics */}
                    <div className="space-y-6">
                         <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
                            <h3 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-4">Verification Status</h3>
                            <div className="flex items-center gap-3 text-white font-bold text-lg">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                Fully Authorized
                            </div>
                            <p className="text-gray-500 text-sm mt-2">
                                This institute is fully authorized to issue Soulbound Credentials on the Attestify Protocol.
                            </p>
                         </div>

                         {data.createdAt && (
                             <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex items-center gap-4">
                                 <div className="p-3 bg-gray-800 rounded-xl">
                                     <Calendar className="w-6 h-6 text-gray-400" />
                                 </div>
                                 <div>
                                     <p className="text-gray-500 text-xs font-bold uppercase">Member Since</p>
                                     <p className="text-white font-bold">{new Date(data.createdAt).getFullYear()}</p>
                                 </div>
                             </div>
                         )}

                         <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex items-center gap-4">
                             <div className="p-3 bg-gray-800 rounded-xl">
                                 <Globe className="w-6 h-6 text-gray-400" />
                             </div>
                             <div>
                                 <p className="text-gray-500 text-xs font-bold uppercase">Network</p>
                                 <p className="text-white font-bold">Ethereum Sepolia</p>
                             </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstituteProfile;
