import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  '/verify': 'Verify credential',
};

const getPageTitle = (pathname) => pageTitles[pathname] || (pathname.includes('/student/') ? 'Profile' : 'Attestify');

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const title = getPageTitle(location.pathname);

  const isVerify = location.pathname.startsWith('/verify');
  const isPublicVerify = isVerify && !user;

  const handleQuickIssue = (type) => {
    if (type === 'bulk') {
      setShowBulkModal(true);
    } else {
      setShowSingleModal(true);
    }
  };

  if (isPublicVerify) {
    return (
      <div className="min-h-dvh bg-[#F8F9FA] flex flex-col selection:bg-stone-900 selection:text-white text-stone-900 font-sans">
        <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </main>
      </div>
    );
  }

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
