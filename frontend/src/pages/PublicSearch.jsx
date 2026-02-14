import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Wallet, ArrowRight, Globe, Star, Building, ChevronRight, Loader, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { publicAPI } from '../services/api';

const PublicSearch = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('student'); // 'student' | 'institute'
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Spotlight Effect State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const searchTerm = query.trim();

        if (searchType === 'student') {
            navigate(`/student/${searchTerm}`);
        } else {
            setLoading(true);
            try {
                if (searchTerm.startsWith('0x')) {
                    navigate(`/institute/wallet/${searchTerm}`);
                } else {
                    const response = await publicAPI.searchInstitutes(searchTerm);
                    setResults(response.data.success ? response.data.institutes : []);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }
    };

    const trendingInstitutes = [
        { name: 'MIT', wallet: '0x123...abc' },
        { name: 'Stanford', wallet: '0x456...def' },
        { name: 'Oxford', wallet: '0x789...ghi' },
    ];

    return (
        <div 
            ref={containerRef}
            className="min-h-screen font-sans flex flex-col relative"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Spotlight Layer */}
                <div 
                    className="absolute inset-0 opacity-40 transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`
                    }}
                />
                
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                
                {/* Grid Pattern with Spotlight Mask */}
                <div 
                    className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
                    style={{
                        maskImage: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`
                    }}
                ></div>
            </div>

            <Navbar />

            {/* Main Content */}
            <main className="min-h-screen flex-grow flex flex-col items-center justify-center relative z-[1] px-4 pt-28 pb-16">
                <div className={`w-full max-w-4xl flex flex-col items-center text-center ${results ? 'mb-12' : 'mb-0'}`}>
                    
                    {/* Top Status Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Public Explorer</span>
                    </motion.div>

                    {/* Dynamic Heading */}
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9] text-white"
                    >
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-500 bg-[length:200%_auto] animate-shimmer">Academic</span> <br />
                        Truth.
                    </motion.h1>

                    {/* Subheading */}
                    <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed font-medium">
                        {searchType === 'student' 
                            ? "Look up any student by wallet address or credential ID."
                            : "Search for authorized institutions by name or wallet."}
                    </p>

                    {/* Search Architecture */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="w-full max-w-3xl relative z-20 group"
                    >
                        {/* Container Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700 animate-pulse"></div>

                        <div className="relative bg-gray-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex flex-col sm:flex-row items-center shadow-2xl transition-all duration-300 group-focus-within:border-indigo-500/40 group-focus-within:ring-1 ring-indigo-500/20">
                            
                            {/* Toggle - Premium Segmented Control */}
                            <div className="relative flex bg-black/40 rounded-3xl p-1.5 border border-white/5 w-full sm:w-auto mb-3 sm:mb-0">
                                <motion.div 
                                    className="absolute inset-y-1.5 bg-indigo-600 rounded-2xl shadow-lg border border-indigo-400/20"
                                    initial={false}
                                    animate={{ 
                                        x: searchType === 'student' ? 0 : '100%',
                                        width: 'calc(50% - 6px)'
                                    }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setSearchType('student'); setResults(null); }}
                                    className={`relative z-10 px-6 py-3 text-xs font-black transition-colors duration-500 w-1/2 sm:w-28 uppercase tracking-widest ${searchType === 'student' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSearchType('institute'); setResults(null); }}
                                    className={`relative z-10 px-6 py-3 text-xs font-black transition-colors duration-500 w-1/2 sm:w-28 uppercase tracking-widest ${searchType === 'institute' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Inst.
                                </button>
                            </div>

                            {/* Inner Input */}
                            <form onSubmit={handleSearch} className="flex-1 flex items-center w-full">
                                <div className="absolute left-6 text-indigo-400 group-focus-within:scale-110 transition-transform hidden sm:block">
                                    {searchType === 'student' ? <Wallet className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={searchType === 'student' ? "Wallet (0x...) or Credential ID" : "Search Institutions by Name..."}
                                    className="w-full bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none text-base font-bold sm:pl-14 pl-6 pr-4 h-16"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="mr-2 px-8 py-4 bg-white text-black hover:bg-indigo-50 rounded-3xl shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-3 group/btn shrink-0"
                                >
                                    {loading ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="font-black text-xs uppercase tracking-widest hidden sm:block">Explore</span>
                                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Insight Chips */}
                    {!results && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex flex-wrap justify-center gap-2"
                        >
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest py-2 mr-2">Trending:</span>
                            {trendingInstitutes.map((inst, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setQuery(inst.name)}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all flex items-center gap-2 group"
                                >
                                    <Star className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                                    {inst.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Search Results - Staggered Entry */}
                <AnimatePresence mode="wait">
                    {results && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-4xl mt-12 grid grid-cols-1 gap-4"
                        >
                            {results.length > 0 ? (
                                results.map((inst, idx) => (
                                    <motion.div 
                                        key={inst._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => navigate(`/institute/${inst._id}`)}
                                        className="group relative bg-gray-900/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer hover:bg-white/5 hover:border-indigo-500/20 transition-all shadow-lg"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/5 group-hover:to-purple-500/5 transition-all rounded-3xl pointer-events-none"></div>
                                        
                                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0">
                                            {inst.avatar ? (
                                                <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <Building className="w-10 h-10" />
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tighter">{inst.name}</h3>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit mx-auto sm:mx-0">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400/80 font-medium max-w-xl leading-relaxed">Authorized educational pillar within the Attestify blockchain registry.</p>
                                        </div>

                                        <div className="flex items-center gap-6 shrink-0 mt-4 sm:mt-0">
                                            <div className="text-right hidden lg:block">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-xs font-bold text-white uppercase">Active Issuer</p>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white text-gray-500 group-hover:text-black transition-all">
                                                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-20 bg-gray-900/30 border border-white/5 rounded-3xl text-center relative overflow-hidden flex flex-col items-center"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] opacity-50"></div>
                                    <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-8 border border-white/10 relative z-10 shadow-2xl">
                                        <Info className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4 relative z-10 uppercase tracking-tighter">Null Result</h3>
                                    <p className="text-gray-400 max-w-sm text-base font-medium relative z-10 leading-relaxed">
                                        No authorized registry found for "{query}". <br/>
                                        <span className="text-indigo-400">Search Hint:</span> Try "MIT" or a valid 0x wallet address.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PublicSearch;
