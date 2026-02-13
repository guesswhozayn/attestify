import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Wallet, Users, CheckCircle, Search, Globe, Zap, Building, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Navbar - Cyberpunk Floating Island */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4">
        <div className="w-full max-w-5xl bg-[#030014]/60 backdrop-blur-2xl border border-white/10 rounded-full pl-6 pr-2 py-2 flex items-center justify-between shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] animate-in slide-in-from-top-4 duration-700 hover:border-indigo-500/30 transition-colors">
          
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
            <button onClick={() => navigate('/docs')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full relative group">
               Documentation
            </button>
            <button onClick={() => navigate('/search')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full flex items-center gap-2 group">
               <Search className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
               Public Explorer
            </button>
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
                className="bg-white text-black hover:bg-indigo-50 hover:text-indigo-950 border-0 rounded-full px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] transition-all group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <span className="relative z-10">Get Started</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            {/* Main Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
            <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Status Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 cursor-default hover:bg-indigo-500/20 transition-colors"
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Live on Sepolia Testnet</span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-bold text-white mb-8 tracking-tighter leading-[1.1]"
          >
            Trust is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-[length:200%_auto] animate-shimmer drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Programmable.
            </span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Issue tamper-proof academic credentials on Ethereum. <br className="hidden md:block" />
            Verifiable instantly, owned forever, and mathematically secure.
          </motion.p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button onClick={() => navigate('/register')} className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:-translate-y-1">
              Start Issuing
            </Button>
            <Button onClick={() => navigate('/verify')} variant="outline" className="h-14 px-8 text-lg border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all hover:-translate-y-1 font-medium">
              Verify Credential
            </Button>
          </div>

          {/* Abstract Dashboard Visualization */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="mt-24 relative mx-auto max-w-6xl"
          >
             {/* Glow behind dashboard */}
             <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full"></div>
             
             <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Mock Browser Header */}
                <div className="h-10 border-b border-white/5 bg-black/40 flex items-center px-4 space-x-2">
                   <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                   <div className="mx-auto w-1/3 h-5 bg-white/5 rounded-md text-[10px] flex items-center justify-center text-gray-500 font-mono">attestify.io/dashboard</div>
                </div>
                
                {/* Mock Dashboard Content */}
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Card 1 */}
                   <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="h-2 w-24 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-white/10 rounded"></div>
                   </div>
                   {/* Card 2 */}
                   <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                        <FileCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="h-2 w-24 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-white/10 rounded"></div>
                   </div>
                   {/* Card 3 */}
                   <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                        <Shield className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="h-2 w-24 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-white/10 rounded"></div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Logos / Trusted By */}
      <div className="py-10 bg-black border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Trusted by innovative institutions</p>
          </div>
          <div className="flex animate-scroll whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex space-x-12 mx-6">
                      {['MIT', 'Stanford', 'Berkeley', 'Harvard', 'Oxford', 'Cambridge', 'ETH Zurich', 'NUS'].map((name) => (
                          <div key={name} className="flex items-center space-x-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                              <Building className="w-6 h-6 text-gray-400" />
                              <span className="text-xl font-bold text-gray-400">{name}</span>
                          </div>
                      ))}
                  </div>
              ))}
          </div>
      </div>



      {/* Universal Standard - Bento Grid */}
      <div className="py-32 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-20">
                  <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
                      The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400 bg-[length:200%_auto] animate-shimmer">Universal Standard</span>
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-xl">
                      Attestify isn't just a platform. It's a new primitive for digital trust.
                  </p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-6"
              >
                  
                  {/* Card 1: Soulbound Identity (Span 2 cols, Span 2 rows) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl p-8 flex flex-col justify-between"
                  >
                      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-10 pointer-events-none">
                          <Shield className="w-64 h-64 text-indigo-500" />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                              <Users className="w-6 h-6 text-indigo-400" />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-4">Soulbound Identity</h3>
                          <p className="text-gray-400 text-lg max-w-md">
                              Credentials are minted as Soulbound Tokens (SBTs). They are non-transferable, effectively acting as a permanent, on-chain CV that you truly own.
                          </p>
                      </div>
                      
                      {/* Visual: Abstract Identity */}
                      <div className="mt-8 relative h-64 w-full rounded-xl border border-white/10 bg-black/50 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
                          {/* Holographic Card Effect */}
                          <div className="relative w-[320px] h-[200px] rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl group/card">
                              
                              {/* Background Gradient Mesh */}
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-black"></div>
                              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] rotate-45 animate-[shimmer_3s_infinite]"></div>

                              {/* Card Content */}
                              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                  <div className="flex justify-between items-start">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 p-[1px]">
                                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                              <Users className="w-6 h-6 text-white" />
                                          </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                          <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                              Verified SBT
                                          </div>
                                          <div className="w-24 h-2 bg-white/10 rounded-full animate-pulse"></div>
                                      </div>
                                  </div>

                                  <div className="space-y-3">
                                      <div className="font-mono text-[10px] text-indigo-300 opacity-70">
                                          0x71C...8976F
                                      </div>
                                      <div className="flex gap-2">
                                          <div className="h-1.5 w-8 bg-indigo-500 rounded-full"></div>
                                          <div className="h-1.5 w-16 bg-purple-500 rounded-full"></div>
                                          <div className="h-1.5 w-4 bg-emerald-500 rounded-full"></div>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Scanline Effect */}
                              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
                          </div>
                      </div>
                  </motion.div>

                  {/* Card 2: Global Network (Span 1 col, Span 2 rows) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl p-8 flex flex-col"
                  >
                      <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      <div className="relative z-10 mb-auto">
                          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                              <Globe className="w-6 h-6 text-purple-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">Global Reach</h3>
                          <p className="text-gray-400 text-sm">
                              Verifiable anywhere, anytime. No borders, no downtime.
                          </p>
                      </div>

                      {/* Visual: Globe/Network */}
                      <div className="mt-8 relative flex-1 min-h-[200px] flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
                          {/* Animated nodes */}
                          <div className="w-4 h-4 rounded-full bg-purple-500 absolute top-1/4 left-1/4 animate-ping"></div>
                          <div className="w-3 h-3 rounded-full bg-indigo-500 absolute bottom-1/3 right-1/4 animate-ping delay-100"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1/2 right-1/3 animate-ping delay-200"></div>
                          <Globe className="w-48 h-48 text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                  </motion.div>

                  {/* Card 3: Instant Issuance (Span 1 col, Span 1 row) */}
                   <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl p-8"
                   >
                       <div className="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                       <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                          <Zap className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Hyperspeed</h3>
                      <p className="text-gray-400 text-sm">
                          Issue thousands of credentials per second via batch processing.
                      </p>
                   </motion.div>

                  {/* Card 4: Cryptographic Truth (Span 2 cols, Span 1 row) */}
                   <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl p-8 flex items-center justify-between"
                   >
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                       <div className="relative z-10 max-w-lg">
                           <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                              <Lock className="w-6 h-6 text-blue-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Cryptographic Truth</h3>
                          <p className="text-gray-400">
                              Mathematical certainty replaced manual verification. Data is hashed, anchored, and immutable.
                          </p>
                       </div>
                       <div className="hidden md:block text-9xl font-mono text-white/5 font-bold absolute right-4 bottom-[-20px]">
                           0x
                       </div>
                   </motion.div>
              </motion.div>
          </div>
      </div>

      {/* How It Works - Cyberpunk Process */}
      <div className="py-32 relative bg-black overflow-hidden">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white bg-[length:200%_auto] animate-shimmer">Attestify?</span>
             </h2>
             <p className="text-gray-400">The three pillars of the new standard.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid md:grid-cols-3 gap-8"
          >
             {/* Card 1: Immutable Trust */}
             <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="group relative h-[400px] rounded-3xl border border-white/10 bg-gray-900/40 overflow-hidden hover:border-indigo-500/50 transition-all duration-500"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                   <Lock className="w-32 h-32 text-indigo-500 rotate-12" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6 text-indigo-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Immutable Trust</h3>
                   <p className="text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Once issued, a credential cannot be altered, faked, or deleted. It is cryptographically anchored to the blockchain forever.
                   </p>
                </div>
             </motion.div>

             {/* Card 2: Sovereign Ownership */}
             <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative h-[400px] rounded-3xl border border-white/10 bg-gray-900/40 overflow-hidden hover:border-purple-500/50 transition-all duration-500"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                   <Users className="w-32 h-32 text-purple-500 -rotate-12" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                      <Wallet className="w-6 h-6 text-purple-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Sovereign Control</h3>
                   <p className="text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Students own their data. No more begging universities for transcripts. Your wallet, your credentials, your future.
                   </p>
                </div>
             </motion.div>

             {/* Card 3: Instant Verification */}
             <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="group relative h-[400px] rounded-3xl border border-white/10 bg-gray-900/40 overflow-hidden hover:border-emerald-500/50 transition-all duration-500"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                   <Zap className="w-32 h-32 text-emerald-500 rotate-6" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Instant Verification</h3>
                   <p className="text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Employers can verify credentials in milliseconds with 100% mathematical certainty. Zero cost, zero friction.
                   </p>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                  <div className="p-4">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">100k+</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Credentials Issued</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">50+</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Partner Institutions</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">0s</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Verification Time</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">$0</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Cost to Verify</div>
                  </div>
              </div>
          </motion.div>
      </div>

      {/* Final CTA */}
      <div className="py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-4 text-center relative z-10"
           >
               <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-300 to-white bg-[length:200%_auto] animate-shimmer">Ready to secure the future?</h2>
               <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join the decentralized standard today. Issue, manage, and verify credentials with the power of Ethereum.</p>
               <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <Button onClick={() => navigate('/register')} className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:-translate-y-1">
                  Get Started Now
                </Button>
                <Button onClick={() => window.open('mailto:sales@attestify.io')} variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all hover:-translate-y-1">
                  Contact Sales
                </Button>
               </div>
           </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/10">
        
        {/* Footer Background Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
             
             {/* Brand & Newsletter - Spans 5 columns */}
             <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Shield className="w-5 h-5 text-indigo-400" />
                   </div>
                   <span className="text-2xl font-bold text-white tracking-tight">Attestify</span>
                </div>
                <p className="text-gray-400 text-base leading-relaxed max-w-md">
                   Building the trust layer for the internet. Empowering students and institutions with blockchain-verified credentials that are owned forever.
                </p>
                
                {/* Newsletter */}
                <div className="pt-4">
                   <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Stay Updated</h4>
                   <div className="flex gap-2 max-w-md">
                      <div className="relative flex-1">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                         />
                      </div>
                      <button className="px-5 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">
                         Subscribe
                      </button>
                   </div>
                </div>
             </div>
             
             {/* Links - Spans 7 columns */}
             <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2 lg:pt-0">
                <div>
                   <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Platform</h4>
                   <ul className="space-y-4 text-sm font-medium text-gray-500">
                      <li><button onClick={() => navigate('/login')} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span> Dashboard</button></li>
                      <li><button onClick={() => navigate('/verify')} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span> Verification</button></li>
                      <li><button onClick={() => navigate('/docs')} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span> Documentation</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span> API Status</button></li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Company</h4>
                   <ul className="space-y-4 text-sm font-medium text-gray-500">
                      <li><button className="hover:text-indigo-400 transition-colors">About Us</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Careers</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Blog</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Contact</button></li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Legal</h4>
                   <ul className="space-y-4 text-sm font-medium text-gray-500">
                      <li><button className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Cookie Policy</button></li>
                      <li><button className="hover:text-indigo-400 transition-colors">Security</button></li>
                   </ul>
                </div>
             </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-sm text-gray-500 font-medium">
                &copy; 2026 Attestify Inc. All rights reserved.
             </div>
             
             <div className="flex items-center gap-6">
                <a href="#" className="text-gray-500 hover:text-white transition-colors transform hover:scale-110 duration-300">
                   <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#1DA1F2] transition-colors transform hover:scale-110 duration-300">
                   <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#0077b5] transition-colors transform hover:scale-110 duration-300">
                   <Linkedin className="w-5 h-5" />
                </a>
             </div>
             
             <div className="text-sm text-gray-600 flex items-center gap-2">
                Made with <span className="text-red-500 animate-pulse">♥</span> for Web3
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};



export default Landing;
