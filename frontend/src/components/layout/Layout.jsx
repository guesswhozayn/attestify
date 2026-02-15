import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define routes that should have the Sidebar/Header layout (Dashboard routes)
  const dashboardRoutes = [
      '/dashboard',
      '/student-dashboard',
      '/issuer-dashboard',
      '/credentials',
      '/student/credentials',
      '/audit-logs',
      '/revoked',
      '/settings'
  ];

  const isDashboardRoute = dashboardRoutes.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Profile editor is strictly '/profile' (without ID)
  const isProfileEditor = location.pathname === '/profile' || location.pathname === '/profile/';

  const shouldShowLayout = user && (isDashboardRoute || isProfileEditor);

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  const getPageTitle = (pathname, role) => {
    switch (pathname) {
      case '/dashboard':
      case '/issuer-dashboard':
        return 'Dashboard';
      case '/student-dashboard':
        return 'Student Dashboard';
      case '/credentials':
        return 'Credentials';
      case '/student/credentials':
         return 'My Credentials';
      case '/settings':
        return 'Account Settings';
      case '/audit-logs':
        return 'Audit & Analytics';
      case '/profile':
        return role === 'ISSUER' ? 'Issuer Profile' : 'Student Profile';
      case '/revoked':
        return 'Revoked Credentials';
      default:
        // Handle student profile route which might have an ID
        if (pathname.includes('/student/')) return 'Student Profile';
        return 'Attestify';
    }
  };

  const title = getPageTitle(location.pathname, user?.role);

  return (
    <div className="min-h-screen bg-black flex selection:bg-indigo-500/30 text-gray-100 font-sans">
      {/* Fixed Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/[0.05] rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <Sidebar />
      <div className="flex-1 ml-20 transition-all duration-300 ease-in-out relative z-10 flex flex-col">
        <Header title={title} showSearch={false} />
        <div className="flex-1 flex flex-col min-h-0">
           {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
