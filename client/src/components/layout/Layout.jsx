import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/credentials': 'Credentials',
  '/settings': 'Account Settings',
  '/profile': 'Profile',
  '/revoked': 'Revoked Credentials',
  '/network-status': 'Network Status',
};

const getPageTitle = (pathname) => pageTitles[pathname] || (pathname.includes('/student/') ? 'Profile' : 'Attestify');

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-black flex selection:bg-indigo-500/30 text-gray-100 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/7 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/3 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
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
