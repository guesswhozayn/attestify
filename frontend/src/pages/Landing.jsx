import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Users, CheckCircle, Upload, Search, X, Briefcase, Globe, Zap, Building, ArrowRight } from 'lucide-react';
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
               Find Student
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 cursor-default hover:bg-indigo-500/20 transition-colors">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Live on Sepolia Testnet</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Trust is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Programmable.
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Issue tamper-proof academic credentials on Ethereum. <br className="hidden md:block" />
            Verifiable instantly, owned forever, and mathematically secure.
          </p>
          
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
          <div className="mt-24 relative mx-auto max-w-6xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
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
          </div>
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

      {/* Features Grid */}
      <div className="py-32 bg-black relative">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Why Attestify?</h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-xl leading-relaxed">
                  Traditional verification is broken. We rebuilt the trust layer of the internet using cryptographic proofs.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <FeatureCard
                  icon={Lock}
                  title="Immutable Security"
                  description="Credentials are hashed and stored on Ethereum. Mathematically impossible to forge, delete, or alter once issued."
                  gradient="from-indigo-500/20 to-indigo-600/5"
                  iconColor="text-indigo-400"
               />
               <FeatureCard
                  icon={FileCheck}
                  title="Instant Verification"
                  description="Cryptographic signatures allow verification in milliseconds. No phone calls, no background checks, just cryptographic truth."
                  gradient="from-purple-500/20 to-purple-600/5"
                  iconColor="text-purple-400"
               />
               <FeatureCard
                  icon={Users}
                  title="Soulbound Identity"
                  description="Credentials are minted as Soulbound Tokens (SBTs). Non-transferable, permanently attached to the student's identity, and fully owned by them."
                  gradient="from-emerald-500/20 to-emerald-600/5"
                  iconColor="text-emerald-400"
               />
            </div>
         </div>
      </div>

      {/* Use Cases - Side by Side with Mock UI */}
      <div className="py-32 bg-black relative overflow-hidden">
          {/* Dynamic Background Elements (Matching Hero) */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              {/* Main Gradient Orbs */}
              <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
              <div className="absolute bottom-[20%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
              <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
              
              {/* Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          </div>
          
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-32">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
                      Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future of Education</span>
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-xl">
                      The Attestify protocol serves the entire ecosystem with immutable trust.
                  </p>
              </div>

              <div className="space-y-32">
                  {/* Institutions Row */}
                  <div className="flex flex-col md:flex-row items-center gap-16">
                      <div className="flex-1 space-y-8">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                              <Building className="w-3 h-3" /> For Institutions
                          </div>
                          <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                              Issue credentials at <br/> <span className="text-indigo-400">hyperspeed.</span>
                          </h3>
                          <p className="text-gray-400 text-lg leading-relaxed">
                              Forget paper and slow databases. Upload thousands of graduates via CSV or API, and mint tamper-proof credentials directly to the blockchain in seconds. 
                          </p>
                          <ul className="space-y-3 text-gray-300">
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500" /> Batch issuance via CSV</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500" /> Automated email delivery</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500" /> Revocation management</li>
                          </ul>
                          <button onClick={() => navigate('/register')} className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-indigo-50 transition-colors">
                              Start Issuing Now <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                      </div>
                      
                      {/* Interactive Mock UI: Dashboard */}
                      <div className="flex-1 relative group">
                          <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          <div className="relative bg-[#0B0F19] rounded-2xl border border-white/10 p-6 shadow-2xl">
                               {/* Mock Header */}
                               <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">A</div>
                                       <div className="text-sm font-medium text-white">Attestify Console</div>
                                   </div>
                                   <div className="text-xs text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> Livenet</div>
                               </div>
                               {/* Mock Stats */}
                               <div className="grid grid-cols-2 gap-4 mb-8">
                                   <div className="bg-white/5 rounded-xl p-4">
                                       <div className="text-gray-400 text-xs mb-1">Total Issued</div>
                                       <div className="text-2xl font-mono text-white">12,450</div>
                                   </div>
                                    <div className="bg-white/5 rounded-xl p-4">
                                       <div className="text-gray-400 text-xs mb-1">Success Rate</div>
                                       <div className="text-2xl font-mono text-emerald-400">100%</div>
                                   </div>
                               </div>
                               {/* Mock List */}
                               <div className="space-y-3">
                                   <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-l-2 border-indigo-500">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">CS</div>
                                           <div>
                                               <div className="text-sm text-white">Computer Science Batch</div>
                                               <div className="text-xs text-gray-500">2 mins ago</div>
                                           </div>
                                       </div>
                                       <div className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Minting...</div>
                                   </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-l-2 border-emerald-500 opacity-60">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">MB</div>
                                           <div>
                                               <div className="text-sm text-white">MBA Class of 2025</div>
                                               <div className="text-xs text-gray-500">1 hour ago</div>
                                           </div>
                                       </div>
                                       <div className="text-xs text-emerald-400">Completed</div>
                                   </div>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Students Row */}
                  <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                      <div className="flex-1 space-y-8">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                              <Users className="w-3 h-3" /> For Students
                          </div>
                          <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                              Your achievements, <br/> <span className="text-emerald-400">owned forever.</span>
                          </h3>
                          <p className="text-gray-400 text-lg leading-relaxed">
                              No more lost certificates or expensive transcript requests. Your credentials are stored as Soulbound Tokens (SBTs) in your own digital wallet.
                          </p>
                          <ul className="space-y-3 text-gray-300">
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> Non-transferable identity</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> Shareable verification links</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-500" /> Permanent blockchain record</li>
                          </ul>
                           <button onClick={() => navigate('/register')} className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-emerald-50 transition-colors">
                              Claim Your Profile <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                      </div>

                      {/* Interactive Mock UI: Wallet Card */}
                      <div className="flex-1 relative group">
                          <div className="absolute -inset-4 bg-emerald-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                           <div className="relative w-full max-w-sm mx-auto perspective-1000">
                               <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-6 shadow-2xl transform transition-transform duration-500 group-hover:rotate-x-2 group-hover:rotate-y-2">
                                   {/* Glow */}
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                                   
                                   <div className="relative z-10 flex flex-col h-[300px] justify-between">
                                       <div>
                                           <div className="flex items-center justify-between mb-6">
                                               <Shield className="w-8 h-8 text-emerald-400" />
                                               <div className="text-xs font-mono text-gray-500">ERC-721 Token</div>
                                           </div>
                                           <div className="text-2xl font-bold text-white mb-1">Master of Computer Science</div>
                                           <div className="text-sm text-gray-400">Stanford University</div>
                                       </div>
                                       
                                       <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">Verified</div>
                                                <div className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-[10px] font-bold uppercase">Soulbound</div>
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-600 break-all">
                                                0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* Employers Row */}
                  <div className="flex flex-col md:flex-row items-center gap-16">
                      <div className="flex-1 space-y-8">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                              <Briefcase className="w-3 h-3" /> For Employers
                          </div>
                          <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                              Verify talent with <br/> <span className="text-purple-400">absolute certainty.</span>
                          </h3>
                          <p className="text-gray-400 text-lg leading-relaxed">
                              Background checks are slow and expensive. Attestify enables instant, cryptographic verification of any candidate's claims.
                          </p>
                          <ul className="space-y-3 text-gray-300">
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-purple-500" /> Instant verification via QR code</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-purple-500" /> 100% fraud-proof</li>
                              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-purple-500" /> No middleman fees</li>
                          </ul>
                           <button onClick={() => navigate('/verify')} className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-purple-50 transition-colors">
                              Try Verification <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                      </div>

                      {/* Interactive Mock UI: Verification Scanner */}
                      <div className="flex-1 relative group">
                          <div className="absolute -inset-4 bg-purple-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          <div className="relative bg-[#0B0F19] rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col items-center justify-center h-[320px]">
                              
                              <div className="relative w-48 h-48 mb-6">
                                  {/* Scanner Animation */}
                                  <div className="absolute inset-0 border-2 border-purple-500/30 rounded-lg"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-32 h-32 bg-white p-2 rounded-lg">
                                          <div className="w-full h-full bg-black flex items-center justify-center">
                                               <div className="text-white text-[10px] font-mono text-center">QR CODE<br/>DATA</div>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-purple-400 font-bold">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Verification Successful</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
      </div>

      {/* How It Works - Cyberpunk Process */}
      <div className="py-32 relative bg-black overflow-hidden">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Trust Protocol <span className="text-indigo-500">Architecture</span>
             </h2>
             <p className="text-gray-400">Three fundamental steps to permanent, decentralized verification.</p>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-12">
             {/* Connecting Beam */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gray-800 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2 animate-[shimmer_3s_infinite_linear]"></div>
             </div>

             {/* Step 1 */}
            <div className="relative z-10 group">
                <div className="w-24 h-24 mx-auto bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Upload className="w-10 h-10 text-indigo-400" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 border-4 border-black flex items-center justify-center text-white font-bold text-sm">1</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center">Cryptographic Issuance</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                    Institution signs a data payload with their private key. A unique hash is generated, ensuring the data cannot be tampered with.
                </p>
            </div>

             {/* Step 2 */}
            <div className="relative z-10 group">
                <div className="w-24 h-24 mx-auto bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/10 group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Lock className="w-10 h-10 text-purple-400" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-purple-600 border-4 border-black flex items-center justify-center text-white font-bold text-sm">2</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center">Blockchain Anchoring</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                    The hash is anchored to the Ethereum blockchain. The metadata is stored on IPFS, creating a permanent, decentralized record.
                </p>
            </div>

             {/* Step 3 */}
            <div className="relative z-10 group">
                <div className="w-24 h-24 mx-auto bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10 group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 border-4 border-black flex items-center justify-center text-white font-bold text-sm">3</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center">Universal Verification</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                    Employers or apps verify the credential instantly by querying the smart contract. Zero reliance on the original issuer.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
          </div>
      </div>

      {/* Final CTA */}
      <div className="py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
               <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">Ready to secure the future?</h2>
               <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join the decentralized standard today. Issue, manage, and verify credentials with the power of Ethereum.</p>
               <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <Button onClick={() => navigate('/register')} className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:-translate-y-1">
                  Get Started Now
                </Button>
                <Button onClick={() => window.open('mailto:sales@attestify.io')} variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all hover:-translate-y-1">
                  Contact Sales
                </Button>
               </div>
           </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-2 mb-6">
                   <Shield className="w-6 h-6 text-indigo-500" />
                   <span className="text-xl font-bold text-white tracking-tight">Attestify</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                   Building the trust layer for the internet. Empowering students and institutions with blockchain-verified credentials.
                </p>
             </div>
             
             <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Platform</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                   <li><button onClick={() => navigate('/login')} className="hover:text-indigo-400 transition-colors">Dashboard</button></li>
                   <li><button onClick={() => navigate('/verify')} className="hover:text-indigo-400 transition-colors">Verification</button></li>
                   <li><button onClick={() => navigate('/docs')} className="hover:text-indigo-400 transition-colors">Documentation</button></li>
                </ul>
             </div>

             <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                   <li><span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
                   <li><span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
                </ul>
             </div>

              <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide text-sm uppercase">Connect</h4>
                <div className="flex space-x-4">
                   {/* Social placeholders */}
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-indigo-500 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-center group">
                      <div className="w-4 h-4 bg-gray-400 group-hover:bg-white rounded-sm"></div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-indigo-500 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-center group">
                      <div className="w-4 h-4 bg-gray-400 group-hover:bg-white rounded-sm"></div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-indigo-500 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-center group">
                      <div className="w-4 h-4 bg-gray-400 group-hover:bg-white rounded-sm"></div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
             <p>&copy; 2026 Attestify. All rights reserved.</p>
             <p className="mt-4 md:mt-0 flex items-center gap-2">
                Made with <span className="text-red-500 animate-pulse">♥</span> for Web3
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient, iconColor }) => {
  return (
    <div className={`group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative z-10">
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 bg-white/5 ${iconColor} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
           <Icon className="w-7 h-7" />
         </div>
         <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors tracking-tight">{title}</h3>
         <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{description}</p>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, description, icon: Icon, delay }) => (
  <div 
    className="relative z-10 bg-gray-950/50 border border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-colors duration-500 backdrop-blur-sm group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
       <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
       <Icon className="w-8 h-8 text-gray-400 group-hover:text-indigo-400 transition-colors relative z-10" />
    </div>
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold shadow-xl">
       Step {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
