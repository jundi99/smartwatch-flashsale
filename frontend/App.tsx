
import React, { useState, useCallback } from 'react';
import { User, NotificationMessage } from './types';
import Login from './components/Login';
import FlashSale from './components/FlashSale';
import Header from './components/Header';
import Notification from './components/Notification';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    showNotification({ type: 'success', message: `Welcome, ${loggedInUser.email}!` });
  };

  const handleLogout = () => {
    setUser(null);
    showNotification({ type: 'info', message: 'You have been logged out.' });
  };

  const showNotification = useCallback((message: NotificationMessage) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center font-sans p-4">
      <Header user={user} onLogout={handleLogout} />
      <main className="w-full max-w-4xl mx-auto flex-grow flex items-center justify-center">
        {!user ? (
          <Login onLogin={handleLogin} showNotification={showNotification} />
        ) : (
          <FlashSale user={user} showNotification={showNotification} />
        )}
      </main>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
