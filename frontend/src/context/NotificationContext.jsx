import React, { createContext, useState, useContext, useEffect } from 'react';
import Notification from '../components/layout/Notification';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
        // Need to import notificationAPI here or pass it in? 
        // Better to import it since this is a provider.
        // Assuming imports are handled at top of file, we need to add import line separately if not present.
        const { notificationAPI } = await import('../services/api');
        const res = await notificationAPI.getUnreadCount();
        setUnreadCount(res.data.count);
    } catch (error) {
        // console.error('Failed to fetch unread count', error);
    }
  };

  const showNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Method to manually refresh count (e.g. after reading)
  const refreshUnreadCount = () => {
      fetchUnreadCount();
  };

  return (
    <NotificationContext.Provider value={{ showNotification, unreadCount, refreshUnreadCount, setUnreadCount }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
