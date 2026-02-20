import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Search, Building, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicAPI } from '../services/api';
import Button from '../components/shared/Button';
import BackButton from '../components/shared/BackButton';
import PoweredBy from '../components/shared/PoweredBy';

const PublicExplorer = () => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('student'); // 'student' | 'issuer'
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.autoSearch) {
            const { query: autoQuery, type: autoType } = location.state;
            setQuery(autoQuery || '');
            setSearchType(autoType || 'student');
            setResults([]); // Immediately show the "no records found" view
        }
    }, [location.state]);


    const stats = [
        { label: 'Total Credentials', value: '1.2M+', icon: CheckCircle, color: 'text-emerald-400' },
        { label: 'Active Issuers', value: '450+', icon: Building, color: 'text-indigo-400' },
        { label: 'Verifications Today', value: '25K+', icon: Sparkles, color: 'text-purple-400' },
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const searchTerm = query.trim();
        setLoading(true);
        setResults(null);

        try {
            if (searchType === 'student') {
                try {
                    await publicAPI.getStudentProfile(searchTerm);
                    navigate(`/student/${searchTerm}`);
                } catch (error) {
                    if (error.response?.status === 404) {
                        setResults([]);
                    } else {
                        console.error('Student existence check failed:', error);
                        // Optional: show a generic error if it's not a 404
                    }
                }
            } else {
                if (searchTerm.startsWith('0x')) {
                    navigate(`/issuer/wallet/${searchTerm}`);
                } else {
                    const response = await publicAPI.searchIssuers(searchTerm);
                    setResults(response.data.success ? response.data.issuers : []);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <BackButton fallbackPath="/" text="Back to Home" force={true} />

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150"></div>
            </div>

            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-5xl w-full flex flex-col justify-center h-full py-12 gap-8 md:gap-12">
                    
                    {/* Hero Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/3 border border-white/8 mb-8 backdrop-blur-xl hover:bg-white/5 transition-all cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Open Registry Explorer</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                            Explore the <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-white to-indigo-300 bg-size-[200%_auto] animate-shimmer">
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
                        <div className="bg-[#050505] border border-white/8 rounded-[2.5rem] p-4 shadow-3xl relative overflow-hidden group">
                           {/* Subtle Gradient Glow */}
                           <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-50"></div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row gap-4">
                              {/* Type Switcher */}
                              <div className="flex bg-white/3 p-1.5 rounded-2xl border border-white/5 shrink-0">
                                 <Button
                                    onClick={() => { setSearchType('student'); setResults(null); }}
                                    variant={searchType === 'student' ? 'primary' : 'ghost'}
                                    rounded="2xl"
                                    size="sm"
                                    className={`px-8 py-3 shadow-none! flex items-center gap-2 ${
                                        searchType === 'student' ? '' : 'text-gray-500'
                                    }`}
                                 >
                                    <Wallet className="w-4 h-4" />
                                    Student
                                 </Button>
                                 <Button
                                    onClick={() => { setSearchType('issuer'); setResults(null); }}
                                    variant={searchType === 'issuer' ? 'primary' : 'ghost'}
                                    rounded="2xl"
                                    size="sm"
                                    className={`px-8 py-3 shadow-none! flex items-center gap-2 ${
                                        searchType === 'issuer' ? '' : 'text-gray-500'
                                    }`}
                                 >
                                    <Building className="w-4 h-4" />
                                    Issuer
                                 </Button>
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
                                 <Button
                                    type="submit"
                                    variant="white"
                                    size="sm"
                                    disabled={loading || !query}
                                    className="hidden md:flex h-12 px-8 rounded-2xl normal-case tracking-normal"
                                    loading={loading}
                                 >
                                    {loading ? 'Executing...' : 'Execute'}
                                 </Button>
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
                                                    className="bg-white/3 border border-white/8 hover:border-indigo-500/50 hover:bg-white/6 rounded-3xl p-6 flex items-center gap-6 cursor-pointer transition-all group/res"
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
                                            <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl bg-white/2">
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
                            className="bg-white/2 border border-white/5 rounded-3xl p-8 hover:bg-white/4 transition-colors group text-center md:text-left"
                          >
                             <div className={`p-3 rounded-2xl bg-black border border-white/10 inline-flex mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                             </div>
                             <div className="text-3xl font-black text-white mb-2 leading-none tracking-tighter">{stat.value}</div>
                             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
                          </motion.div>
                       ))}
                    </div>



                    
                    <PoweredBy className="mt-4" />
                </div>
            </main>
        </div>
    );
};

export default PublicExplorer;
