/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChevronLeft, Search, Plus } from 'lucide-react';

export default function ExploreView() {
  const { 
    menuItems, 
    categories, 
    selectedCategoryName, 
    setSelectedCategoryName, 
    setScreen, 
    addToCart,
    vegOnly 
  } = useFoodie();

  // Filter Items
  const filteredItems = menuItems.filter(item => {
    // 1. Category search
    if (selectedCategoryName !== 'All' && item.category !== selectedCategoryName) {
      return false;
    }
    // 2. Veg search
    if (vegOnly && !item.isVeg) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2D2926]">
      
      {/* Search Header Wrapper */}
      <div className="bg-white border-b border-[#EBE6E0] shadow-xs">
        <div className="flex items-center px-4 py-3 space-x-2">
          <button 
            onClick={() => setScreen('home')} 
            className="p-1 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-[#2D2926]" />
          </button>
          <div className="text-sm font-semibold text-[#2D2926] flex-grow text-center font-sans tracking-tight">
            Explore {selectedCategoryName} Dishes
          </div>
          <button 
            onClick={() => setScreen('search')} 
            className="p-2 hover:bg-orange-50 text-brand-orange rounded-full transition cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Horizontal Chip Selector inside header */}
        <div className="flex space-x-2.5 overflow-x-auto px-4 pb-3 pt-1 no-scrollbar-container no-scrollbar">
          <button 
            onClick={() => setSelectedCategoryName('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${selectedCategoryName === 'All' ? 'bg-brand-orange text-white shadow-sm' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
          >
            ✨ All
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategoryName(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${selectedCategoryName === cat.name ? 'bg-brand-orange text-white shadow-sm' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Listings Grid */}
      <div className="px-5 py-4 space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2rem] p-4 shadow-sm border border-[#EBE6E0] flex space-x-4 hover:shadow-md transition"
            >
              {/* Product Info (Left Side) */}
              <div className="flex-grow flex flex-col justify-between max-w-[65%]">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5 animate-pulse-slow">
                    <span className={`w-2 h-2 rounded-full border border-white ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{item.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-950 text-left line-clamp-1">{item.name}</h3>
                  <p className="text-[10px] text-gray-400 font-light text-left leading-relaxed mt-1 line-clamp-2">
                    {item.description || "Freshly sourced gourmet ingredients prepared carefully with standard chef expertise."}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-brand-orange">₹{item.price}</span>
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-gray-500">
                    <span>⭐ {item.rating}</span>
                    <span className="text-gray-300">|</span>
                    <span>⏱️ {item.prepTime}</span>
                  </div>
                </div>
              </div>

              {/* Product Photo & Action (Right Side) */}
              <div className="flex-shrink-0 relative w-[30%] min-w-[100px] h-28">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover rounded-2xl border border-gray-50" 
                  alt={item.name} 
                />
                
                {/* Float ADD button over bottom boundary of card */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex items-center space-x-1 bg-white hover:bg-orange-50 border border-brand-orange/40 hover:border-brand-orange text-brand-orange font-extrabold text-[10px] px-4 py-1.5 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <span className="text-4xl mb-2">🍜</span>
            <h4 className="text-sm font-bold text-gray-850">No Dishes Available</h4>
            <p className="text-xs text-gray-400 max-w-[70%] mt-1">We couldn't find any {vegOnly ? 'Veg ' : ''}dishes in the {selectedCategoryName} category index right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
