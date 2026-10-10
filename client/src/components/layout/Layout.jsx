import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
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
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const title = getPageTitle(location.pathname);

  const handleQuickIssue = (type) => {
    if (type === 'bulk') {
      setShowBulkModal(true);
    } else {
      setShowSingleModal(true);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8F9FA] flex selection:bg-stone-900 selection:text-white text-stone-900 font-sans dashboard-light relative">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onQuickIssue={handleQuickIssue}
      />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-950/25 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 md:ml-64 transition-all duration-300 ease-in-out relative z-10 flex flex-col w-full min-w-0">
        <Header
          title={title}
          showSearch={true}
          onMenuClick={() => setIsMobileMenuOpen(prev => !prev)}
          onQuickIssue={() => handleQuickIssue('single')}
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

