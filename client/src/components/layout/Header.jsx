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
    if (typeof window.ethereum === 'undefined') return;

    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => accounts?.[0] && setWalletAddress(accounts[0]))
      .catch(err => console.error('Error detecting wallet:', err));

    const handleAccountsChanged = (accounts) => setWalletAddress(accounts?.[0] || null);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    showNotification('Wallet address copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-white/95 border-b border-[#E8E4DC] px-4 md:px-8 py-3.5 transition-all duration-300">
      <div className="flex items-center justify-between relative">
        <div className="md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 whitespace-nowrap text-center md:text-left pointer-events-none md:pointer-events-auto flex flex-col items-center md:items-start">
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight flex items-center justify-center md:justify-start gap-2 md:gap-3 pointer-events-auto">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          {rightContent}

          <div className="hidden lg:flex items-center">
            {walletAddress ? (
              <Button
                onClick={copyAddress}
                variant="ghost"
                rounded="xl"
                size="sm"
                className="bg-[#EDF5EE] hover:bg-[#E2EFE3] border border-[#CFE6D3] px-3.5 py-1.5 shadow-2xs group/wallet transition-all duration-200"
              >
                <div className="relative">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-[#25562C] font-mono tabular-nums tracking-wide">
                  {formatAddress(walletAddress)}
                </span>
                {isCopied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-[#25562C]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#25562C]/60 group-hover/wallet:text-[#25562C] transition-colors" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                rounded="xl"
                size="sm"
                disabled
                className="bg-stone-100 border border-stone-200 px-4 py-2 opacity-70 cursor-not-allowed shadow-none"
              >
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Disconnected
                </span>
              </Button>
            )}
          </div>

          {showSearch && (
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-700 transition-colors" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="bg-white text-stone-900 pl-9 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400 w-64 transition-all duration-200 placeholder-stone-400 text-sm shadow-2xs hover:border-stone-300"
              />
            </div>
          )}

          <div className="flex items-center space-x-3 pl-4 border-l border-stone-200">
            <div className="text-right hidden sm:block">
              <div className="text-stone-900 text-sm font-semibold leading-none">{user?.name}</div>
              <div className="text-stone-500 text-xs mt-1 leading-none font-medium">
                {user?.title || (user?.role === 'ISSUER' ? 'Issuer' : 'Student')}
              </div>
            </div>
            <div className="hover:scale-105 transition-transform duration-200 rounded-full ring-2 ring-stone-200/80">
              <Avatar src={user?.avatar} initials={user?.name} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Header);
