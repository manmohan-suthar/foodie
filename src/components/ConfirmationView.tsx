/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChefHat, Check, ChevronRight, Bell, Timer } from 'lucide-react';

export default function ConfirmationView() {
  const { lastPlacedOrder, setScreen, orders } = useFoodie();
  
  // Find current order state
  const currentOrder = lastPlacedOrder ? orders.find(o => o.id === lastPlacedOrder.id) : null;
  const status = currentOrder?.status || 'pending';

  // countdown starts at 20 minutes (1200 seconds)
  const [timeLeft, setTimeLeft] = useState(1200);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2D2926] flex flex-col justify-between font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE6E0] bg-[#FDFBF7]">
        <span className="text-sm font-bold bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">Table {currentOrder?.tableNumber || '3'}</span>
        <h2 className="text-sm font-black text-[#2D2926]">Dine-In Status</h2>
        <button 
          onClick={() => setScreen('notifications')} 
          className="p-1.5 hover:bg-[#F4F1EE] rounded-full transition relative cursor-pointer"
        >
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
          <Bell className="w-5 h-5 text-[#2D2926]" />
        </button>
      </div>

      {/* Main Success Area */}
      <div className="flex-grow px-6 flex flex-col items-center justify-center py-10">
        
        {/* Animated Checkmark Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse-slow">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Check className="w-8 h-8 text-white stroke-[3.5]" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-950 text-xs shadow">🔥</span>
        </div>

        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight text-center">Order Successfully Placed!</h1>
        <p className="text-xs text-gray-400 text-center max-w-[85%] mt-1.5 leading-relaxed">
          Your chef is now preparing the delicacies for <span className="font-bold text-gray-700">{currentOrder?.customerName || 'Guest'}</span> on physical Table {currentOrder?.tableNumber || '3'}.
        </p>

        {/* Real-time Order Timeline Progress bar */}
        <div className="w-full max-w-xs mt-8 bg-white border border-[#EBE6E0] rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kitchen Status</span>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
              status === 'pending' ? 'bg-amber-100 text-amber-700' :
              status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {status === 'pending' ? 'Pending Approval' :
               status === 'confirmed' ? 'Dine cooking' :
               'Served ✅'}
            </span>
          </div>

          {/* Stepper tracker bar */}
          <div className="relative flex justify-between items-center text-center">
            {/* Background line */}
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 -z-10">
              <div className={`h-full bg-brand-orange transition-all duration-1000 ${
                status === 'pending' ? 'w-0' :
                status === 'confirmed' ? 'w-1/2' :
                'w-full'
              }`}></div>
            </div>

            {/* Step 1: Placed */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold shadow-md">
                1
              </div>
              <span className="text-[9px] font-bold text-gray-500 mt-1.5">Placed</span>
            </div>

            {/* Step 2: Confirmed */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-500 ${
                status !== 'pending' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {status !== 'pending' ? '✓' : '2'}
              </div>
              <span className={`text-[9px] font-bold mt-1.5 ${
                status !== 'pending' ? 'text-gray-800' : 'text-gray-400'
              }`}>Confirmed</span>
            </div>

            {/* Step 3: Served */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-500 ${
                status === 'served' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {status === 'served' ? '✓' : '3'}
              </div>
              <span className={`text-[9px] font-bold mt-1.5 ${
                status === 'served' ? 'text-gray-800' : 'text-gray-400'
              }`}>Served</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center space-x-1.5">
              <Timer className="w-4 h-4 text-brand-orange" />
              <span>Dine-In ETA</span>
            </span>
            <span className="font-mono font-bold text-gray-900">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Simulation Notice for testers */}
        <div className="mt-8 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex items-start space-x-2.5 max-w-xs">
          <ChefHat className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 font-medium leading-relaxed text-left">
            <strong className="block mb-0.5">Admin Test Shortcut:</strong> Go to the menu & navigate to <span className="font-bold underline text-brand-orange cursor-pointer" onClick={() => setScreen('admin')}>/admin Dashboard</span> to instantly click "Confirm Order" to test real-time in-app pushes!
          </p>
        </div>

      </div>

      {/* Footer Go Home button */}
      <div className="px-6 pb-6">
        <button 
          onClick={() => setScreen('home')}
          className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl font-bold text-sm tracking-tight transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>Continue dining</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
