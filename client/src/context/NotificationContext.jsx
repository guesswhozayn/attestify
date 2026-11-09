import { createContext, useState, useContext, useMemo, useCallback } from 'react';
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

  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const notification = { id, message, type, duration };
    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[200] flex flex-col items-end space-y-2.5 pointer-events-none">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
