import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Grid, FileText, Users, Trash2, User, LogOut, Settings, ClipboardList, Menu, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: Grid, path: '/dashboard', label: 'Dashboard', roles: ['ISSUER', 'STUDENT'] },
    { icon: FileText, path: '/credentials', label: 'Credentials', roles: ['ISSUER'] },
    { icon: FileText, path: '/student/credentials', label: 'My Credentials', roles: ['STUDENT'] },
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
    <div className="w-20 bg-black/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col items-center py-6 fixed h-full z-40 transition-all duration-300">
      
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
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group relative p-3 rounded-xl transition-all duration-200 w-full flex justify-center ${
                active 
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10' 
                  : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'animate-in zoom-in-50 duration-200' : ''}`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
                <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-white/10 transform rotate-45"></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 flex flex-col space-y-4 w-full px-3 mt-auto">
        <div className="h-px bg-white/[0.06] w-full mx-auto"></div>
        
        <button
          onClick={() => navigate('/settings')}
          className={`group relative p-3 rounded-xl transition-all duration-200 w-full flex justify-center ${
            isActive('/settings') 
              ? 'bg-white/[0.05] text-white border border-white/[0.08]' 
              : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
          }`}
        >
          <Settings className={`w-6 h-6 ${isActive('/settings') ? 'animate-spin-slow' : ''}`} />
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-white/10 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
             Settings
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-white/10 transform rotate-45"></div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="group relative p-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full flex justify-center"
        >
          <LogOut className="w-6 h-6" />
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/90 border border-red-900/30 text-red-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-xl translate-x-2 group-hover:translate-x-0">
             Logout
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-black/90 border-l border-b border-red-900/30 transform rotate-45"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
