import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Wallet, ArrowRight, Globe, Star, Building, ChevronRight, Loader, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import { publicAPI } from '../services/api';

const PublicSearch = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('student'); // 'student' | 'institute'
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const searchTerm = query.trim();

        if (searchType === 'student') {
            navigate(`/student/${searchTerm}`);
        } else {
            // Institute Search
            if (searchTerm.startsWith('0x')) {
                // Wallet Address Search
                navigate(`/institute/wallet/${searchTerm}`);
            } else {
                // Name Search
                setLoading(true);
                try {
                    const response = await publicAPI.searchInstitutes(searchTerm);
                    if (response.data.success) {
                        setResults(response.data.institutes);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            }
        }
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

            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 pt-32 pb-20">
                <div className={`w-full max-w-3xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 ${results ? 'mt-8' : ''}`}>
                    
                    {/* Top Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
                    >
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Global Achievement Network</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.05]"
                    >
                        Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-[length:200%_auto] animate-shimmer">
                            {searchType === 'student' ? 'Credentials' : 'Institutions'}
                        </span> <br />
                        On the Blockchain.
                    </motion.h1>

                    {/* Subtext */}
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                        {searchType === 'student' 
                            ? "Search for any student via their wallet address to view their verified digital credentials."
                            : "Find authorized educational institutions by name or wallet address to verify their identity."}
                    </p>

                    {/* Search Component - Premium Web3 Redesign */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-3xl relative z-20 mb-12 group"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700"></div>

                        <form onSubmit={handleSearch} className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl ring-1 ring-white/5 group-focus-within:ring-indigo-500/30 transition-all duration-300">
                            
                            {/* Toggle - Sliding Pill */}
                            <div className="relative flex bg-black/20 rounded-xl p-1 mr-2 border border-white/5">
                                <div 
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-lg border border-white/5 transition-all duration-300 ease-out shadow-sm ${searchType === 'institute' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                                ></div>
                                <button
                                    type="button"
                                    onClick={() => { setSearchType('student'); setResults(null); }}
                                    className={`relative z-10 px-4 py-2 text-xs font-medium transition-colors duration-300 ${searchType === 'student' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSearchType('institute'); setResults(null); }}
                                    className={`relative z-10 px-4 py-2 text-xs font-medium transition-colors duration-300 ${searchType === 'institute' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Institute
                                </button>
                            </div>

                            {/* Separator */}
                            <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

                            {/* Input Field */}
                            <div className="flex-1 relative flex items-center">
                                <div className="absolute left-3 text-indigo-400 pointer-events-none">
                                    {searchType === 'student' ? <Wallet className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={searchType === 'student' ? "Search by Wallet Address (0x...)" : "Search Institutes by Name..."}
                                    className="w-full bg-transparent border-none text-white placeholder:text-gray-500 focus:outline-none text-sm sm:text-base font-medium pl-10 pr-4 h-12"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            {/* Search Button */}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="ml-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group/btn shrink-0"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Search Results (Institute Name Search) */}
                    {results && (
                        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden text-left shadow-2xl relative group/results">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                                
                                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Search className="w-4 h-4 text-indigo-400" />
                                        Search Results
                                    </h3>
                                    <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">{results.length} found</span>
                                </div>
                                
                                {results.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {results.map((inst) => (
                                            <div 
                                                key={inst._id}
                                                onClick={() => navigate(`/institute/${inst._id}`)}
                                                className="p-6 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-5 group/item"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all duration-300 shadow-lg group-hover/item:shadow-indigo-500/25 overflow-hidden">
                                                    {inst.avatar ? (
                                                        <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-lg text-white group-hover/item:text-indigo-300 transition-colors">{inst.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                        <p className="text-xs text-slate-400">Verified Institute</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-indigo-500/20 group-hover/item:text-indigo-300 transition-colors">
                                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover/item:text-indigo-300 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50"></div>
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 relative z-10">
                                            <Info className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 relative z-10">No matches found</h3>
                                        <p className="text-gray-400 max-w-sm mx-auto text-sm relative z-10">
                                            We couldn't find any institutions matching "{query}". Try checking the name or searching by wallet address.
                                        </p>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {/* Footer / Trust Signals */}
                    {!results && (
                        <div className="mt-16 flex flex-wrap justify-center gap-10 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
                             <div className="flex flex-col items-center gap-3 group px-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all shadow-lg shadow-black/50">
                                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Cryptographically Secured</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 group px-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all shadow-lg shadow-black/50">
                                    <Star className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                                </div>
                                 <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Instantly Verifiable</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 group px-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all shadow-lg shadow-black/50">
                                    <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                </div>
                                 <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Public Search Ready</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

             {/* Simple Footer */}
            <footer className="w-full border-t border-white/5 py-8 mt-auto relative z-10 bg-black/50 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                    <p>&copy; 2026 Attestify. All rights reserved.</p>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <span className="hover:text-gray-400 transition-colors cursor-pointer">Privacy</span>
                        <span className="hover:text-gray-400 transition-colors cursor-pointer">Terms</span>
                        <span className="flex items-center gap-1">Made with <span className="text-red-500/50">♥</span> for Web3</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicSearch;
