import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import Background from '../components/shared/Background';
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

    const path = location.pathname;

    const getContext = () => {
        if (path.includes('/student')) {
            return {
                label: "Resource missing",
                title: "Student profile not found",
                message: "The requested student profile could not be located on-chain. Verify the URL or identifier.",
                icon: ShieldAlert,
                color: "indigo",
                action: { label: "Verify credential", path: "/verify", icon: Search }
            };
        }
        if (path.includes('/issuer')) {
            return {
                label: "Resource missing",
                title: "Institution not found",
                message: "This institution could not be verified or is not yet registered on the Attestify protocol.",
                icon: Cpu,
                color: "purple",
                action: { label: "Verify credential", path: "/verify", icon: Search }
            };
        }
        if (path.includes('/docs')) {
            return {
                label: "Resource missing",
                title: "Documentation page missing",
                message: "The documentation page you requested does not exist or has been relocated.",
                icon: FileText,
                color: "blue",
                action: { label: "Documentation", path: "/docs", icon: FileText }
            };
        }
        return {
            label: "404 Error",
            title: "Page not found",
            message: "The page you are looking for does not exist, has been moved, or is temporarily unavailable.",
            icon: AlertTriangle,
            color: "red",
            action: { label: "Back to home", path: "/", icon: Home }
        };
    };

    const ctx = getContext();

    return (
        <div className="min-h-dvh bg-[#08090d] text-white selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-hidden">
            <Background />

            <main className="flex-grow relative z-10 flex flex-col items-center justify-center text-center px-4 py-16">
                <div className="max-w-3xl w-full relative">

                    <div className="relative mb-6 select-none pointer-events-none">
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 0.12, y: 0 }}
                            className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-white tabular-nums select-none"
                        >
                            404
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#0e1017]/90 border border-white/10 rounded-2xl md:rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-xl -mt-20 md:-mt-28"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{ctx.label}</span>
                        </div>

                        <div className="relative mb-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                                <ctx.icon className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                            {ctx.title}
                        </h2>

                        <p className="text-zinc-400 mb-8 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                            {ctx.message}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                            <Button
                                onClick={() => navigate(ctx.action.path)}
                                icon={ctx.action.icon}
                                variant="white"
                                className="w-full sm:w-auto text-xs font-semibold tracking-wide"
                            >
                                {ctx.action.label}
                            </Button>

                            <Button
                                onClick={() => navigate(-1)}
                                icon={ArrowLeft}
                                variant="secondary"
                                className="w-full sm:w-auto text-xs font-semibold tracking-wide"
                            >
                                Go back
                            </Button>
                        </div>

                        {user && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    variant="ghost"
                                    icon={LayoutDashboard}
                                    className="text-zinc-400 hover:text-white text-xs font-medium"
                                >
                                    Go to dashboard <Compass className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default NotFound;
