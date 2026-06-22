/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChevronLeft, Trash2, ShieldCheck, User, Phone, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartView() {
  const {
    cart,
    cartTotal,
    cartCount,
    promoDiscount,
    processingFee,
    grandTotal,
    setScreen,
    updateCartQty,
    removeFromCart,
    placeOrder
  } = useFoodie();

  // Checkout inputs
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Load name and phone from local storage if previously used
  useEffect(() => {
    const savedName = localStorage.getItem('foodie_customer_name');
    const savedPhone = localStorage.getItem('foodie_customer_phone');
    if (savedName) setCustomerName(savedName);
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10); // numerical only, max 10 digits
    setPhoneNumber(val);
    if (val.length > 0 && val.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handlePlaceOrderClick = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (phoneNumber.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      toast.error('10-digit phone number is required');
      return;
    }

    // Save details locally for easy next session
    localStorage.setItem('foodie_customer_name', customerName);
    localStorage.setItem('foodie_customer_phone', phoneNumber);

    toast.loading('Sending your order to Urban Eatery kitchen...', { id: 'place-order-toast' });
    
    const order = await placeOrder(customerName, phoneNumber);
    if (order) {
      toast.dismiss('place-order-toast');
      toast.success('Cook has received your order!', { duration: 3000 });
      setScreen('confirmation');
    } else {
      toast.dismiss('place-order-toast');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-28 text-[#2D2926]">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-4 border-b border-[#EBE6E0] flex items-center shadow-xs">
        <button 
          onClick={() => setScreen('home')} 
          className="p-1 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#2D2926]" />
        </button>
        <h1 className="flex-grow text-center text-base font-bold text-[#2D2926] -ml-8 font-sans">Checkout Cart</h1>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Cart items list */}
        {cart.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Culinary Choices</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.menuItem.id}
                  className="bg-white rounded-3xl p-3.5 border border-gray-100 flex space-x-3.5 shadow-xs"
                >
                  <img src={item.menuItem.image} className="w-16 h-16 object-cover rounded-2xl flex-shrink-0" alt={item.menuItem.name} />
                  
                  <div className="flex-grow flex flex-col justify-between text-left min-w-0">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-gray-900 truncate pr-2">{item.menuItem.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="text-gray-300 hover:text-red-500 p-0.5 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[10px] text-brand-orange font-extrabold block mt-0.5">₹{item.menuItem.price}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-450 font-medium">Sub: ₹{item.menuItem.price * item.quantity}</span>
                      
                      <div className="bg-gray-50 border border-gray-150 rounded-full flex items-center overflow-hidden">
                        <button 
                          onClick={() => updateCartQty(item.menuItem.id, -1)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.menuItem.id, 1)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information inputs */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs text-left space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Table Dining Information</h3>
              
              {/* Table code display */}
              <div className="bg-orange-50/50 border border-brand-orange/10 p-3 rounded-2xl flex justify-between items-center mb-1">
                <span className="text-xs text-gray-650 font-medium">Active Dining Location</span>
                <span className="text-xs font-bold text-brand-orange bg-white px-3 py-1 rounded-full shadow-xs border border-brand-orange/10">Table {localStorage.getItem('foodie_table') || '3'}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Your Name</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter full name for order announcement" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-brand-orange-hover focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Phone Number (10 digits)</span>
                </label>
                <input 
                  type="tel" 
                  placeholder="E.g., 9876543210" 
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full bg-[#F4F1EE] border border-[#EBE6E0] text-[#2D2926] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-brand-orange-hover focus:bg-white transition"
                  required
                />
                {phoneError && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Payment Summary section */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs text-left space-y-3.5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Summary</h2>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Total Items ({cartCount})</span>
                <span className="font-bold text-gray-800">₹{cartTotal}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Processing Fee</span>
                <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                  <span>Discount (Cart &gt; ₹300)</span>
                  <span>- ₹{promoDiscount}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total Bill</span>
                <span className="text-lg font-black text-brand-orange">₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button 
              onClick={handlePlaceOrderClick}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl font-bold text-sm tracking-tight transition shadow-lg hover:shadow-orange-200 cursor-pointer"
            >
              Place Order (₹{grandTotal})
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Table authenticated checkouts are 100% locally secure.</span>
            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-20 bg-white rounded-3xl p-8 shadow-xs border border-gray-100 flex flex-col items-center">
            <span className="text-5xl mb-3">🍳</span>
            <h3 className="text-sm font-bold text-gray-850">Your Cart is Empty</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[70%] leading-relaxed">Browse our delicious dine-in specials and tap "ADD" to select items.</p>
            <button 
              onClick={() => setScreen('home')}
              className="mt-6 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-6 rounded-full shadow transition-all cursor-pointer"
            >
              Explore Recipes
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
