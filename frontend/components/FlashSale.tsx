import React, { useState, useEffect, useCallback } from 'react';
import { User, FlashSaleState, SaleStatus, NotificationMessage } from '../types';
import { api } from '../services/api';
import Spinner from './Spinner';

interface FlashSaleProps {
  user: User;
  showNotification: (notification: NotificationMessage) => void;
}

const CountdownTimer: React.FC<{ targetDate: number }> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = targetDate - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex space-x-4 text-center">
      {Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center p-2 bg-secondary rounded-lg">
          <span className="text-2xl font-bold text-accent">{value as number}</span>
          <span className="text-xs text-gray-400 uppercase">{interval}</span>
        </div>
      ))}
    </div>
  );
};


const FlashSale: React.FC<FlashSaleProps> = ({ user, showNotification }) => {
  const [saleState, setSaleState] = useState<FlashSaleState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);

  const fetchSaleState = useCallback(async () => {
    try {
      const state = await api.getFlashSaleState(user.id);
      setSaleState(state);
    } catch (error) {
      showNotification({ type: 'error', message: 'Could not fetch sale status.' });
    }
  }, [showNotification]);

  useEffect(() => {
    const initialFetch = async () => {
      await fetchSaleState();
      setIsLoading(false);
    };
    initialFetch();

    // Smart polling: faster during active sale, slower otherwise
    const getPollingInterval = () => {
      if (!saleState) return 3000; // Initial load
      if (saleState.status === 'ACTIVE') return 1000; // Fast during sale
      if (saleState.status === 'UPCOMING') return 5000; // Slower before sale
      return 10000; // Very slow after sale ends
    };

    const interval = setInterval(fetchSaleState, getPollingInterval());

    return () => {
      clearInterval(interval);
    };
  }, [fetchSaleState]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const result = await api.attemptPurchase(user.id);
      if (result.success) {
        showNotification({ type: 'success', message: result.message });
        setUserHasPurchased(true);
      } else {
        showNotification({ type: 'error', message: result.message });
        if (result.userHasPurchased) {
          setUserHasPurchased(true);
        }
      }
      await fetchSaleState(); // Refresh state after purchase attempt
    } catch (error) {
      showNotification({ type: 'error', message: 'An unexpected error occurred during purchase.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading || !saleState) {
    return <div className="text-center"><Spinner /><p className="mt-2">Loading Flash Sale...</p></div>;
  }

  const { product, currentStock, status, startTime, endTime } = saleState;

  const getStatusComponent = () => {
    switch (status) {
      case SaleStatus.UPCOMING:
        return (
          <div className="text-center p-4 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Sale Starts Soon!</h3>
            <CountdownTimer targetDate={startTime} />
          </div>
        );
      case SaleStatus.ACTIVE:
        return (
          <div className="text-center p-4 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-accent">Sale is Live!</h3>
            <p className="text-gray-400">Ends In:</p>
            <CountdownTimer targetDate={endTime} />
          </div>
        );
      case SaleStatus.SOLD_OUT:
        return <div className="text-center p-4 bg-red-800 bg-opacity-50 rounded-lg"><h3 className="text-xl font-semibold text-danger">Sold Out!</h3><p>Better luck next time.</p></div>;
      case SaleStatus.PURCHASE_SUCCESS:
        return <div className="text-center p-4 bg-blue-800 bg-opacity-50 rounded-lg"><h3 className="text-xl font-semibold text-green-500">Purchase Success!</h3><p>🎊 Congratulation 🎊</p></div>;
      case SaleStatus.ENDED:
        return <div className="text-center p-4 bg-gray-700 rounded-lg"><h3 className="text-xl font-semibold text-gray-400">Sale has Ended</h3></div>;
      default:
        return null;
    }
  };

  const isButtonDisabled = status !== SaleStatus.ACTIVE || isPurchasing || userHasPurchased;
  let buttonText = "Buy Now";
  if (isPurchasing) buttonText = "Processing...";
  if (userHasPurchased) buttonText = "Purchase Successful!";
  if (status === SaleStatus.SOLD_OUT) buttonText = "Sold Out";
  if (status === SaleStatus.ENDED) buttonText = "Sale Ended";
  if (status === SaleStatus.UPCOMING) buttonText = "Coming Soon";

  return (
    <div className="w-full max-w-4xl bg-dark rounded-xl shadow-2xl overflow-hidden md:flex animate-fade-in">
      <div className="md:w-1/2">
        <img className="object-cover w-full h-64 md:h-full" src={product.imageUrl} alt={product.name} />
      </div>
      <div className="p-8 md:w-1/2 flex flex-col justify-between">
        <div>
          <div className="uppercase tracking-wide text-sm text-primary font-semibold">Flash Sale</div>
          <h1 className="block mt-1 text-3xl leading-tight font-extrabold text-white">{product.name}</h1>
          <p className="mt-4 text-gray-400">{product.description}</p>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-bold text-white">Stock Left:</p>
            <p className="px-3 py-1 text-lg font-bold bg-accent rounded-full text-white">{currentStock} / {product.totalStock}</p>
          </div>
          <div className="mb-6">
            {getStatusComponent()}
          </div>
          <button
            onClick={handlePurchase}
            disabled={isButtonDisabled}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark focus:ring-primary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isPurchasing ? <Spinner /> : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashSale;