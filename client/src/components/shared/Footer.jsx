import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Shield } from 'lucide-react';
import Button from './Button';

const platformLinks = [
  { name: 'Dashboard', path: '/login' },
  { name: 'Verification', path: '/verify' },
  { name: 'Documentation', path: '/docs' },
  { name: 'API Status' },
];

const companyLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Security' },
  { name: 'Blog' },
  { name: 'Contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Cookie Policy' },
  { name: 'Security' },
];

const Footer = () => {
  const navigate = useNavigate();

  const renderLinkGroup = (title, links) => (
    <div>
      <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wide">{title}</h4>
      <ul className="space-y-1 text-sm font-medium text-gray-500">
        {links.map((link, idx) => (
          <li key={idx}>
            <Button
              onClick={link.path ? () => navigate(link.path) : undefined}
              variant="ghost"
              size="sm"
              className="!px-0 !py-2 hover:text-indigo-400 w-fit justify-start bg-transparent border-none shadow-none"
            >
              {link.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative bg-[#06070a] pt-20 pb-12 overflow-hidden border-t border-white/[0.08] z-10">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-indigo-600/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-sans text-2xl font-bold tracking-tight lowercase text-white">
                attestify<span className="text-indigo-500">.</span>
              </span>
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-md font-medium">
              Verifiable academic credentials for students and institutions. Permanent, secure, and easy to share.
            </p>

            <div className="pt-4">
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Stay updated</h4>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 h-[46px] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <Button variant="white" size="md" className="font-bold !h-[46px] min-w-[120px] w-full sm:w-auto">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2 lg:pt-0">
            {renderLinkGroup('Platform', platformLinks)}
            {renderLinkGroup('Company', companyLinks)}
            <div className="col-span-2 sm:col-span-1">
              {renderLinkGroup('Legal', legalLinks)}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 font-medium">
            &copy; 2026 Attestify. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" aria-label="GitHub" className="text-gray-500 hover:text-white transition-colors hover:scale-110 duration-300">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-[#1DA1F2] transition-colors hover:scale-110 duration-300">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-[#0077b5] transition-colors hover:scale-110 duration-300">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="text-sm text-gray-600 flex items-center gap-2">
            Made with <span className="text-red-500 animate-pulse">♥</span> for education
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
