import React, { useState, useEffect } from 'react';
import { Search, Bell, CircleHelp, Calendar, Wallet, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Avatar from '../shared/Avatar';

const Header = ({ title, showSearch = true, onSearch, searchPlaceholder = "Search...", rightContent }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Detect Wallet
  useEffect(() => {
    const detectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (err) {
                console.error('Error detecting wallet:', err);
            }
        }
    };

    detectWallet();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                setWalletAddress(null);
            }
        });
    }

    return () => {
        // Cleanup listener if possible (optional for this scope)
    };
  }, []);

  const copyAddress = () => {
      if (walletAddress) {
          navigator.clipboard.writeText(walletAddress);
          setIsCopied(true);
          showNotification('Wallet address copied to clipboard', 'success');
          setTimeout(() => setIsCopied(false), 2000);
      }
  };

  const formatAddress = (addr) => {
      if (!addr) return '';
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="sticky top-0 z-30 backdrop-blur-2xl bg-[#030014]/60 border-b border-white/[0.05] px-8 py-4 transition-all duration-300 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight flex items-center gap-3">
            {title}
            {/* Role Badge */}
            {user?.role && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === 'ISSUER' 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                    {user.role === 'ISSUER' ? 'Issuer Nexus' : 'Student Digital Backpack'}
                </span>
            )}
          </h1>
          {user?.role === 'ISSUER' && user?.issuerDetails?.institutionName && (
             <p className="text-gray-500 text-xs font-medium mt-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                {user.issuerDetails.institutionName}
             </p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-6">
          
          {/* Custom Right Content */}
          {rightContent}

          {/* New Features: Wallet Status */}
          <div className="hidden lg:flex items-center">
            {walletAddress ? (
                <button 
                    onClick={copyAddress}
                    className="flex items-center space-x-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full transition-all group backdrop-blur-md shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]"
                >
                    <div className="relative">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm opacity-50"></div>
                    </div>
                    <span className="text-xs font-mono font-medium text-emerald-400">
                        {formatAddress(walletAddress)}
                    </span>
                    {isCopied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-500/50 group-hover:text-emerald-400" />}
                </button>
            ) : (
                <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/[0.05] px-4 py-2 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-500">Wallet Disconnected</span>
                </div>
            )}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="bg-white/[0.03] text-white pl-10 pr-4 py-2.5 rounded-full border border-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 w-64 transition-all duration-200 placeholder-gray-600 text-sm hover:bg-white/[0.05] backdrop-blur-md shadow-inner"
              />
            </div>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center space-x-3 pl-4 border-l border-white/[0.06]">
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium leading-none">{user?.name}</div>
              <div className="text-gray-500 text-xs mt-1 leading-none">
                {user?.title || (user?.role === 'ISSUER' ? 'Issuer' : 'Student')}
              </div>
            </div>
            <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
               <Avatar 
                   src={user?.avatar} 
                   initials={user?.name} 
                   size="sm" 
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
