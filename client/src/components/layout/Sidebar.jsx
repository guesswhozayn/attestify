import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  FileCheck2,
  Trash2,
  User,
  Activity,
  Settings,
  LogOut,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, onQuickIssue }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const isIssuer = user?.role === 'ISSUER';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard', roles: ['ISSUER', 'STUDENT'] },
    { icon: FileCheck2, path: '/credentials', label: 'Credentials', roles: ['ISSUER', 'STUDENT'] },
    ...(isIssuer ? [
      { icon: Trash2, path: '/revoked', label: 'Revoked', roles: ['ISSUER'] },
      { icon: Activity, path: '/network-status', label: 'Network', roles: ['ISSUER'] }
    ] : []),
    { icon: CheckCircle2, path: '/verify', label: 'Verify', roles: ['ISSUER', 'STUDENT'] },
    { icon: Settings, path: '/settings', label: 'Settings', roles: ['ISSUER', 'STUDENT'] },
    { icon: User, path: '/profile', label: 'Profile', roles: ['ISSUER', 'STUDENT'] }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#EAECF0] flex flex-col h-full transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-5 flex items-center justify-between border-b border-[#F2F4F7]">
        <div
          onClick={() => handleNavigate('/dashboard')}
          className="cursor-pointer"
        >
          <span className="font-mono text-xl font-bold tracking-tight lowercase text-stone-900">
            attestify<span className="text-indigo-600">.</span>
          </span>
        </div>

        <button
          onClick={onClose}
          className="md:hidden p-1 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
      </div>

      <div className="p-3 border-t border-[#F2F4F7] space-y-2">
        {isIssuer && onQuickIssue && (
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => onQuickIssue('single')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue</span>
            </button>
            <button
              onClick={() => onQuickIssue('bulk')}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
              title="Bulk issue"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>
        )}

        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold text-stone-900 truncate">
                {user?.issuerDetails?.institutionName || user?.name || 'Account'}
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                {isIssuer ? 'Issuer' : 'Student'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
