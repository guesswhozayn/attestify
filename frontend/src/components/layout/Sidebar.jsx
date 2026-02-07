import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Grid, FileText, Users, Trash2, User, LogOut, Settings, ClipboardList, Building } from 'lucide-react';
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
    <div className="w-20 bg-gray-900 flex flex-col items-center py-6 space-y-8 fixed h-full">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center cursor-pointer"
           onClick={() => navigate('/dashboard')}>
        <Shield className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        {menuItems.map((item) => {
          if (!item.roles.includes(user?.role)) return null;
          
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-lg transition relative group ${
                isActive(item.path) 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/settings')}
        className={`p-3 rounded-lg transition ${
          isActive('/settings') ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-gray-800'
        }`}
        title="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      <button
        onClick={handleLogout}
        className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
        title="Logout"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Sidebar;
