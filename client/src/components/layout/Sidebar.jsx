import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Grid, FileText, Trash2, User, Activity, Settings, LogOut, X } from 'lucide-react';
import Button from '../shared/Button';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: Grid, path: '/dashboard', label: 'Dashboard', roles: ['ISSUER', 'STUDENT'] },
  { icon: FileText, path: '/credentials', label: 'Credentials', roles: ['ISSUER', 'STUDENT'] },
  { icon: Activity, path: '/network-status', label: 'Network', roles: ['ISSUER'] },
  { icon: Trash2, path: '/revoked', label: 'Revoked', roles: ['ISSUER'] },
  { icon: User, path: '/profile', label: 'Profile', roles: ['ISSUER', 'STUDENT'] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 md:w-20 bg-white/95 backdrop-blur-xl md:bg-white/95 border-r border-[#E8E4DC] flex flex-col items-center py-6 h-full transition-transform duration-300 ease-in-out shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 mb-8 cursor-pointer group" onClick={() => handleNavigate('/dashboard')}>
        <div className="relative w-11 h-11 rounded-xl bg-stone-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col space-y-2 w-full px-3">
        {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`relative p-3 rounded-xl flex items-center md:justify-center w-full transition-all duration-150 group cursor-pointer ${
                active
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-stone-900 text-stone-50 text-[11px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-md translate-x-1 group-hover:translate-x-0">
                {item.label}
                <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-stone-900 transform rotate-45" />
              </div>
              <span className="md:hidden ml-3 font-semibold text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col space-y-2 w-full px-3 mt-auto">
        <div className="h-px bg-stone-200/80 w-full mx-auto my-2" />
        <button
          onClick={() => handleNavigate('/settings')}
          className={`relative p-3 rounded-xl flex items-center md:justify-center w-full transition-all duration-150 group cursor-pointer ${
            location.pathname === '/settings'
              ? 'bg-stone-100 text-stone-900 border border-stone-200/80 font-medium'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-stone-900 text-stone-50 text-[11px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-md translate-x-1 group-hover:translate-x-0">
            Settings
            <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-stone-900 transform rotate-45" />
          </div>
          <span className="md:hidden ml-3 font-semibold text-sm tracking-tight">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="relative p-3 rounded-xl flex items-center md:justify-center w-full transition-all duration-150 group text-stone-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1 bg-stone-900 text-stone-50 text-[11px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-md translate-x-1 group-hover:translate-x-0">
            Log out
            <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-stone-900 transform rotate-45" />
          </div>
          <span className="md:hidden ml-3 font-semibold text-sm tracking-tight">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
