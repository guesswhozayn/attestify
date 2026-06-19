import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Wallet, Users, CheckCircle, Globe, Zap, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import BrandLogo from '../components/shared/BrandLogo';
import BackgroundEffects, { useScrollY } from '../components/shared/BackgroundEffects';
import StatusBadge from '../components/shared/StatusBadge';
import SectionHeader from '../components/shared/SectionHeader';
import PilotIntegrationHub from '../components/landing/PilotIntegrationHub';

const Landing = () => {
  const navigate = useNavigate();

  const scrollY = useScrollY();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative">
      <BackgroundEffects scrollY={scrollY} />

      <Navbar />

      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <StatusBadge label="Live on Sepolia Testnet" className="hover:bg-indigo-500/20 transition-colors cursor-default" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-[1.1]"
          >
            Trust is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Programmable.
            </span>
          </motion.h1>

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

          <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button onClick={() => navigate('/register')} variant="white" className="hover:-translate-y-1 !px-5 !py-2.5 sm:!px-8 sm:!py-3.5 text-xs sm:text-base md:text-lg font-black w-auto">
              Start Issuing Now
            </Button>
            <Button onClick={() => navigate('/verify')} variant="secondary" className="hover:-translate-y-1 !px-5 !py-2.5 sm:!px-8 sm:!py-3.5 text-xs sm:text-base md:text-lg font-black w-auto">
              Verify Credential
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="mt-24 relative mx-auto max-w-6xl"
          >

             <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full"></div>

             <div className="rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur-lg shadow-2xl overflow-hidden">

                <div className="h-10 border-b border-white/5 bg-black/40 flex items-center px-4 space-x-2">
                   <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                   <div className="mx-auto w-1/3 h-5 bg-white/5 rounded-md text-[10px] flex items-center justify-center text-gray-500 font-mono">attestify.co/dashboard</div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">

                   <div className="bg-linear-to-br from-white/5 to-white/2 border border-white/10 p-6 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="h-2 w-24 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-white/10 rounded"></div>
                   </div>

                   <div className="bg-linear-to-br from-white/5 to-white/2 border border-white/10 p-6 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                        <FileCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="h-2 w-24 bg-gray-700/50 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-white/10 rounded"></div>
                   </div>

                   <div className="bg-linear-to-br from-white/5 to-white/2 border border-white/10 p-6 rounded-2xl">
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

      <div className="py-32 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <SectionHeader
                prefix="The"
                highlight="Universal Standard"
                subtitle="Attestify isn't just a platform. It's a new primitive for digital trust."
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto md:auto-rows-[300px] gap-6"
              >

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-lg p-8 flex flex-col justify-between"
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

                      <div className="mt-8 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">

                          <div className="relative w-[320px] h-[200px] rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl group/card">

                              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-black"></div>

                              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                  <div className="flex justify-between items-start">
                                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-600 p-[1px]">
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

                              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
                          </div>
                      </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-lg p-8 flex flex-col"
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

                      <div className="mt-8 relative flex-1 min-h-[200px] flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>

                          <div className="absolute top-1/4 left-1/4">
                              <span className="relative flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
                              </span>
                          </div>

                          <div className="absolute bottom-1/3 right-1/4">
                              <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                              </span>
                          </div>

                          <div className="absolute top-1/2 right-1/3">
                              <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                          </div>
                          <Globe className="w-48 h-48 text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                  </motion.div>

                   <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-lg p-8"
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

                   <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-lg p-8 flex items-center justify-between"
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

      <div className="py-32 relative bg-black overflow-hidden">

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            subtitle="The three pillars of the new standard."
            mb="mb-24"
          >
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight flex items-center justify-center gap-2 flex-wrap">
              Why <BrandLogo textSize="text-5xl sm:text-6xl md:text-8xl" />
            </h2>
          </SectionHeader>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid md:grid-cols-3 gap-8"
          >

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

                 <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6 text-indigo-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Immutable Trust</h3>
                   <p className="text-gray-400 leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Once issued, a credential cannot be altered, faked, or deleted. It is cryptographically anchored to the blockchain forever.
                   </p>
                 </div>
             </motion.div>

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

                 <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                      <Wallet className="w-6 h-6 text-purple-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Sovereign Control</h3>
                   <p className="text-gray-400 leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Students own their data. No more begging universities for transcripts. Your wallet, your credentials, your future.
                   </p>
                 </div>
             </motion.div>

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

                 <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Instant Verification</h3>
                   <p className="text-gray-400 leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Employers can verify credentials in milliseconds with 100% mathematical certainty. Zero cost, zero friction.
                   </p>
                 </div>
             </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          >
              <div className="grid grid-cols-2 md:grid-cols-4 text-center">
                  <div className="p-8 border-r border-white/5">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">100k+</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Credentials Issued</div>
                  </div>
                  <div className="p-8 md:border-r border-white/5">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">50+</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Partner Institutions</div>
                  </div>
                  <div className="p-8 border-t border-r border-white/5 md:border-t-0">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">0s</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Verification Time</div>
                  </div>
                  <div className="p-8 border-t border-white/5 md:border-t-0">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">$0</div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">Cost to Verify</div>
                  </div>
              </div>
          </motion.div>
      </div>

      <div className="py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

           <div className="max-w-7xl mx-auto px-4 relative z-10">
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
               >
                   <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-300 to-white">
                     Ready to pioneer the future?
                   </h2>
                   <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                     Join the Attestify Pilot Program. We are partnering with forward-thinking institutions
                     to define the global standard for digital trust.
                   </p>
               </motion.div>

               <div className="mb-20">
                  <PilotIntegrationHub />
               </div>

               <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 px-4"
               >
                  <Button
                    onClick={() => window.open('mailto:attestifyteam@gmail.com?subject=Pilot Program Inquiry')}
                    variant="white"
                    className="hover:-translate-y-1 px-5! py-2.5! sm:px-10! sm:py-4! text-xs sm:text-lg font-black w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                      Apply for Pilot
                  </Button>
                  <Button
                    onClick={() => navigate('/partnership-guide')}
                    variant="secondary"
                    className="hover:-translate-y-1 px-5! py-2.5! sm:px-10! sm:py-4! text-xs sm:text-lg font-black w-auto border-white/10"
                  >
                      View Partnership Guide
                  </Button>
               </motion.div>
           </div>
      </div>

      <Footer />
    </div>
  );
};

export default Landing;
