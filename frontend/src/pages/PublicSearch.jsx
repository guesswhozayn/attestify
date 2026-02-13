import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Wallet, ArrowRight, Globe, Star } from 'lucide-react';
import Button from '../components/shared/Button';

const PublicSearch = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/student/${query.trim()}`);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden flex flex-col relative">
            {/* Background Effects*/}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Navbar*/}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="w-full max-w-5xl bg-[#030014]/60 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 pl-6 flex items-center justify-between shadow-2xl shadow-indigo-500/10 animate-in slide-in-from-top-4 duration-700">
                    
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                         <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors hidden sm:block">
                            Public Explorer
                        </span>
                    </div>

                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-1">
                        <button onClick={() => navigate('/')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full relative group">
                           Home
                        </button>
                        <button onClick={() => navigate('/docs')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full relative group">
                           Documentation
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pr-2">
                        <Button 
                            onClick={() => navigate('/login')} 
                            className="bg-white text-black hover:bg-indigo-50 hover:text-indigo-950 border-0 rounded-full px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                            <span className="relative z-10">Sign In</span>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 pt-20">
                <div className="w-full max-w-3xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Top Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Global Achievement Network</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
                        Verify Achievements <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            On the Blockchain.
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                        Search for any student via their wallet address to view their verified digital credentials, badges, and academic achievements.
                    </p>

                    {/* Search Component */}
                    <div className="w-full max-w-2xl relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full opacity-25 blur-lg group-hover:opacity-40 transition duration-1000"></div>
                        
                        <form onSubmit={handleSearch} className="relative flex items-center bg-gray-900/60 border border-white/10 backdrop-blur-xl rounded-full p-2 pl-6 shadow-2xl transition-all ring-1 ring-white/5 focus-within:ring-indigo-500/50">
                            <Wallet className="w-6 h-6 text-gray-500 mr-4" />
                            <input 
                                type="text" 
                                placeholder="Paste wallet address (0x...)" 
                                className="flex-1 bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none text-lg font-mono tracking-wide w-full"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="ml-4 px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 group/btn"
                            >
                                EXPLORE PROFILE
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Footer / Trust Signals */}
                    <div className="mt-20 flex flex-wrap justify-center gap-10 md:gap-16">
                         <div className="flex flex-col items-center gap-3 group px-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
                                <Shield className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Cryptographically Secured</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 group px-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all">
                                <Star className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                            </div>
                             <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Instantly Verifiable</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 group px-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all">
                                <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </div>
                             <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Public Search Ready</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicSearch;
