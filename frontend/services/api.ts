import { User, FlashSaleState, PurchaseResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Request failed', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new ApiError('Network error occurred. Please check your connection.');
  }
}

export const api = {
  login: async (email: string): Promise<User> => {
    const response = await makeRequest<{ success: boolean; data: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.data;
  },

  getFlashSaleState: async (userId: string): Promise<FlashSaleState> => {
    const response = await makeRequest<{ success: boolean; data: FlashSaleState }>(`/flash-sale/state/${userId}`);
    return response.data;
  },

  attemptPurchase: async (userId: string): Promise<PurchaseResult> => {
    try {
      const response = await makeRequest<{ success: boolean; message: string }>('/flash-sale/purchase', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        // Parse the error response for purchase failures
        try {
          const errorData = JSON.parse(error.message);
          return {
            success: false,
            message: errorData.message || error.message,
            userHasPurchased: errorData.userHasPurchased
          };
        } catch {
          return { success: false, message: error.message };
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  checkUserPurchase: async (userId: string): Promise<{ hasPurchased: boolean }> => {
    const response = await makeRequest<{ success: boolean; data: { hasPurchased: boolean } }>(`/flash-sale/user/${userId}/purchase`);
    return response.data;
  },

  getStats: async (): Promise<{ totalPurchases: number; remainingStock: number; uniqueUsers: number }> => {
    const response = await makeRequest<{ success: boolean; data: { totalPurchases: number; remainingStock: number; uniqueUsers: number } }>('/flash-sale/stats');
    return response.data;
  }
};