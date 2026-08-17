const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'contexts', 'NotificationContext.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

const newCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

const NotificationContext = createContext(null);

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const auth = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Load from local storage when user changes
  useEffect(() => {
    if (!auth?.user?.id) {
      setNotifications([]);
      return;
    }
    
    const key = \`petsogram_notifications_\${auth.user.id}\`;
    const raw = localStorage.getItem(key);
    
    if (raw) {
      try {
        setNotifications(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse notifications", e);
        setNotifications([]);
      }
    } else {
      // First time loading for this user - seed demo notifications
      const demoNots = MOCK_NOTIFICATIONS.map((n, i) => ({
        id: \`demo-\${i}\`,
        type: n.type || (n.title.toLowerCase().includes('reward') ? 'reward' : 'adoption'),
        title: n.title,
        message: n.message,
        timestamp: Date.now() - (i * 3600000), // staggering timestamps for demo
        read: false,
        action_route: n.title.toLowerCase().includes('reward') ? '/rewards' : '/adopt'
      }));
      setNotifications(demoNots);
      localStorage.setItem(key, JSON.stringify(demoNots));
    }
    
    // Cross-tab synchronization
    const handleStorage = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync notifications", err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    
  }, [auth?.user?.id]);

  // Sync to local storage
  const saveNotifications = (newNots) => {
    // Keep a maximum of 200 notifications
    const trimmedNots = newNots.slice(0, 200);
    setNotifications(trimmedNots);
    if (auth?.user?.id) {
      localStorage.setItem(\`petsogram_notifications_\${auth.user.id}\`, JSON.stringify(trimmedNots));
    }
  };

  const addNotification = (type, title, message, route = null, dedupeKey = null) => {
    if (!auth?.user?.id) return;
    
    setNotifications(prev => {
      // Check dedupe key if provided
      if (dedupeKey && prev.some(n => n.dedupeKey === dedupeKey)) {
        return prev;
      }
      
      const newNot = {
        id: \`notif-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        action_route: route,
        dedupeKey
      };
      
      const updated = [newNot, ...prev].slice(0, 200);
      if (auth?.user?.id) {
        localStorage.setItem(\`petsogram_notifications_\${auth.user.id}\`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const markAsRead = (id) => {
    saveNotifications(notifications?.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    saveNotifications(notifications?.map(n => ({ ...n, read: true })));
  };

  const clearHistory = () => {
    saveNotifications([]);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearHistory
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
`;

fs.writeFileSync(destFile, newCode);
console.log("Successfully updated NotificationContext.jsx");
