
import React, { useState } from 'react';
import { api } from '../services/api';
import { User, NotificationMessage } from '../types';
import Spinner from './Spinner';

interface LoginProps {
  onLogin: (user: User) => void;
  showNotification: (notification: NotificationMessage) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, showNotification }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showNotification({ type: 'error', message: 'Please enter an email.' });
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);
    try {
      const user = await api.login(email);
      onLogin(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showNotification({ type: 'error', message: `Login failed: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-dark rounded-xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">Join the Flash Sale</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-secondary border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? <Spinner /> : 'Enter'}
        </button>
      </form>
    </div>
  );
};

export default Login;
