import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Header = ({
  title,
  onMenuClick
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAECF0] px-4 md:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            {walletAddress ? (
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 rounded-lg transition-colors cursor-pointer"
                title="Click to copy address"
              >
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                <span className="tabular-nums">{formatAddress(walletAddress)}</span>
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

          {!user && (
            <div className="pl-3 border-l border-stone-200">
              <a
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors"
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
