import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const noLayoutRoutes = ['/', '/login', '/register', '/verify'];
  const shouldShowLayout = user && !noLayoutRoutes.includes(location.pathname);

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 ml-20">
        {children}
      </div>
    </div>
  );
};

export default Layout;
