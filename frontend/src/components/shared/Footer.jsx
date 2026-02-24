import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ShieldLogo from './ShieldLogo';
import Button from './Button';

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
              <ShieldLogo size="md" />
              <BrandLogo textSize="text-2xl" />
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-md font-medium">
              Building the trust layer for the internet. Empowering students and institutions with blockchain-verified credentials that are owned forever.
            </p>
            
            {/* Newsletter */}
            <div className="pt-4">
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 h-[46px] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-full sm:w-auto"
                  />
                </div>
                <Button 
                  variant="white"
                  size="md"
                  className="font-bold !h-[46px] min-w-[120px] w-full sm:w-auto"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          {/* Links - Spans 7 columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2 lg:pt-0">
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Platform</h4>
              <ul className="space-y-1 text-sm font-medium text-gray-500">
                <li><Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Dashboard</Button></li>
                <li><Button onClick={() => navigate('/verify')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Verification</Button></li>
                <li><Button onClick={() => navigate('/pricing')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Pricing</Button></li>
                <li><Button onClick={() => navigate('/docs')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Documentation</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">API Status</Button></li>
              </ul>
            </div>


            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-1 text-sm font-medium text-gray-500">
                <li><Button onClick={() => navigate('/about')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">About Us</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Security</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Blog</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Contact</Button></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-1 text-sm font-medium text-gray-500">
                <li><Button onClick={() => navigate('/privacy')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Privacy Policy</Button></li>
                <li><Button onClick={() => navigate('/terms')} variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Terms of Service</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Cookie Policy</Button></li>
                <li><Button variant="ghost" size="sm" className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none">Security</Button></li>
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

export default React.memo(Footer);
