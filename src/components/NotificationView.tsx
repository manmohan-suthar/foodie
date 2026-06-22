/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChevronLeft, Bell, BellOff, MapPin, Clock } from 'lucide-react';

export default function NotificationView() {
  const { notifications, setScreen, tableNumber } = useFoodie();

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2D2926] font-sans">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-4 border-b border-[#EBE6E0] flex items-center shadow-xs">
        <button 
          onClick={() => setScreen('home')} 
          className="p-1 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#2D2926]" />
        </button>
        <h1 className="flex-grow text-center text-base font-bold text-[#2D2926] -ml-8">Notifications</h1>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Alerts History</span>
          <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>Table {tableNumber}</span>
          </span>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3.5">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className="bg-white rounded-3xl p-4 border border-gray-100/80 shadow-xs text-left select-none"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-full bg-orange-50 border border-brand-orange/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-brand-orange select-none" />
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <p className="text-xs font-semibold text-gray-850 leading-relaxed select-none">{notif.text}</p>
                    <div className="flex items-center space-x-1 text-[9px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-gray-100">
            <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Alerts Recorded</h3>
            <p className="text-xs text-gray-400 max-w-[80%] mx-auto mt-1">Order confirmations, timing updates and live kitchen pings will reflect here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
