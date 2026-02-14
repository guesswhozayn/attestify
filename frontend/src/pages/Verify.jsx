import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import VerificationPortal from '../components/verification/VerificationPortal';

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
            {/* Background Effects matching Landing.jsx */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 {/* Main Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
                <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
                
                 {/* Grid Pattern with dynamic mask */}
                <div 
                    className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                    style={{
                        maskImage: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`
                    }}
                ></div>

                {/* Spotlight Layer */}
                 <div 
                    className="absolute inset-0 opacity-40 transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`
                    }}
                />
            </div>

            <Navbar />

            {/* Main Content */}
            <main className="flex-grow relative z-[1] flex flex-col justify-center min-h-screen pt-24">
                <VerificationPortal />
            </main>
        </div>
    );
};

export default VerifyPage;
