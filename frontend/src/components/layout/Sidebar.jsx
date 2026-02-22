import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Grid, FileText, Trash2, User, Activity, Settings, LogOut, X } from 'lucide-react';
import Button from '../shared/Button';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: Grid, path: '/dashboard', label: 'Dashboard', roles: ['ISSUER', 'STUDENT'] },
    { icon: FileText, path: '/credentials', label: 'Credentials', roles: ['ISSUER'] },
    { icon: FileText, path: '/credentials', label: 'Credentials', roles: ['STUDENT'] },
    { icon: Activity, path: '/network-status', label: 'Network', roles: ['ISSUER'] },
    { icon: Trash2, path: '/revoked', label: 'Revoked', roles: ['ISSUER'] },
    { icon: User, path: '/profile', label: 'Profile', roles: ['ISSUER', 'STUDENT'] },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 md:w-20 bg-black backdrop-blur-3xl md:bg-black/80 border-r border-white/[0.06] flex flex-col items-center py-6 h-full transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
      >
         <X className="w-5 h-5" />
      </button>
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none rounded-none"></div>

      {/* Brand / Logo */}
      <div 
        className="relative z-10 mb-8 cursor-pointer group"
        onClick={() => navigate('/dashboard')}
      >
        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black p-[1px] border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="relative z-10 flex-1 flex flex-col space-y-4 w-full px-3">
        {menuItems.map((item) => {
          if (!item.roles.includes(user?.role)) return null;
          
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.path}
              onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
              }}
              variant={active ? 'primary' : 'ghost'}
              rounded="2xl"
              className={`relative p-3 !shadow-none !justify-center ${
                active 
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-500/25 ring-1 ring-white/10' 
                  : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'animate-in zoom-in-50 duration-200' : ''}`} />
              
              {/* Tooltip (Desktop Only) */}
              <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
                <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-white/10 transform rotate-45"></div>
              </div>
              
              {/* Mobile Label */}
              <span className="md:hidden ml-4 font-semibold text-sm tracking-wide">{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 flex flex-col space-y-4 w-full px-3 mt-auto">
        <div className="h-px bg-white/[0.06] w-full mx-auto"></div>
        
        <Button
          onClick={() => {
             navigate('/settings');
             if (onClose) onClose();
          }}
          variant={isActive('/settings') ? 'secondary' : 'ghost'}
          rounded="2xl"
          className={`relative p-3 !shadow-none !justify-center ${
            isActive('/settings') 
              ? 'bg-white/[0.05] border border-white/[0.08]' 
              : 'text-gray-400'
          }`}
        >
          <Settings className={`w-6 h-6 ${isActive('/settings') ? 'animate-spin-slow' : ''}`} />
          {/* Tooltip (Desktop Only) */}
          <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
             Settings
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-white/10 transform rotate-45"></div>
          </div>
          {/* Mobile Label */}
          <span className="md:hidden ml-4 font-semibold text-sm tracking-wide">Settings</span>
        </Button>

        <Button
          onClick={handleLogout}
          variant="ghost"
          rounded="2xl"
          className="relative p-3 !shadow-none !justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-6 h-6" />
          <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-red-900/30 text-red-200 text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
             Logout
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-red-900/30 transform rotate-45"></div>
          </div>
          {/* Mobile Label */}
          <span className="md:hidden ml-4 font-semibold text-sm tracking-wide">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
