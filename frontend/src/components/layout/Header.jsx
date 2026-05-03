import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Copy, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';
import { useNotification } from '../../context/NotificationContext';
import Avatar from '../shared/Avatar';

const Header = ({ title, showSearch = true, onSearch, searchPlaceholder = "Search...", rightContent, onMenuClick }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  
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

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
        } else {
            setWalletAddress(null);
        }
    };

    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
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
    <div className="sticky top-0 z-30 backdrop-blur-2xl bg-[#030014]/60 border-b border-white/[0.05] px-4 md:px-8 py-4 transition-all duration-300 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between relative">
        
        {/* Mobile Menu Button - Appears only on small screens */}
        <div className="md:hidden">
            <button 
                onClick={onMenuClick}
                className="p-2 -ml-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Toggle Menu"
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Title Section */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 whitespace-nowrap text-center md:text-left pointer-events-none md:pointer-events-auto flex flex-col items-center md:items-start">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight flex items-center justify-center md:justify-start gap-2 md:gap-3 pointer-events-auto">
            {title}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-6">
          
          {/* Custom Right Content */}
          {rightContent}

          {/* New Features: Wallet Status */}
          <div className="hidden lg:flex items-center">
            {walletAddress ? (
                <Button 
                    onClick={copyAddress}
                    variant="ghost"
                    rounded="full"
                    size="sm"
                    className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 !shadow-none group/wallet transition-all duration-300"
                >
                    <div className="relative">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm opacity-50"></div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {formatAddress(walletAddress)}
                    </span>
                    {isCopied ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-emerald-500/50 group-hover/wallet:text-emerald-400 transition-colors" />
                    )}
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    rounded="full"
                    size="sm"
                    disabled
                    className="bg-white/[0.02] border border-white/[0.05] px-4 py-2 opacity-60 cursor-not-allowed !shadow-none"
                >
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Disconnected
                    </span>
                </Button>
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
            <div className="cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full">
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

export default React.memo(Header);
