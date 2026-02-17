import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Search, Building, ArrowRight, Sparkles, CheckCircle, ChevronRight, Loader, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicAPI } from '../services/api';

const PublicSearch = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('student'); // 'student' | 'issuer'
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const stats = [
        { label: 'Total Credentials', value: '1.2M+', icon: CheckCircle, color: 'text-emerald-400' },
        { label: 'Active Issuers', value: '450+', icon: Building, color: 'text-indigo-400' },
        { label: 'Verifications Today', value: '25K+', icon: Sparkles, color: 'text-purple-400' },
    ];

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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Back Button */}
            <div className="fixed top-8 left-8 z-50">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group text-xs font-black uppercase tracking-widest backdrop-blur-xl"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>
            </div>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150"></div>
            </div>

            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl w-full space-y-24 py-20">
                    
                    {/* Hero Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-xl hover:bg-white/[0.05] transition-all cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Open Registry Explorer</span>
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            Explore the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer">
                                Trust Layer.
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                            The definitive public index for academic credentials. <br className="hidden sm:block" />
                            Discover verified institutions and validate global achievement.
                        </p>
                    </motion.div>

                    {/* Integrated Search Console */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-[#050505] border border-white/[0.08] rounded-[2.5rem] p-4 shadow-3xl relative overflow-hidden group">
                           {/* Subtle Gradient Glow */}
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-50"></div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row gap-4">
                              {/* Type Switcher */}
                              <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shrink-0">
                                 <button
                                    onClick={() => { setSearchType('student'); setResults(null); }}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                        searchType === 'student' 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                 >
                                    <Wallet className="w-4 h-4" />
                                    Student
                                 </button>
                                 <button
                                    onClick={() => { setSearchType('issuer'); setResults(null); }}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                        searchType === 'issuer' 
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                 >
                                    <Building className="w-4 h-4" />
                                    Issuer
                                 </button>
                              </div>

                              {/* Action Input */}
                              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 px-4 py-2">
                                 <div className="text-gray-600">
                                    <Search size={22} className="group-focus-within:text-indigo-400 transition-colors" />
                                 </div>
                                 <input 
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={searchType === 'student' ? "Input Wallet Address (0x...)" : "Search by Institution Name..."}
                                    className="flex-1 bg-transparent border-none text-white placeholder:text-gray-700 focus:outline-none text-lg font-medium"
                                 />
                                 <button
                                    type="submit"
                                    disabled={loading || !query}
                                    className="hidden md:flex h-12 px-8 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-sm uppercase tracking-widest items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                 >
                                    {loading ? <Loader className="w-4 h-4 animate-spin text-black" /> : 'Execute'}
                                 </button>
                              </form>
                           </div>
                        </div>

                        {/* Search Results Display */}
                        <AnimatePresence>
                           {results && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-8 grid gap-4">
                                        {results.length > 0 ? (
                                            results.map((inst, idx) => (
                                                <motion.div 
                                                    key={inst._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    onClick={() => navigate(`/issuer/${inst._id}`)}
                                                    className="bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/50 hover:bg-white/[0.06] rounded-3xl p-6 flex items-center gap-6 cursor-pointer transition-all group/res"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-3">
                                                        {inst.avatar ? (
                                                            <img src={inst.avatar} alt={inst.name} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Building className="w-7 h-7 text-gray-500 group-hover/res:text-indigo-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                       <h4 className="text-xl font-bold text-white group-hover/res:text-indigo-300 transition-colors">{inst.name}</h4>
                                                       <p className="text-xs font-black text-gray-500 uppercase tracking-[0.15em] mt-1 italic">Verified Official Issuer</p>
                                                    </div>
                                                    <ChevronRight className="w-6 h-6 text-gray-600 group-hover/res:text-white group-hover/res:translate-x-1 transition-all" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">No matching records found in the current registry.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                           )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {stats.map((stat, idx) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 + 0.4 }}
                            className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors group text-center md:text-left"
                          >
                             <div className={`p-3 rounded-2xl bg-black border border-white/10 inline-flex mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                             </div>
                             <div className="text-3xl font-black text-white mb-2 leading-none tracking-tighter">{stat.value}</div>
                             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
                          </motion.div>
                       ))}
                    </div>


                </div>
            </main>
        </div>
    );
};

export default PublicSearch;
