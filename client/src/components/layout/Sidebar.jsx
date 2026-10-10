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
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
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

  const generalItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard', roles: ['ISSUER', 'STUDENT'] },
    { icon: FileCheck2, path: '/credentials', label: 'Credentials', roles: ['ISSUER', 'STUDENT'] },
    { icon: Activity, path: '/network-status', label: 'Network', roles: ['ISSUER'] },
    { icon: Trash2, path: '/revoked', label: 'Revoked', roles: ['ISSUER'] },
  ];

  const toolItems = [
    ...(isIssuer ? [
      {
        icon: Plus,
        label: 'Issue credential',
        action: () => onQuickIssue?.('single'),
        roles: ['ISSUER'],
      },
      {
        icon: FileSpreadsheet,
        label: 'Bulk issue',
        action: () => onQuickIssue?.('bulk'),
        roles: ['ISSUER'],
      },
    ] : []),
    {
      icon: CheckCircle2,
      path: '/verify',
      label: 'Verify certificate',
      roles: ['ISSUER', 'STUDENT']
    },
  ];

  const supportItems = [
    { icon: Settings, path: '/settings', label: 'Settings', roles: ['ISSUER', 'STUDENT'] },
    { icon: User, path: '/profile', label: 'Profile', roles: ['ISSUER', 'STUDENT'] },
    { icon: HelpCircle, path: '/docs', label: 'Documentation', roles: ['ISSUER', 'STUDENT'] },
  ];

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const active = item.path && location.pathname === item.path;

    const handleClick = () => {
      if (item.action) {
        item.action();
        if (onClose) onClose();
      } else if (item.path) {
        handleNavigate(item.path);
      }
    };

    return (
      <button
        key={item.label}
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
          active
            ? 'bg-stone-900 text-white shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-stone-500'}`} />
          <span className="truncate">{item.label}</span>
        </div>
      </button>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E4DC] flex flex-col h-full transition-transform duration-300 ease-in-out shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Header: Logo & Name */}
      <div className="p-5 flex items-center justify-between border-b border-[#ECE7DE]/60">
        <div
          onClick={() => handleNavigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-150">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-stone-900 tracking-tight flex items-center gap-0.5">
              Attestify<span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5"></span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav Items by Group */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* GENERAL Section */}
        <div>
          <span className="text-[10px] font-bold text-stone-400 tracking-[0.15em] uppercase px-3 block mb-2">
            General
          </span>
          <div className="space-y-1">
            {generalItems
              .filter(item => item.roles.includes(user?.role))
              .map(renderNavButton)}
          </div>
        </div>

        {/* TOOLS Section */}
        {toolItems.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-stone-400 tracking-[0.15em] uppercase px-3 block mb-2">
              Tools
            </span>
            <div className="space-y-1">
              {toolItems
                .filter(item => item.roles.includes(user?.role))
                .map(renderNavButton)}
            </div>
          </div>
        )}

        {/* SUPPORT Section */}
        <div>
          <span className="text-[10px] font-bold text-stone-400 tracking-[0.15em] uppercase px-3 block mb-2">
            Support
          </span>
          <div className="space-y-1">
            {supportItems
              .filter(item => item.roles.includes(user?.role))
              .map(renderNavButton)}
          </div>
        </div>
      </div>

      {/* Bottom Profile / Quick Action Card */}
      <div className="p-4 border-t border-[#ECE7DE]/60 space-y-3 bg-[#FAF8F5]/50">
        <div
          onClick={() => handleNavigate('/profile')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#E8E4DC] hover:border-stone-400 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-stone-900 truncate">
                {user?.issuerDetails?.institutionName || user?.name || 'Account'}
              </div>
              <div className="text-[10px] text-stone-500 font-medium truncate">
                {isIssuer ? 'Verified Issuer' : 'Student Portal'}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        </div>

        {isIssuer && onQuickIssue && (
          <button
            onClick={() => onQuickIssue('single')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Credential</span>
          </button>
        )}

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-stone-400">
          <span>© 2026 Attestify, Inc.</span>
          <button
            onClick={handleLogout}
            className="text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
