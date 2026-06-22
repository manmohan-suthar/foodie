/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { ChevronLeft, X, Plus } from 'lucide-react';

export default function SearchView() {
  const { 
    menuItems, 
    searchHistory, 
    addSearchHistory, 
    clearSearchHistory, 
    setScreen, 
    addToCart 
  } = useFoodie();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Autofocus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter items matching query
  const searchResults = query.trim() === '' ? [] : menuItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleChipClick = (term: string) => {
    setQuery(term);
    addSearchHistory(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      addSearchHistory(query);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 text-[#2D2926]">
      
      {/* Search Header */}
      <div className="bg-white px-4 py-3.5 border-b border-[#EBE6E0] flex items-center space-x-2">
        <button 
          onClick={() => setScreen('home')} 
          className="p-1 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#2D2926]" />
        </button>
        
        {/* Real Search Bar input */}
        <div className="bg-[#F4F1EE] flex-grow rounded-2xl flex items-center px-3.5 py-2 border border-transparent focus-within:border-brand-orange focus-within:bg-white transition">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search &apos;biryani&apos;, pizza, momos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-sm w-full outline-none text-[#2D2926] font-sans"
          />
          {query && (
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recently Searched Chips */}
      <div className="px-5 py-4">
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recently Searched</h3>
              <button 
                onClick={clearSearchHistory} 
                className="text-[10px] text-gray-400 hover:text-brand-orange font-semibold"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, i) => (
                <button 
                  key={i}
                  onClick={() => handleChipClick(term)}
                  className="bg-white hover:bg-orange-50 border border-gray-200 hover:border-brand-orange rounded-full px-4 py-2 text-xs font-medium text-gray-700 transition cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Search Results */}
        {query.trim() !== '' ? (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Matching Results</h3>
            {searchResults.length > 0 ? (
              <div className="space-y-3.5">
                {searchResults.map(item => (
                  <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-gray-100/60 shadow-xs flex justify-between items-center">
                    <div className="flex items-center space-x-3 max-w-[70%]">
                      <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt={item.name} />
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-brand-orange font-extrabold">₹{item.price}</span>
                          <span className="text-[9px] text-gray-400">★ {item.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
                    >
                      ADD
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl mb-2">🔍</span>
                <p className="text-xs text-gray-400">No match found for "{query}"</p>
              </div>
            )}
          </div>
        ) : (
          /* Popular Recipes Grid (when search box is empty) */
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">Popular Recipes</h3>
            <div className="grid grid-cols-2 gap-4">
              {menuItems.slice(2, 6).map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-3 shadow-xs border border-gray-100 flex flex-col justify-between">
                  <div className="relative">
                    <img src={item.image} className="w-full h-24 object-cover rounded-2xl" alt={item.name} />
                    <span className={`absolute top-2 left-2 w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <div className="mt-2.5 text-left">
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                    <div className="flex items-center justify-between mt-2 pt-0.5">
                      <span className="text-xs font-extrabold text-brand-orange">₹{item.price}</span>
                      <button 
                        onClick={() => {
                          addSearchHistory(item.name);
                          addToCart(item);
                        }}
                        className="bg-orange-50 hover:bg-brand-orange hover:text-white border border-brand-orange/30 text-brand-orange text-[10px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
