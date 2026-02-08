import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Grid, FileText, Users, Trash2, User, LogOut, Settings, ClipboardList, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: Grid, path: '/dashboard', label: 'Dashboard', roles: ['INSTITUTE', 'STUDENT'] },
    { icon: ClipboardList, path: '/audit-logs', label: 'Audit Logs', roles: ['INSTITUTE'] },
    { icon: Trash2, path: '/revoked', label: 'Revoked', roles: ['INSTITUTE'] },
    { icon: User, path: '/profile', label: 'Profile', roles: ['INSTITUTE', 'STUDENT'] },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-20 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 flex flex-col items-center py-6 fixed h-full z-40 transition-all duration-300">
      
      {/* Brand / Logo */}
      <div 
        className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-purple-500/20 mb-8 hover:scale-105 transition-transform duration-200"
        onClick={() => navigate('/dashboard')}
      >
        <Shield className="w-6 h-6 text-white" />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-4 w-full px-3">
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
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'animate-in zoom-in-50 duration-200' : ''}`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45"></div>
              </div>

              {/* Active Indicator Dot (Optional style variant) */}
              {/* {active && <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full"></div>} */}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col space-y-4 w-full px-3 mt-auto">
        <div className="h-px bg-gray-800 w-full mx-auto"></div>
        
        <button
          onClick={() => navigate('/settings')}
          className={`group relative p-3 rounded-xl transition-all duration-200 w-full flex justify-center ${
            isActive('/settings') 
              ? 'bg-gray-800 text-white border border-gray-700' 
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <Settings className={`w-6 h-6 ${isActive('/settings') ? 'animate-spin-slow' : ''}`} />
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
             Settings
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45"></div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="group relative p-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full flex justify-center"
        >
          <LogOut className="w-6 h-6" />
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 border border-red-900/30 text-red-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
             Logout
             <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-900 border-l border-b border-red-900/30 transform rotate-45"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
