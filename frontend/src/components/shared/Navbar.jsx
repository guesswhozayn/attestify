import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Menu, X, Globe, BookOpen, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const Navbar = ({ onToggleSidebar, showSidebarToggle = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Documentation', path: '/docs', icon: BookOpen },
        { name: 'Public Explorer', path: '/search', icon: Search },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 ${isScrolled ? 'top-0 px-0' : 'top-6 px-2 sm:px-4'}`}>
            <div className={`w-full transition-all duration-300 flex items-center justify-between border-white/10 backdrop-blur-2xl ${
                isScrolled 
                    ? 'max-w-full rounded-none border-b bg-black/80 px-6 py-3 shadow-lg' 
                    : 'max-w-5xl rounded-full border bg-[#030014]/60 pl-6 pr-2 py-2 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:border-indigo-500/30'
            }`}>
                
                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black p-[1px] border border-white/10 group-hover:scale-110 transition-transform duration-300">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <Shield className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors hidden sm:block">
                        Attestify
                    </span>
                </div>

                {/* Center: Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <button 
                            key={link.path}
                            onClick={() => navigate(link.path)} 
                            className={`px-5 py-2 text-sm font-medium transition-all rounded-full flex items-center gap-2 group relative overflow-hidden ${
                                isActive(link.path)
                                    ? 'text-white bg-white/10 border border-white/5 shadow-inner'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {link.icon && (
                                <link.icon className={`w-3.5 h-3.5 ${isActive(link.path) ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`} />
                            )}
                            {link.name}
                            {isActive(link.path) && (
                                <motion.div 
                                    layoutId="nav-active"
                                    className="absolute inset-0 bg-indigo-500/10 pointer-events-none"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="hidden sm:block px-5 py-2.5 text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                    >
                        Sign In
                    </button>
                    <Button 
                        onClick={() => navigate('/register')} 
                        className="hidden sm:flex bg-white text-black hover:bg-indigo-50 hover:text-indigo-950 border-0 rounded-full px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <span className="relative z-10">Get Started</span>
                    </Button>
                    
                    {/* Mobile Controls */}
                    <div className="flex items-center gap-1">
                        {showSidebarToggle && (
                            <button
                                onClick={onToggleSidebar}
                                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className={`w-6 h-6 ${showSidebarToggle ? 'hidden' : 'block md:hidden'}`} />}
                            {!showSidebarToggle && !mobileMenuOpen && <Menu className="w-6 h-6 md:hidden" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 mt-4 mx-4 p-6 bg-[#030014]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl md:hidden z-40"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <button 
                                    key={link.path}
                                    onClick={() => {
                                        navigate(link.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                                        isActive(link.path)
                                            ? 'bg-indigo-500/10 text-white border border-indigo-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {link.icon && <link.icon className="w-5 h-5 text-indigo-400" />}
                                    {link.name}
                                </button>
                            ))}
                            <div className="h-px bg-white/5 my-2" />
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="px-4 py-3 rounded-2xl text-sm font-bold text-white border border-white/10 hover:bg-white/5 transition-all text-center"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="px-4 py-3 rounded-2xl text-sm font-bold bg-white text-black hover:bg-indigo-50 transition-all text-center"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
