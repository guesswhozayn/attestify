import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Copy, Menu, Bell, Plus, Gift, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../shared/Button';
import { useNotification } from '../../context/NotificationContext';
import Avatar from '../shared/Avatar';

const Header = ({
  title,
  showSearch = true,
  onSearch,
  searchPlaceholder = "Search...",
  rightContent,
  onMenuClick,
  onQuickIssue
}) => {
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
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/95 border-b border-[#E8E4DC] px-4 md:px-8 py-3 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {showSearch ? (
            <div className="relative group w-full hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-700 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full bg-[#F8F9FA] hover:bg-white focus:bg-white text-stone-900 pl-10 pr-4 py-2 rounded-xl border border-stone-200/80 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400 text-xs font-medium placeholder-stone-400 transition-all shadow-2xs"
              />
            </div>
          ) : (
            <h1 className="text-lg font-bold text-stone-900 tracking-tight">
              {title}
            </h1>
          )}
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {rightContent}

          {/* Quick Action Icons: Gift / Bell / Plus */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => showNotification('You have no new notifications', 'info')}
              className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {onQuickIssue && (
              <button
                onClick={onQuickIssue}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                title="Quick Issue"
                aria-label="Quick Issue"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Connected Wallet */}
          <div className="hidden lg:flex items-center">
            {walletAddress ? (
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-lg transition-colors cursor-pointer"
                title="Click to copy address"
              >
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                <span className="tabular-nums">
                  {formatAddress(walletAddress)}
                </span>
                {isCopied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-stone-400 px-2 py-1">
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <span>Sepolia</span>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200/80">
            <div className="rounded-full ring-2 ring-stone-200/80 p-0.5">
              <Avatar src={user?.avatar} initials={user?.name} size="sm" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-stone-900 text-xs font-bold leading-tight truncate max-w-[120px]">
                {user?.issuerDetails?.institutionName || user?.name || 'Issuer User'}
              </div>
              <div className="text-stone-400 text-[10px] leading-tight font-medium uppercase tracking-wider mt-0.5">
                {user?.role === 'ISSUER' ? 'Organization' : 'Recipient'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);

