/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, Category, Order, Memory, User, Offer, CartItem, AppNotification } from '../types.js';
import toast from 'react-hot-toast';

interface FoodieContextProps {
  // Data lists
  menuItems: MenuItem[];
  categories: Category[];
  offers: Offer[];
  memories: Memory[];
  orders: Order[];
  notifications: AppNotification[];
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  promoDiscount: number;
  processingFee: number;
  grandTotal: number;
  
  // Navigation / Filter
  currentScreen: string; // 'home' | 'categories' | 'explore' | 'search' | 'cart' | 'confirmation' | 'notifications' | 'admin'
  setScreen: (screen: string) => void;
  selectedCategoryName: string;
  setSelectedCategoryName: (name: string) => void;
  tableNumber: string;
  
  // Custom filter types
  vegOnly: boolean;
  setVegOnly: (veg: boolean) => void;
  
  // User/Auth
  currentUser: User | null;
  loginGoogle: (email: string, name: string) => void;
  logoutGoogle: () => void;
  
  // Actions
  refreshAll: () => Promise<void>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, change: number) => void;
  clearCart: () => void;
  placeOrder: (name: string, phone: string) => Promise<Order | null>;
  submitMemory: (photoUrl: string) => Promise<boolean>;
  
  // Last placed order for tracking
  lastPlacedOrder: Order | null;
  
  // Search history
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const FoodieContext = createContext<FoodieContextProps | undefined>(undefined);

export function FoodieProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      text: 'Welcome to Urban Eatery! Scan QR on table & order your favorite dishes instantly.',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);
  
  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI routing & filters
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('3'); // Defaults to table 3
  
  // User Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Order placed
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  
  // Search History
  const [searchHistory, setSearchHistory] = useState<string[]>(['Momo', 'Burger', 'Paneer', 'Pizza']);

  // Read URL query parameter for table on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    if (tbl) {
      setTableNumber(tbl);
    }
    
    // Load local storage states
    const savedUser = localStorage.getItem('foodie_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    
    const savedHistory = localStorage.getItem('foodie_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }

    const savedCart = localStorage.getItem('foodie_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Fetch initial data
  const refreshAll = async () => {
    try {
      const [menuRes, catRes, offerRes, memRes, ordersRes] = await Promise.all([
        fetch('/api/menu').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/offers').then(r => r.json()),
        fetch('/api/memories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json())
      ]);
      
      if (Array.isArray(menuRes)) setMenuItems(menuRes);
      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(offerRes)) setOffers(offerRes);
      if (Array.isArray(memRes)) setMemories(memRes);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
    } catch (err) {
      console.error("Error refreshing Foodie data:", err);
    }
  };

  useEffect(() => {
    refreshAll();
    
    // Core polling logic for orders: Poll orders every 4 seconds to get admin status confirmation!
    const timer = setInterval(() => {
      fetch('/api/orders')
        .then(r => r.json())
        .then(res => {
          if (Array.isArray(res)) {
            setOrders(res);
          }
        })
        .catch(err => console.error("Poll err:", err));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('foodie_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle active status notifications updates from state orders
  useEffect(() => {
    if (lastPlacedOrder) {
      const liveOrder = orders.find(o => o.id === lastPlacedOrder.id);
      if (liveOrder && liveOrder.status !== lastPlacedOrder.status) {
        // Status updated!
        let msg = '';
        if (liveOrder.status === 'confirmed') {
          msg = '🍽️ Your order has been confirmed — ready in ~20 mins';
        } else if (liveOrder.status === 'served') {
          msg = '🎉 Enjoy your meal! Your order has been served on Table ' + liveOrder.tableNumber;
        }
        
        if (msg) {
          toast.success(msg, { duration: 6000, position: 'top-center' });
          setNotifications(prev => [
            {
              id: `notif-${Date.now()}`,
              text: msg,
              timestamp: new Date().toISOString(),
              read: false
            },
            ...prev
          ]);
        }
        setLastPlacedOrder(liveOrder);
      }
    }
  }, [orders, lastPlacedOrder]);

  const setScreen = (sc: string) => {
    setCurrentScreen(sc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginGoogle = (email: string, name: string) => {
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    ];
    const profilePic = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    const usr: User = {
      googleId: `g-${Date.now()}`,
      email,
      name,
      profilePic
    };
    setCurrentUser(usr);
    localStorage.setItem('foodie_user', JSON.stringify(usr));
    toast.success(`Logged in as ${name}! Check 'My Memories' section.`, { position: 'bottom-center' });
  };

  const logoutGoogle = () => {
    setCurrentUser(null);
    localStorage.removeItem('foodie_user');
    toast.success('Logged out successfully.', { position: 'bottom-center' });
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        toast.success(`Increased ${item.name} quantity!`, { duration: 1500, icon: '🍕' });
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`Added ${item.name} to Cart`, { duration: 1500, icon: '🛒' });
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.menuItem.id === itemId);
      if (item) {
        toast.error(`Removed ${item.menuItem.name} from Cart`, { duration: 1500 });
      }
      return prev.filter(i => i.menuItem.id !== itemId);
    });
  };

  const updateCartQty = (itemId: string, change: number) => {
    setCart(prev => {
      const target = prev.find(i => i.menuItem.id === itemId);
      if (!target) return prev;
      
      const newQty = target.quantity + change;
      if (newQty <= 0) {
        toast.error(`Removed ${target.menuItem.name} from Cart`);
        return prev.filter(i => i.menuItem.id !== itemId);
      }
      return prev.map(i => i.menuItem.id === itemId ? { ...i, quantity: newQty } : i);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('foodie_cart');
  };

  const placeOrder = async (name: string, phone: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          customerName: name,
          phone,
          items: cart,
          totalAmount: grandTotal,
          fcmToken: `fcm-${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setLastPlacedOrder(data.order);
        
        // Add local confirmation notification
        const welcomeText = `🛒 Order successfully placed! Cooking started on Table no ${tableNumber}! Status: Pending`;
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            text: welcomeText,
            timestamp: new Date().toISOString(),
            read: false
          },
          ...prev
        ]);
        
        clearCart();
        return data.order;
      } else {
        toast.error(data.error || 'Failed to place order');
        return null;
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error. Failed to place order');
      return null;
    }
  };

  const submitMemory = async (photoUrl: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Auth required to upload memories');
      return false;
    }
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.googleId,
          userEmail: currentUser.email,
          userName: currentUser.name,
          photoUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.memory?.isApproved) {
          toast.success('Gourmet memory published directly to live wall! ✓', { duration: 5000 });
        } else {
          toast.success('Photo uploaded! Awaiting Admin approval in moderation queue.', { duration: 5000 });
        }
        refreshAll();
        return true;
      } else {
        toast.error(data.error || 'Failed to upload photo memory');
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error during upload');
      return false;
    }
  };

  const addSearchHistory = (q: string) => {
    setSearchHistory(prev => {
      const list = [q, ...prev.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
      localStorage.setItem('foodie_search_history', JSON.stringify(list));
      return list;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('foodie_search_history');
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const processingFee = 0; // Processing Fee: Free
  const promoDiscount = cartSubtotal > 300 ? 40 : 0; // ₹40 discount on orders above ₹300
  const grandTotal = Math.max(0, cartSubtotal - promoDiscount);

  return (
    <FoodieContext.Provider value={{
      menuItems,
      categories,
      offers,
      memories,
      orders,
      notifications,
      cart,
      cartCount,
      cartTotal: cartSubtotal,
      promoDiscount,
      processingFee,
      grandTotal,
      currentScreen,
      setScreen,
      selectedCategoryName,
      setSelectedCategoryName,
      vegOnly,
      setVegOnly,
      tableNumber,
      currentUser,
      loginGoogle,
      logoutGoogle,
      refreshAll,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      placeOrder,
      submitMemory,
      lastPlacedOrder,
      searchHistory,
      addSearchHistory,
      clearSearchHistory
    }}>
      {children}
    </FoodieContext.Provider>
  );
}

export function useFoodie() {
  const context = useContext(FoodieContext);
  if (context === undefined) {
    throw new Error('useFoodie must be used inside FoodieProvider');
  }
  return context;
}
