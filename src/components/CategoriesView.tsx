/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChevronLeft } from 'lucide-react';

export default function CategoriesView() {
  const { categories, setScreen, setSelectedCategoryName } = useFoodie();

  const handleSelectCategory = (name: string) => {
    setSelectedCategoryName(name);
    setScreen('explore');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2D2926] font-sans">
      {/* Top Header */}
      <div className="flex items-center px-4 py-4 border-b border-[#EBE6E0]">
        <button 
          onClick={() => setScreen('home')} 
          className="p-1.5 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#2D2926]" />
        </button>
        <h1 className="flex-grow text-center text-base font-bold text-[#2D2926] -ml-8">More Categories</h1>
      </div>

      {/* Grid Layout of Categories */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-y-6 gap-x-4">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => handleSelectCategory(cat.name)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-sm group-hover:shadow-md border border-gray-100/80 transition-all duration-300 group-hover:scale-105 outline-2 outline-offset-2 outline-transparent group-hover:outline-brand-orange">
                <img 
                  src={cat.image} 
                  className="w-full h-full object-cover" 
                  alt={cat.name} 
                />
              </div>
              <span className="text-xs font-bold text-gray-700 mt-2 text-center group-hover:text-brand-orange transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
