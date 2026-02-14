import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const noLayoutRoutes = ['/', '/login', '/register', '/verify', '/docs'];
  const shouldShowLayout = user && !noLayoutRoutes.includes(location.pathname);

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex selection:bg-indigo-500/30 text-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 ml-20 transition-all duration-300 ease-in-out relative">
        <div className="min-h-screen flex flex-col">
           {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
