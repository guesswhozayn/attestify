import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowLeft, AlignRight, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = ({ showSidebarToggle = false, onToggleSidebar, onBack, showBack = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Documentation', path: '/docs' },
    { name: 'Verify', path: '/verify' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6 px-4 pointer-events-none">
      <nav className="relative flex items-center justify-between w-full max-w-5xl h-14 md:h-16 px-4 md:px-6 rounded-full bg-stone-900/90 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer group flex items-center"
        >
          <span className="font-mono text-xl font-bold tracking-tight lowercase text-white">
            attestify<span className="text-indigo-400">.</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`text-xs font-medium transition-colors cursor-pointer ${
                location.pathname === link.path
                  ? 'text-white font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              onClick={onBack || (() => navigate(-1))}
              variant="secondary"
              size="sm"
              rounded="full"
              className="hidden sm:flex text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          )}

          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 text-stone-300 hover:text-white rounded-lg"
              aria-label="Toggle menu"
            >
              <AlignRight className="w-5 h-5" />
            </button>
          )}

          {!showSidebarToggle && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-stone-300 hover:text-white rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <AlignRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-24 inset-x-4 bg-stone-900 border border-white/10 rounded-2xl p-4 shadow-xl pointer-events-auto space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                navigate(link.path);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs font-medium text-stone-300 hover:text-white hover:bg-white/5 rounded-lg"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default React.memo(Navbar);
