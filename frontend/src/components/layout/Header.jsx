import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title, showSearch = true, onSearch, searchPlaceholder = "Search...", rightContent }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/50 px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            {title}
          </h1>
          {/* ... (keep existing conditional rendering for subtitle) ... */}
           {user?.role === 'INSTITUTE' && (
             <p className="text-indigo-400/80 text-xs font-semibold tracking-wide uppercase mt-0.5">
               {user?.university} Admin Portal
             </p>
          )}
          {user?.role === 'STUDENT' && (
             <p className="text-indigo-400/80 text-xs font-semibold tracking-wide uppercase mt-0.5">
               Student Portal
             </p>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-6">
          
          {/* Custom Right Content */}
          {rightContent}

          {/* Search Bar */}
          {showSearch && (
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="bg-gray-900/50 text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent w-64 transition-all duration-200 placeholder-gray-600 text-sm hover:bg-gray-800/80"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-800">
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium leading-none">{user?.name}</div>
              <div className="text-gray-500 text-xs mt-1 leading-none">{user?.role === 'INSTITUTE' ? 'Administrator' : 'Student'}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl shadow-lg shadow-purple-900/20">
               <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-bold text-sm bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-pink-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
