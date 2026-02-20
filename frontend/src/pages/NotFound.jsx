import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import { 
    Home, 
    Search, 
    AlertTriangle, 
    ArrowLeft, 
    LayoutDashboard, 
    FileText, 
    ShieldAlert,
    Cpu,
    Compass
} from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isStudent = user?.role === 'STUDENT';
    const path = location.pathname;

    // Determine Contextual Content based on Path
    const getContext = () => {
        if (path.includes('/student')) {
            return {
                label: "STUDENT_REGISTRY_ERROR",
                title: "Identity Not Resolved",
                message: "The requested student profile could not be localized on the identity sub-chain. Verify the wallet address.",
                icon: ShieldAlert,
                color: "indigo",
                action: { label: "Search Registry", path: "/search", icon: Search }
            };
        }
        if (path.includes('/issuer')) {
            return {
                label: "INSTITUTION_REGISTRY_ERROR",
                title: "Entity Missing",
                message: "This institution is not registered or its verification status has been suspended from the global registry.",
                icon: Cpu,
                color: "purple",
                action: { label: "Search Issuers", path: "/search", icon: Search }
            };
        }
        if (path.includes('/docs')) {
            return {
                label: "DOCUMENTATION_ERROR",
                title: "Segment Missing",
                message: "The documentation segment you're requesting is deprecated or has been moved to a different protocol layer.",
                icon: FileText,
                color: "blue",
                action: { label: "Documentation Index", path: "/docs", icon: FileText }
            };
        }
        return {
            label: "PROTOCOL_SEGMENT_FAULT",
            title: "Resource Not Minted",
            message: "This node address does not exist on the current sequence. It may have been burned or never initialized.",
            icon: AlertTriangle,
            color: "red",
            action: { label: "Return Home", path: "/", icon: Home }
        };
    };

    const ctx = getContext();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-hidden">
             {/* Technical Background Overlay */}
             <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Dynamic Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${
                    ctx.color === 'indigo' ? 'bg-indigo-600/10' :
                    ctx.color === 'purple' ? 'bg-purple-600/10' :
                    ctx.color === 'blue' ? 'bg-blue-600/10' : 'bg-red-600/10'
                } rounded-full blur-[180px] opacity-40 animate-pulse`}></div>
                
                {/* Scanner Sweep */}
                <motion.div 
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10"
                />

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
             </div>

             <main className="flex-grow relative z-10 flex flex-col items-center justify-center text-center px-4 pt-10">
                <div className="max-w-4xl w-full relative">
                    {/* Big Decorative 404 with Glitch Effect */}
                    <div className="relative mb-6 select-none">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 0.2, y: 0 }}
                            className="text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-white"
                        >
                            404
                        </motion.h1>
                        
                        {/* Glitch Overlay Text */}
                        <motion.h1 
                            animate={{ 
                                x: [-2, 2, -1, 0],
                                skew: [0, 2, -1, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3 }}
                            className="absolute inset-0 text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-indigo-500/30 translate-x-1 mix-blend-screen"
                        >
                            404
                        </motion.h1>
                    </div>

                    {/* Content Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gray-900/60 backdrop-blur-3xl border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-3xl relative overflow-hidden group"
                    >
                        {/* ID Badge Labels */}
                        <div className="absolute top-8 left-10 flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_red]"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{ctx.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/20 tracking-widest">SEQ_ERR_04</span>
                        </div>

                        {/* Visual Icon */}
                        <div className="relative mb-10 mt-4">
                             <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 group-hover:rotate-6 transition-transform duration-500">
                                <ctx.icon className={`w-12 h-12 ${
                                    ctx.color === 'indigo' ? 'text-indigo-400' :
                                    ctx.color === 'purple' ? 'text-purple-400' :
                                    ctx.color === 'blue' ? 'text-blue-400' : 'text-red-400'
                                }`} />
                             </div>
                             {/* Floating Elements */}
                             <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-4 right-1/2 translate-x-16"
                             >
                                <div className="p-2 bg-black border border-white/10 rounded-xl shadow-2xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                             </motion.div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-none">
                            {ctx.title}
                        </h2>
                        
                        <p className="text-gray-400 mb-12 text-sm md:text-lg leading-relaxed max-w-lg mx-auto font-medium">
                            {ctx.message}
                        </p>

                        {/* Action Suite */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md mx-auto">
                            <Button 
                                onClick={() => navigate(ctx.action.path)}
                                icon={ctx.action.icon}
                                variant="white"
                                className="h-16 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-white/5"
                            >
                                {ctx.action.label}
                            </Button>
                            
                            <Button 
                                onClick={() => navigate(-1)}
                                icon={ArrowLeft}
                                variant="secondary"
                                className="h-16 text-xs font-black uppercase tracking-[0.2em]"
                            >
                                Revert State
                            </Button>
                        </div>

                        {/* Secondary Logged-in Action */}
                        {user && (
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <Button 
                                    onClick={() => navigate(isStudent ? '/student-dashboard' : '/issuer-dashboard')}
                                    variant="ghost"
                                    icon={LayoutDashboard}
                                    className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] group"
                                >
                                    Access Protocol Dashboard <Compass className="w-3 h-3 ml-2 group-hover:rotate-90 transition-transform duration-500" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
                
                {/* Footer Technical Telemetry */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-20 pointer-events-none pb-10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">NODE_INDEX:</span>
                        <span className="text-[10px] font-mono text-white">0x00A404F</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">UPTIME:</span>
                        <span className="text-[10px] font-mono text-white">99.998%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">ENCRYPTION:</span>
                        <span className="text-[10px] font-mono text-white">AES-256-GCM</span>
                    </div>
                </div>
             </main>
        </div>
    );
};

export default NotFound;
