
export interface User {
  id: string;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalStock: number;
}

export enum SaleStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  SOLD_OUT = 'SOLD_OUT',
}

export interface FlashSaleState {
  product: Product;
  currentStock: number;
  status: SaleStatus;
  startTime: number;
  endTime: number;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  userHasPurchased?: boolean;
}

export interface NotificationMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}
