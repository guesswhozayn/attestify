import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Wallet, Users, CheckCircle, Globe, Zap, Building, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Background from '../components/shared/Background';
import useScrollY from '../utils/useScrollY';

const Landing = () => {
  const navigate = useNavigate();

  const scrollY = useScrollY();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative">
      <Background scrollY={scrollY} parallax />

      <Navbar />

      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md hover:bg-indigo-500/20 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
                Live on Sepolia Testnet
              </span>
            </div>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter">
                  The{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400">
                    Universal Standard
                  </span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-xl">
                  Attestify isn&apos;t just a platform. It&apos;s a new primitive for digital trust.
                </p>
              </div>

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


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight flex items-center justify-center gap-2 flex-wrap">
              Why <span className="font-sans text-5xl sm:text-6xl md:text-8xl font-black tracking-[-0.05em] lowercase text-white">attestify<span className="text-indigo-500">.</span></span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl">The three pillars of the new standard.</p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
             transition={{ duration: 1 }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >

             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#0d0f17]/85 backdrop-blur-xl p-8 flex flex-col justify-between hover:border-indigo-500/35 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_15px_35px_-15px_rgba(0,0,0,0.6)] transition-all duration-300"
             >
                <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                <div>
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <Shield className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">Immutable trust</h3>
                   <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
                      Once issued, a credential cannot be altered, forged, or deleted. It is cryptographically anchored to the blockchain forever.
                   </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/[0.05] flex items-center text-xs font-semibold text-indigo-400/90 group-hover:text-indigo-300 transition-colors">
                   <span>Cryptographic consensus</span>
                </div>
             </motion.div>

             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#0d0f17]/85 backdrop-blur-xl p-8 flex flex-col justify-between hover:border-indigo-500/35 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_15px_35px_-15px_rgba(0,0,0,0.6)] transition-all duration-300"
             >
                <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                <div>
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <Wallet className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">Sovereign control</h3>
                   <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
                      Students own and manage their data directly. No university intermediaries or transcript fees required to prove credentials.
                   </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/[0.05] flex items-center text-xs font-semibold text-indigo-400/90 group-hover:text-indigo-300 transition-colors">
                   <span>Self-sovereign identity</span>
                </div>
             </motion.div>

             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#0d0f17]/85 backdrop-blur-xl p-8 flex flex-col justify-between hover:border-indigo-500/35 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_15px_35px_-15px_rgba(0,0,0,0.6)] transition-all duration-300"
             >
                <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                <div>
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <CheckCircle className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">Instant verification</h3>
                   <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
                      Employers and institutions verify certificates in milliseconds with zero fees and mathematical certainty.
                   </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/[0.05] flex items-center text-xs font-semibold text-indigo-400/90 group-hover:text-indigo-300 transition-colors">
                   <span>Deterministic validation</span>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
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

      <div className="py-28 bg-gradient-to-b from-gray-950 via-black to-black relative overflow-hidden">
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

           <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16"
               >
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-6">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                     </span>
                     <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Pioneer Cohort • Academic Pilot 2026</span>
                   </div>
                   <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
                     Partner with Attestify
                   </h2>
                   <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                     Modernize academic verification across your institution in under 72 hours with zero infrastructure overhead.
                   </p>
               </motion.div>

               <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-10 lg:p-12 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                   
                   <div className="lg:col-span-7 flex flex-col justify-between">
                     <div>
                       <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4">
                         The Onboarding Journey
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-tight leading-snug">
                         From traditional registrar database to verifiable blockchain in 3 steps
                       </h3>

                       <div className="space-y-6 mb-10">
                         <div className="flex gap-4 items-start">
                           <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                             01
                           </div>
                           <div>
                             <h4 className="text-white font-semibold text-base mb-1">Institutional Binding</h4>
                             <p className="text-gray-400 text-sm leading-relaxed">
                               Authorize your official university signing wallet on the Attestify registry. No prior blockchain expertise required.
                             </p>
                           </div>
                         </div>

                         <div className="flex gap-4 items-start">
                           <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                             02
                           </div>
                           <div>
                             <h4 className="text-white font-semibold text-base mb-1">Plug-and-Play Issuance</h4>
                             <p className="text-gray-400 text-sm leading-relaxed">
                               Issue credentials in bulk using simple CSV uploads or sync graduated cohorts directly through our clean REST APIs.
                             </p>
                           </div>
                         </div>

                         <div className="flex gap-4 items-start">
                           <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                             03
                           </div>
                           <div>
                             <h4 className="text-white font-semibold text-base mb-1">Instant Global Verification</h4>
                             <p className="text-gray-400 text-sm leading-relaxed">
                               Students receive immutable, soulbound credentials. Employers and academic bodies verify authenticity in 0 seconds with zero fees.
                             </p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="flex flex-row flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                        <Button
                          onClick={() => window.open('mailto:attestifyteam@gmail.com?subject=Pilot Program Inquiry')}
                          variant="white"
                          className="hover:-translate-y-0.5 px-6! py-3! sm:px-8! sm:py-3.5! text-sm font-bold w-auto shadow-[0_0_25px_rgba(255,255,255,0.15)] flex items-center gap-2"
                        >
                            <span>Apply for Pilot</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => navigate('/partnership-guide')}
                          variant="secondary"
                          className="hover:-translate-y-0.5 px-6! py-3! sm:px-8! sm:py-3.5! text-sm font-bold w-auto border-white/10"
                        >
                            View Partnership Guide
                        </Button>
                     </div>
                   </div>

                   <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                     <div className="p-6 sm:p-7 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                       <div>
                         <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                           <Shield className="w-5 h-5 text-indigo-400" />
                           <span>Institutional Guarantees</span>
                         </h4>
                         <ul className="space-y-3.5 text-sm text-gray-400">
                           <li className="flex items-start gap-2.5">
                             <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                             <span><strong className="text-white font-medium">100% Subsidized Gas:</strong> All on-chain issuance & revocation transactions sponsored.</span>
                           </li>
                           <li className="flex items-start gap-2.5">
                             <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                             <span><strong className="text-white font-medium">Sub-Second Latency:</strong> Cryptographic SHA-256 validation verified globally in &lt; 1s.</span>
                           </li>
                           <li className="flex items-start gap-2.5">
                             <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                             <span><strong className="text-white font-medium">Open Source Core:</strong> Zero vendor lock-in. Full sovereignty over institutional data.</span>
                           </li>
                         </ul>
                       </div>
                     </div>

                     <div className="p-6 sm:p-7 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                       <div>
                         <div className="flex items-center justify-between gap-2 mb-3">
                           <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Live Network Anchor</span>
                           <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                             Sepolia Active
                           </span>
                         </div>
                         <p className="text-xs text-gray-400 mb-4">
                           Smart contract registry deployed and audited for tamper-proof institutional credentialing.
                         </p>
                         <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-gray-300 flex items-center justify-between">
                           <span className="truncate">0xce209eD4923DA8FDbf6C5a942245210a9Bc0809a</span>
                           <a
                             href="https://sepolia.etherscan.io/address/0xce209eD4923DA8FDbf6C5a942245210a9Bc0809a"
                             target="_blank"
                             rel="noreferrer"
                             className="text-indigo-400 hover:text-indigo-300 flex-shrink-0 ml-2"
                           >
                             <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                         </div>
                       </div>
                       <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center justify-between text-[11px] text-gray-500">
                         <span>ERC-5192 Soulbound Standards</span>
                         <span>IPFS SHA-256 Storage</span>
                       </div>
                     </div>
                   </div>

                 </div>
               </div>
           </div>
      </div>

      <Footer />
    </div>
  );
};

export default Landing;
