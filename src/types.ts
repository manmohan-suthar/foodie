/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  description: string;
  isAvailable: boolean;
  rating: number;
  prepTime: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  type: 'veg' | 'nonveg' | 'both';
}

export type OrderStatus = 'pending' | 'confirmed' | 'served';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  fcmToken?: string;
  timestamp: string;
  isManual?: boolean;
  guestCount?: number;
  specialInstructions?: string;
  discountPercent?: number;
  paymentMode?: 'cash' | 'card' | 'upi';
  paymentRemark?: string;
  isPaid?: boolean;
}

export interface Memory {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  photoUrl: string; // Base64 data-url or static link
  isApproved: boolean;
  uploadedAt: string;
}

export interface User {
  googleId: string;
  email: string;
  name: string;
  profilePic: string;
}

export interface Offer {
  id: string;
  title: string;
  discountText: string;
  image: string;
  isActive: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface AppNotification {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
}
