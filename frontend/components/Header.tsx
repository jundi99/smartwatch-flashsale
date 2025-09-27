import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 bg-dark bg-opacity-50 z-10 animate-slide-in-down">
      <div className="container mx-auto flex justify-between items-center max-w-4xl">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          <span className="text-primary">SMARTWATCH</span> SALE
        </h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Hello, {user.email}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;