import { useState, useEffect, useRef } from 'react';
import {motion} from 'framer-motion';
import BackButton from '../components/shared/BackButton';
import VerificationPortal from '../components/verification/VerificationPortal';
import PoweredBy from '../components/shared/PoweredBy';

const VerifyPage = () => {
    // Spotlight Effect State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans flex flex-col relative overflow-hidden">
            <BackButton />

            {/* Background Effects matching scanner aesthetic */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>

                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100"></div>
                
                {/* Horizontal Laser Sweep Animation */}
                <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent z-10"
                />

                {/* Spotlight Layer */}
                 <div 
                    className="absolute inset-0 opacity-40 transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.05), transparent 80%)`
                    }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-grow relative z-[1] flex flex-col justify-center min-h-screen">
                <VerificationPortal />
                <PoweredBy className="fixed bottom-4 left-0 right-0 z-10" />
            </main>
        </div>
    );
};

export default VerifyPage;
