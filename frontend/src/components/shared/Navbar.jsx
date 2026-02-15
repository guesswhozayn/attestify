import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, BookOpen, CheckCircle, Menu, X, ArrowLeft, LogIn, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import Avatar from './Avatar';

const Navbar = ({ showBackSearch = false, showSidebarToggle = false, onToggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Public Explorer', path: '/search', icon: Search },
        { name: 'Docs', path: '/docs', icon: BookOpen },
        { name: 'Verify', path: '/verify', icon: CheckCircle },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-6 pointer-events-none">
            <div className={`
                w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-in-out
                ${isScrolled 
                    ? 'bg-black/80 backdrop-blur-2xl border-white/10 rounded-2xl px-6 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]' 
                    : 'bg-[#030014]/40 backdrop-blur-xl border-white/5 rounded-full px-6 py-2 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]'
                }
                border flex items-center justify-between group/nav hover:border-white/20 transition-all duration-500
            `}>
                
                {/* Left: Logo & Toggle */}
                <div className="flex items-center gap-4">
                    {showSidebarToggle && (
                        <button 
                            onClick={onToggleSidebar}
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div 
                        className="flex items-center gap-3 cursor-pointer group/logo" 
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover/logo:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black p-[1px] border border-white/10 group-hover/logo:scale-110 transition-transform duration-300">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-indigo-400 group-hover/logo:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white group-hover/logo:text-indigo-200 transition-colors hidden sm:block">
                            Attestify
                        </span>
                    </div>
                </div>

                {/* Center: Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`
                                relative px-5 py-2 text-sm font-bold transition-all duration-300 rounded-full flex items-center gap-2
                                ${isActive(link.path) 
                                    ? 'text-white bg-white/10 border border-white/10 shadow-inner' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-indigo-400' : 'text-gray-500'}`} />
                            {link.name}
                            {isActive(link.path) && (
                                <motion.div 
                                    layoutId="nav-active"
                                    className="absolute inset-0 rounded-full border border-indigo-500/50 pointer-events-none"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {showBackSearch && (
                        <button 
                            onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/search')}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 group/back text-xs font-bold uppercase tracking-wider"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover/back:-translate-x-1 transition-transform" />
                            Return
                        </button>
                    )}

                    <div className="h-6 w-[1px] bg-white/5 mx-2 hidden sm:block"></div>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="relative group/dash flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            >
                                <Avatar 
                                    src={user.avatar} 
                                    initials={user.name} 
                                    size="sm" 
                                    className="border-0 shadow-none scale-90 group-hover/dash:scale-100 transition-transform"
                                />
                                <div className="flex flex-col items-start pr-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/dash:text-indigo-400 transition-colors">Dashboard</span>
                                    <span className="text-[11px] font-bold text-white/90 truncate max-w-[80px]">{(user.name || 'User').split(' ')[0]}</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <Button 
                            onClick={() => navigate('/login')}
                            className="bg-white text-black hover:bg-gray-200 border-0 rounded-full px-6 py-2 text-sm font-black flex items-center gap-2 shadow-[0_8px_20px_-8px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-4 top-24 pointer-events-auto md:hidden bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl z-40"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <button
                                    key={link.path}
                                    onClick={() => {
                                        navigate(link.path);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                                        ${isActive(link.path) 
                                            ? 'bg-indigo-600/20 text-white border border-indigo-500/30' 
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-indigo-400' : ''}`} />
                                    <span className="font-bold uppercase tracking-wider text-xs">{link.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
