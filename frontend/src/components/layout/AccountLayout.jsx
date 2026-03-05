import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Wallet, ChevronRight } from 'lucide-react';
import GradientBackground from '../shared/GradientBackground';

const AccountLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];


  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans relative pb-20">
      <GradientBackground />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-6"
            >
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Account</h1>
                <p className="text-zinc-500 text-sm font-medium">Manage your digital presence and security.</p>
              </div>

              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname === tab.path;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.path)}
                      className={`
                        group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300
                        ${isActive 
                          ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                          : 'bg-white/2 border border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          p-2 rounded-xl border transition-colors
                          ${isActive ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-[11px]">{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Account Quick Stats / Info */}
              <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10 space-y-4 text-center sm:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Account Security</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    Your account is secured by on-chain identity verification and end-to-end encryption.
                  </p>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
