import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import IssueCredentialModal from '../credential/IssueCredentialModal';
import BulkIssueModal from '../credential/BulkIssueModal';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/credentials': 'Credentials',
  '/settings': 'Account settings',
  '/profile': 'Profile',
  '/revoked': 'Revoked credentials',
  '/network-status': 'Network status',
};

const getPageTitle = (pathname) => pageTitles[pathname] || (pathname.includes('/student/') ? 'Profile' : 'Attestify');

const Layout = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const title = getPageTitle(location.pathname);
  const isDark = theme === 'dark';

  const handleQuickIssue = (type) => {
    if (type === 'bulk') {
      setShowBulkModal(true);
    } else {
      setShowSingleModal(true);
    }
  };

  return (
    <div className={`min-h-dvh flex font-sans relative transition-colors ${
      isDark
        ? 'dashboard-dark bg-[#0a0a0c] selection:bg-stone-100 selection:text-stone-900 text-stone-100'
        : 'dashboard-light bg-[#F8F9FA] selection:bg-stone-900 selection:text-white text-stone-900'
    }`}>
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onQuickIssue={handleQuickIssue}
      />

      {isMobileMenuOpen && (
        <div
          className={`fixed inset-0 z-30 md:hidden transition-opacity backdrop-blur-xs ${
            isDark ? 'bg-black/60' : 'bg-stone-950/25'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 md:ml-60 transition-all duration-200 relative z-10 flex flex-col w-full min-w-0">
        <Header
          title={title}
          onMenuClick={() => setIsMobileMenuOpen(prev => !prev)}
        />
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>

      <IssueCredentialModal
        isOpen={showSingleModal}
        onClose={() => setShowSingleModal(false)}
        onSuccess={() => setShowSingleModal(false)}
      />

      <BulkIssueModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => setShowBulkModal(false)}
      />
    </div>
  );
};

export default Layout;
