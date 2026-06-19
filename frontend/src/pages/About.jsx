import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Globe, Target, Rocket, Github, Mail } from 'lucide-react';
import BackButton from '../components/shared/BackButton';
import Footer from '../components/shared/Footer';
import Button from '../components/shared/Button';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '../components/shared/GradientBackground';
import StatusBadge from '../components/shared/StatusBadge';

const About = () => {
  const navigate = useNavigate();
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
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">

      <GradientBackground fixed />

      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.1), transparent 80%)`
        }}
      />

      <BackButton />

      <main className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
        >
            <div className="mb-8">
              <StatusBadge label="Our Mission" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-tight">
                Restoring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400 bg-[length:200%_auto] animate-shimmer">Trust</span> in <br />
                Digital Credentials.
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                We are building the decentralized standard for academic and professional verification.
                Owned by users, secured by Ethereum, and verifiable by anyone.
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
                {
                    title: "Decentralization",
                    desc: "Eliminating single points of failure. No central authority controls your achievements.",
                    icon: Globe,
                    color: "text-indigo-400",
                    bg: "bg-indigo-500/10",
                    border: "border-indigo-500/20"
                },
                {
                    title: "Sovereignty",
                    desc: "You own your data. Your wallet is your identity. Potable, permanent, and private.",
                    icon: Shield,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20"
                },
                {
                    title: "Transparency",
                    desc: "Open source protocol. Verifiable on-chain logic. Truth through mathematics, not bureaucracy.",
                    icon: Target,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20"
                }
            ].map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group"
                >
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                        {item.desc}
                    </p>
                </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The Origin Story</h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                    <p>
                        In a world of rampant credential fraud and diploma mills, the value of genuine academic achievement is being diluted. Traditional verification methods are slow, expensive, and manual.
                    </p>
                    <p>
                        We asked a simple question: <span className="text-white font-medium">What if a degree was as immutable as a Bitcoin transaction?</span>
                    </p>
                    <p>
                        Attestify was born from this question. By leveraging Soulbound Tokens (SBTs) on Ethereum, we created a system where credentials are permanently bound to the recipient&apos;s identity, mathematically impossible to forge, and instantly verifiable by anyone in the world for free.
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl overflow-hidden">

                     <div className="absolute top-0 right-0 p-12 opacity-10">
                         <Rocket className="w-64 h-64 text-white" />
                     </div>

                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold text-white">2026</div>
                            <div className="h-px flex-1 bg-white/20"></div>
                            <div className="text-gray-400 uppercase tracking-widest text-sm font-bold">Founded</div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold text-white">Eth</div>
                            <div className="h-px flex-1 bg-white/20"></div>
                            <div className="text-gray-400 uppercase tracking-widest text-sm font-bold">Native</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-bold text-white">100%</div>
                            <div className="h-px flex-1 bg-white/20"></div>
                            <div className="text-gray-400 uppercase tracking-widest text-sm font-bold">Open Source</div>
                        </div>
                     </div>
                </div>
            </motion.div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden"
        >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

             <div className="relative z-10">
                 <Users className="w-16 h-16 text-indigo-400 mx-auto mb-8" />
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Join the Movement</h2>
                 <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                     We are open source and community driven. Help us build the future of digital trust.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <Button onClick={() => window.open('https://github.com', '_blank')} variant="white" className="px-8 py-4">
                        <Github className="w-5 h-5" />
                        <span>View Source</span>
                    </Button>
                    <Button onClick={() => navigate('/contact')} variant="outline" className="px-8 py-4 border-white/10 hover:bg-white/5">
                        <Mail className="w-5 h-5" />
                        <span>Contact Team</span>
                    </Button>
                </div>
             </div>
        </motion.div>

      </main>
    </div>
  );
};

export default About;
