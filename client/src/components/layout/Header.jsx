import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

const Header = ({
  title,
  onMenuClick
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => accounts?.[0] && setWalletAddress(accounts[0]))
      .catch(err => console.error('Error detecting wallet:', err));

    const handleAccountsChanged = (accounts) => setWalletAddress(accounts?.[0] || null);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const activeAddress = walletAddress || user?.issuerDetails?.authorizedWalletAddress || user?.walletAddress;

  const copyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setIsCopied(true);
    showNotification('Wallet address copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <header className={`sticky top-0 z-30 px-4 md:px-8 py-3 transition-colors backdrop-blur-md ${
      isDark
        ? 'bg-[#0e1017]/90 border-b border-white/[0.08] text-stone-100'
        : 'bg-white/95 border-b border-[#EAECF0] text-stone-900'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className={`md:hidden p-2 -ml-2 rounded-xl transition-colors ${
              isDark
                ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-white hover:text-stone-200 hover:bg-white/[0.06]'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center">
            {activeAddress ? (
              <button
                onClick={copyAddress}
                className={`flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                }`}
                title="Click to copy address"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="tabular-nums">{formatAddress(activeAddress)}</span>
                {isCopied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className={`w-3.5 h-3.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                )}
              </button>
            ) : (
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`} />
                <span>Sepolia</span>
              </div>
            )}
          </div>

          {!user && (
            <div className={`pl-3 border-l ${isDark ? 'border-white/[0.08]' : 'border-stone-200'}`}>
              <a
                href="/login"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                  isDark
                    ? 'bg-white text-stone-950 hover:bg-stone-200'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                Sign in
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
