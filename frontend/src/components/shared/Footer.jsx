import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/10 z-10">
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
              <span className="text-2xl font-bold text-white tracking-tight uppercase">Attestify</span>
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-md font-medium">
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
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2 lg:pt-0">
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
                <li><button onClick={() => navigate('/about')} className="hover:text-indigo-400 transition-colors">About Us</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Security</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Blog</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Contact</button></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Cookie Policy</button></li>
                <li><button className="hover:text-indigo-400 transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 font-medium">
            &copy; 2026 Attestify Protocol. All rights reserved.
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
  );
};

export default Footer;
