import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { Home, Search, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-hidden">
             {/* Background Effects */}
             <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
             </div>

             <Navbar />

             <main className="flex-grow relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative"
                >
                    <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-black select-none opacity-50">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-lg w-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                            
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 animate-pulse">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            
                            <h2 className="text-3xl font-bold text-white mb-2">Block Not Found</h2>
                            <p className="text-gray-400 mb-8">
                                The information you are looking for does not exist on this chain. It may have been burned or never minted.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => navigate('/')} icon={Home} className="bg-white text-black hover:bg-gray-200">
                                    Return Home
                                </Button>
                                <Button onClick={() => navigate('/search')} variant="outline" icon={Search} className="border-white/10 hover:bg-white/5">
                                    Search Explorer
                                </Button>
                            </div>
                         </div>
                    </div>
                </motion.div>
                
                <div className="font-mono text-xs text-gray-600">
                    ERROR_CODE: 0x404_PAGE_NOT_FOUND
                </div>
             </main>

             <Footer />
        </div>
    );
};

export default NotFound;
