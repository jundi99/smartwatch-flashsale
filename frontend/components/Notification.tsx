
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 animate-slide-in-down';
  const typeClasses = {
    success: 'bg-accent',
    error: 'bg-danger',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

export default Notification;
