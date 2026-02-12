import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Check, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ title, showSearch = true, onSearch, searchPlaceholder = "Search...", rightContent }) => {
  const { user } = useAuth();
  const { unreadCount, refreshUnreadCount, setUnreadCount } = useNotification(); // Use context
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Removed local polling useEffect
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed fetchUnreadCount definition

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 5 });
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleToggleDropdown = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead([id]);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAsRead(); // Empty array implies all
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/50 px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            {title}
          </h1>
          {user?.role === 'INSTITUTE' && (
             <p className="text-indigo-400/80 text-xs font-semibold tracking-wide uppercase mt-0.5">
               {user?.instituteDetails?.institutionName || user?.name} Institute Portal
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
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleToggleDropdown}
                className="relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-gray-900"></span>
                  </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No recent notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-800/50 transition-colors ${!notification.isRead ? 'bg-gray-800/20' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification._id);
                                                            }}
                                                            className="w-2 h-2 rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors"
                                                            title="Mark as read"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-800 bg-gray-950/50 text-center">
                        <button className="text-xs text-gray-500 hover:text-white transition-colors">
                            View all history
                        </button>
                    </div>
                </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-800">
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium leading-none">{user?.name}</div>
              <div className="text-gray-500 text-xs mt-1 leading-none">
                {user?.title || (user?.role === 'INSTITUTE' ? 'Institute' : 'Student')}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl shadow-lg shadow-purple-900/20">
               <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[10px]" />
                  ) : (
                    <span className="text-white font-bold text-sm bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-pink-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
