import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, ArrowRight, ShieldCheck, Globe, Star } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/shared/Button';

const PublicSearch = () => {
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (address.trim()) {
            navigate(`/public/profile/${address.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-indigo-500/30">
            <Header title="Public Verification" showSearch={false} />

            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-20 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                    <header className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">
                            <Globe className="w-4 h-4" />
                            Global Achievement Network
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
                            Verify Achievements <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">
                                On the Blockchain.
                            </span>
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Search for any student via their wallet address to view their verified digital credentials, 
                            badges, and academic achievements.
                        </p>
                    </header>

                    {/* Search Interface */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        <form 
                            onSubmit={handleSearch}
                            className="relative group max-w-2xl mx-auto"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative bg-gray-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-3 flex flex-col md:flex-row items-center gap-3">
                                <div className="flex-1 w-full relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Paste wallet address (0x...)"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-lg py-4 pl-16 pr-6 placeholder:text-gray-600 placeholder:font-sans"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 hover:translate-x-1"
                                >
                                    Explore Profile
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 flex flex-wrap justify-center gap-6 animate-in fade-in duration-1000 delay-500">
                            <FeatureItem icon={ShieldCheck} text="Cryptographically Secured" />
                            <FeatureItem icon={Star} text="Instantly Verifiable" />
                            <FeatureItem icon={Search} text="Public Search Ready" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 text-gray-500 py-1.5">
        <Icon className="w-4 h-4 text-indigo-500/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.1em]">{text}</span>
    </div>
);

export default PublicSearch;
