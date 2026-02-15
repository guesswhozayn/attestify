import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Search, Building, ArrowRight, Sparkles, CheckCircle, ChevronRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/shared/Navbar';
import { publicAPI } from '../services/api';

const PublicSearch = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('student'); // 'student' | 'issuer'
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
            setLoading(true);
            try {
                if (searchTerm.startsWith('0x')) {
                    navigate(`/issuer/wallet/${searchTerm}`);
                } else {
                    const response = await publicAPI.searchIssuers(searchTerm);
                    setResults(response.data.success ? response.data.issuers : []);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-indigo-500/30">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            <main className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
                
                {/* Hero Headers */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-semibold text-gray-300 tracking-wider uppercase">Public Registry</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Verify Authenticity.
                    </h1>
                    
                    <p className="text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
                        The decentralized standard for academic verification. <br className="hidden sm:block" />
                        Search strictly by wallet address or issuer name.
                    </p>
                </motion.div>

                {/* Search Interface */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="w-full max-w-2xl"
                >
                    {/* Search Type Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center">
                            <button
                                onClick={() => { setSearchType('student'); setResults(null); }}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    searchType === 'student' 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => { setSearchType('issuer'); setResults(null); }}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    searchType === 'issuer' 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Issuer
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
                        
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl transition-all duration-300 focus-within:border-indigo-500/50">
                            <div className="pl-4 pr-3 text-gray-500">
                                {searchType === 'student' ? <Wallet size={20} /> : <Building size={20} />}
                            </div>
                            
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={searchType === 'student' ? "Enter Student Wallet Address..." : "Search Issuer Name or Address..."}
                                className="flex-1 bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none h-12 text-base"
                            />

                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-6 h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </form>

                    {/* Quick Hints */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 font-medium">
                            Try searching for prominent issuers like <span className="text-gray-300 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => { setSearchType('issuer'); setQuery('MIT'); }}>MIT</span> or <span className="text-gray-300 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => { setSearchType('issuer'); setQuery('Stanford'); }}>Stanford</span>
                        </p>
                    </div>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {results && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full max-w-3xl mt-16"
                        >
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Search Results</h3>
                                <span className="text-xs font-medium text-gray-600">{results.length} found</span>
                            </div>

                            <div className="grid gap-4">
                                {results.length > 0 ? (
                                    results.map((inst, idx) => (
                                        <motion.div 
                                            key={inst._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => navigate(`/issuer/${inst._id}`)}
                                            className="group relative bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 sm:p-5 flex items-center gap-5 cursor-pointer transition-all hover:bg-white/10"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
                                                {inst.avatar ? (
                                                    <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Building className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-lg font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{inst.name}</h4>
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {inst.role === 'ISSUER' ? 'Authorized Issuer' : 'Educational Organization'}
                                                </p>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors shrink-0">
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                        <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400 font-medium">No issuers found matching "{query}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PublicSearch;
