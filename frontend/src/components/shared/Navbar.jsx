import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BookOpen, CheckCircle, AlignRight, X, ArrowLeft, LogIn, Rocket } from 'lucide-react';
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
        { name: 'Docs', path: '/docs', icon: BookOpen },
        { name: 'Partners', path: '/partnership-guide', icon: Rocket },
        { name: 'Verify', path: '/verify', icon: CheckCircle },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-6 pointer-events-none">
            <div className={`
                w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-in-out
                ${isScrolled
                    ? 'bg-black/90 backdrop-blur-lg border-white/10 rounded-2xl px-6 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]'
                    : 'bg-[#030014]/60 backdrop-blur-lg border-white/5 rounded-full px-6 py-2 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]'
                }
                border flex items-center justify-between group/nav hover:border-white/20 transition-all duration-500
            `}>

                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center gap-3 cursor-pointer group/logo"
                        onClick={() => navigate('/')}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover/logo:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-gray-900 to-black p-px border border-white/10 group-hover/logo:scale-110 transition-transform duration-300">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-indigo-400 group-hover/logo:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                        <span className="font-sans text-xl font-black tracking-[-0.05em] lowercase text-white group-hover/logo:text-indigo-200 transition-colors">
                            attestify<span className="text-indigo-500">.</span>
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            variant={isActive(link.path) ? 'secondary' : 'ghost'}
                            rounded="full"
                            size="sm"
                            className={`px-5 py-2 border-transparent ${isActive(link.path) ? 'border-white/10 shadow-inner' : ''}`}
                        >
                            <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-indigo-400' : 'text-gray-500'}`} />
                            <span className={`text-[11px] font-bold ${isActive(link.path) ? 'text-white' : 'text-gray-300'}`}>{link.name}</span>
                            {isActive(link.path) && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {showBackSearch && (
                        <Button
                            onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/')}
                            variant="secondary"
                            size="sm"
                            rounded="full"
                            className="hidden sm:flex text-white"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            Return
                        </Button>
                    )}

                    <div className="h-6 w-px bg-white/5 mx-2 hidden sm:block"></div>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="secondary"
                                rounded="full"
                                size="sm"
                                className="p-1.5! sm:pl-1.5! sm:pr-5! sm:py-1.5! transition-all duration-300 group/dash"
                            >
                                <Avatar
                                    src={user.avatar}
                                    initials={user.name}
                                    size="sm"
                                    className="border-0 shadow-none scale-100 group-hover/dash:scale-110 transition-transform"
                                />
                                <div className="hidden sm:flex flex-col items-start pr-1 gap-0.5">
                                    <span className="text-[10px] font-bold text-white/40 group-hover/dash:text-indigo-400 transition-colors leading-none">Dashboard</span>
                                    <span className="text-[10px] font-medium text-white/90 truncate max-w-[100px]">{(user.name || 'User').split(' ')[0]}</span>
                                </div>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => navigate('/login')}
                            variant="white"
                            className="hover:scale-105 active:scale-95 transition-all p-2! md:px-6! md:py-2.5! rounded-full md:rounded-2xl bg-transparent! md:bg-white! text-white! md:text-black!"
                            noWrapper
                        >
                            <span className="relative z-10 flex flex-row items-center justify-center">
                                <LogIn className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                                <span className="hidden md:inline font-medium text-sm">Sign In</span>
                            </span>
                        </Button>
                    )}

                    {showSidebarToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            rounded="full"
                            onClick={onToggleSidebar}
                            className="md:hidden px-2! py-2!"
                        >
                            <AlignRight className="w-6 h-6" />
                        </Button>
                    )}

                    {!showSidebarToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            rounded="full"
                            className="md:hidden px-2! py-2!"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <AlignRight className="w-6 h-6" />}
                        </Button>
                    )}
                </div>
            </div>

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
                                <Button
                                    key={link.path}
                                    onClick={() => {
                                        navigate(link.path);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    variant={isActive(link.path) ? 'primary' : 'ghost'}
                                    className="w-full justify-start px-4 py-3"
                                >
                                    <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-indigo-400' : ''}`} />
                                    <span>{link.name}</span>
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default React.memo(Navbar);
