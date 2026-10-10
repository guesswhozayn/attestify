import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

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
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-dvh bg-white flex selection:bg-stone-900 selection:text-white text-stone-900 font-sans dashboard-light relative">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-950/25 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 md:ml-20 transition-all duration-300 ease-in-out relative z-10 flex flex-col w-full">
        <Header
          title={title}
          showSearch={false}
          onMenuClick={() => setIsMobileMenuOpen(prev => !prev)}
        />
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
