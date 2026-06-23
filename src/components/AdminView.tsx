/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { 
  Lock, CheckCircle2, ShoppingBag, Plus, Trash2, Edit2, 
  Sparkles, Camera, Users, History, ArrowLeft, LogOut, Search, Filter, RefreshCw, QrCode, PlusCircle,
  CreditCard, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuItem, Category, Order, Memory } from '../types.js';
import QRCodeTab from './QRCodeTab.js';
import ManualOrderTab from './ManualOrderTab.js';

export default function AdminView() {
  const { 
    menuItems, 
    categories, 
    offers, 
    orders, 
    refreshAll, 
    setScreen 
  } = useFoodie();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'offers' | 'memories' | 'history' | 'qr' | 'book'>('orders');

  // Load Admin Token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('foodie_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('foodie_admin_token', data.token);
        toast.success('Admin Session Activated');
        refreshAll();
      } else {
        toast.error('Invalid Credentials');
      }
    } catch (err) {
      toast.error('Connection Failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('foodie_admin_token');
    toast.success('Session closed');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-6">
        <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-800 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-4 border border-brand-orange/30">
            <Lock className="w-8 h-8 text-brand-orange" />
          </div>
          <h1 className="text-xl font-black mb-1 font-sans">Kitchen &amp; Moderation Gate</h1>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">Enter credentials to unlock inventory controls, memories moderation, and tables ordering.</p>
          
          <div className="bg-orange-500/10 border border-brand-orange/20 rounded-2xl p-3 text-left mb-6">
            <p className="text-[10px] text-brand-orange font-bold uppercase tracking-wider mb-1">Testing Information</p>
            <p className="text-[10px] text-gray-300">Evaluating account password is <span className="text-yellow-400 font-bold">admin123</span> or <span className="text-yellow-400 font-bold">admin</span>.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-orange transition-all"
                required
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-950/30 transition-all cursor-pointer"
            >
              Verify &amp; Unlock
            </button>
          </form>

          <button 
            onClick={() => setScreen('home')}
            className="mt-6 text-xs text-gray-400 hover:text-brand-orange transition flex items-center justify-center space-x-1 w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Diner Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row text-[#2D2926] font-sans">
      
      {/* MOBILE HEADER (Only visible on mobile/tablets < lg) */}
      <div className="lg:hidden bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-3">
          <span className="bg-brand-orange text-white w-8 h-8 rounded-xl font-black flex items-center justify-center text-sm">U</span>
          <div>
            <h1 className="text-xs font-black tracking-tight flex items-center space-x-1.5">
              <span>Urban Control Center</span>
              <span className="text-[8px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none">Live</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={refreshAll} 
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition"
            title="Refresh tables data"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
          <button 
            onClick={() => setScreen('home')}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition"
            title="Go to diner view"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition"
            title="Relock Panel Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE TAB LIST (Only visible on mobile/tablets < lg) */}
      <div className="lg:hidden bg-white border-b border-[#EBE6E0] flex overflow-x-auto no-scrollbar px-4 py-2 space-x-2 shadow-xs">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'orders' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Active Orders ({orders.filter(o => o.status !== 'served').length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('book')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'book' ? 'bg-brand-orange text-white font-extrabold' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Book Walk-In</span>
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'menu' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inventory Menu ({menuItems.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'categories' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Categories</span>
        </button>
        <button 
          onClick={() => setActiveTab('offers')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'offers' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Promo Offer</span>
        </button>
        <button 
          onClick={() => setActiveTab('memories')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'memories' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Moderation queue</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'history' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Past Orders Log</span>
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`py-2 px-3.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${activeTab === 'qr' ? 'bg-brand-orange text-white' : 'bg-[#F4F1EE] text-[#2D2926]'}`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Table QR Generator</span>
        </button>
      </div>

      {/* DESKTOP SIDEBAR (Visible on lg screens and wider) */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#121110] text-[#E0E0E0] h-screen sticky top-0 border-r border-[#2C2926]/40 select-none justify-between overflow-y-auto shrink-0 z-30 transition-all duration-300">
        
        {/* Upper Sidebar Column */}
        <div className="p-6 space-y-7">
          
          {/* Brand/Logo Header */}
          <div className="flex items-center space-x-3 pb-5 border-b border-[#2C2926]/40">
            <span className="bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] text-white w-10 h-10 rounded-2xl font-black flex items-center justify-center text-lg shadow-md shadow-brand-orange/15 select-none transform hover:scale-105 transition-all duration-300">
              U
            </span>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-tight">Urban Control</h2>
              <div className="flex items-center mt-1 space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-[#A39E99] font-extrabold uppercase tracking-widest">Merchant Core</span>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Options */}
          <div className="space-y-2">
            <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest px-3.5 mb-3">
              Management Suite
            </p>
            
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 flex-shrink-0 ${activeTab === 'orders' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Active Orders</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
                {orders.filter(o => o.status !== 'served').length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('book')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'book' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <PlusCircle className={`w-4 h-4 flex-shrink-0 ${activeTab === 'book' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Book Walk-In Order</span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider uppercase leading-none ${activeTab === 'book' ? 'bg-white text-brand-orange shadow-xs' : 'bg-[#FF6B00] text-white animate-pulse'}`}>
                NEW
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'menu' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${activeTab === 'menu' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Inventory Menu</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${activeTab === 'menu' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
                {menuItems.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'categories' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <Filter className={`w-4 h-4 flex-shrink-0 ${activeTab === 'categories' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Category Folders</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
                {categories.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('offers')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'offers' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${activeTab === 'offers' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Promo Offers</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${activeTab === 'offers' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
                {offers.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('memories')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'memories' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <Camera className={`w-4 h-4 flex-shrink-0 ${activeTab === 'memories' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Memories Moderation</span>
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <History className={`w-4 h-4 flex-shrink-0 ${activeTab === 'history' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Past Orders Log</span>
            </button>

            <button 
              onClick={() => setActiveTab('qr')}
              className={`flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${
                activeTab === 'qr' 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white shadow-md shadow-brand-orange/15 font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
              }`}
            >
              <QrCode className={`w-4 h-4 flex-shrink-0 ${activeTab === 'qr' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-grow text-left">Table QR Generator</span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider uppercase leading-none ${activeTab === 'qr' ? 'bg-white text-brand-orange shadow-xs' : 'bg-[#FF6B00] text-white animate-pulse'}`}>
                NEW
              </span>
            </button>
          </div>
        </div>

        {/* Lower Sidebar Column */}
        <div className="p-6 border-t border-[#2C2926]/40 space-y-4">
          
          <button 
            onClick={refreshAll}
            className="flex items-center space-x-2.5 text-xs font-bold text-gray-400 hover:text-white transition w-full px-3.5 py-2.5 hover:bg-white/[0.03] rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            <span>Sync Live Database</span>
          </button>
          
          <button 
            onClick={() => setScreen('home')}
            className="flex items-center space-x-2.5 text-xs font-bold text-gray-400 hover:text-white transition w-full px-3.5 py-2.5 hover:bg-white/[0.03] rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
            <span>Go to Guest Mode</span>
          </button>

          {/* User Account Segment */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 mt-3">
            <div className="text-left">
              <p className="text-[9px] text-[#A39E99] font-extrabold uppercase tracking-widest">Active Operator</p>
              <p className="text-xs font-black text-gray-200 mt-0.5">Admin Server</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Terminate Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DESKTOP CONTENT AREA */}
      <main className="flex-grow flex flex-col min-h-screen">
        
        {/* TOP STATUS BAR (Hidden on mobile) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-[#EBE6E0]">
          <div className="text-left">
            <h1 className="text-sm font-black text-[#2D2926] uppercase tracking-wider flex items-center space-x-2">
              <span>Merchant Console</span>
              <span className="text-[9px] bg-[#FF6B00]/10 text-brand-orange font-bold px-2 py-0.5 rounded-full">Server Stable</span>
            </h1>
            <p className="text-[10px] text-gray-400 text-left">Live Dine-In analytics, inventory tables and QR requests</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Kitchen Status Logs</span>
              <span className="text-xs font-bold text-emerald-600">Online &amp; Active</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-black text-sm shadow-sm select-none">
              A
            </div>
          </div>
        </header>

        {/* OVERALL STATISTICS SUMMARY GRID */}
        <div className="px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Revenue */}
            <div className="bg-white border border-[#EBE6E0] p-4 rounded-[1.5rem] shadow-xs text-left">
              <span className="text-[9px] lg:text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Total Sales (Served)</span>
              <span className="text-lg lg:text-2xl font-black text-brand-orange mt-1 block font-mono">
                ₹{orders.filter(o => o.status === 'served').reduce((v, o) => v + o.totalAmount, 0)}
              </span>
            </div>

            {/* Stat 2: Active Pipeline */}
            <div className="bg-white border border-[#EBE6E0] p-4 rounded-[1.5rem] shadow-xs text-left">
              <span className="text-[9px] lg:text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Active Orders</span>
              <span className="text-lg lg:text-2xl font-black text-[#2D2926] mt-1 block">
                {orders.filter(o => o.status !== 'served').length} Tables
              </span>
            </div>

            {/* Stat 3: Total Inventory Catalog */}
            <div className="bg-white border border-[#EBE6E0] p-4 rounded-[1.5rem] shadow-xs text-left">
              <span className="text-[9px] lg:text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Inventory Recipes</span>
              <span className="text-lg lg:text-2xl font-black text-[#2D2926] mt-1 block">
                {menuItems.length} Dishes
              </span>
            </div>

            {/* Stat 4: Pending Sales Pipeline */}
            <div className="bg-white border border-[#EBE6E0] p-4 rounded-[1.5rem] shadow-xs text-left">
              <span className="text-[9px] lg:text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">Pending Sales Value</span>
              <span className="text-lg lg:text-2xl font-black text-[#2D2926] mt-1 block font-mono">
                ₹{orders.filter(o => o.status !== 'served').reduce((v, o) => v + o.totalAmount, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE TAB CONTENT INNER PANEL */}
        <div className="flex-1 px-6 lg:px-8 py-8 w-full">
          
          {/* TAB 1: ACTIVE LIVE ORDERS PIPELINE */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div>
                  <h2 className="text-lg font-black text-[#2D2926] leading-tight">Kitchen order board</h2>
                  <p className="text-xs text-gray-400">Manage real-time incoming orders by kitchen status</p>
                </div>
              </div>

              {orders.filter(o => o.status !== 'served').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {orders.filter(o => o.status !== 'served').map(order => (
                    <OrderCard key={order.id} order={order} reload={refreshAll} />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white border border-[#EBE6E0] p-16 rounded-[2.5rem] flex flex-col items-center">
                  <span className="text-5xl mb-4">🔔</span>
                  <h3 className="text-sm font-bold text-gray-850">All Tables Are Satisfied!</h3>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">Currently there are no active dining room orders in queue. Open Guest Mode to test order inputs.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTORY MENU */}
          {activeTab === 'menu' && (
            <MenuTab />
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <CategoriesTab />
          )}

          {/* TAB 4: OFFERS */}
          {activeTab === 'offers' && (
            <OffersTab />
          )}

          {/* TAB 5: MEMORIES MODERATION */}
          {activeTab === 'memories' && (
            <MemoriesModeratorTab />
          )}

          {/* TAB 6: ORDER HISTORY LOG */}
          {activeTab === 'history' && (
            <HistoryTab />
          )}

          {/* TAB 7: TABLE QR STAND-UP CREATOR */}
          {activeTab === 'qr' && (
            <QRCodeTab />
          )}

          {/* TAB 8: WALK-IN MANUAL ORDER WORKSPACE */}
          {activeTab === 'book' && (
            <ManualOrderTab />
          )}

        </div>

      </main>
    </div>
  );
}

// ------ ORDERS TAB CARD SUBCOMPONENT --------

function OrderCard({ order, reload }: { key?: string; order: Order; reload: () => void }) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMode, setPayMode] = useState<'cash' | 'card' | 'upi'>('cash');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStatus = async (status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order Table ${order.tableNumber} status set to ${status}`);
        reload();
      } else {
        toast.error(data.error || 'Failed updating status');
      }
    } catch (err) {
      toast.error('Network Error');
    }
  };

  const handleCheckoutAndServe = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'served',
          paymentMode: payMode,
          paymentRemark: remark,
          isPaid: true
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Table ${order.tableNumber} Checkout Success! Bill settled via ${payMode.toUpperCase()}`);
        setShowPayModal(false);
        reload();
      } else {
        toast.error(data.error || 'Failed to record payment');
      }
    } catch (err) {
      toast.error('Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRecord = async () => {
    if (!window.confirm("Archive or Delete order data permanently?")) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Order removed');
        reload();
      }
    } catch (e) {
      toast.error('Delete error');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-150 text-left shadow-xs flex flex-col justify-between relative">
      <div>
        <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">#{order.id.split('-')[1]}</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <h3 className="text-sm font-bold text-gray-900">{order.customerName}</h3>
              {order.isManual && (
                <span className="text-[8px] bg-[#FF6B00]/10 text-brand-orange border border-brand-orange/20 font-black px-1.5 py-0.5 rounded uppercase leading-none" title="Staff-Booked Order">
                  Staff
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium font-mono">📞 {order.phone}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">Table {order.tableNumber}</span>
            <span className="block text-[9px] text-gray-400 mt-1.5 font-medium">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Ordered items listing */}
        <div className="space-y-2.5 mb-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-gray-750">
              <span className="font-semibold">{item.menuItem.name} <span className="text-gray-400 text-[10px]">x {item.quantity}</span></span>
              <span className="font-mono text-gray-500 font-bold">₹{item.menuItem.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Saved payment credentials detail if already served/paid */}
        {order.status === 'served' && (
          <div className="bg-emerald-50/30 border border-emerald-500/10 p-3 rounded-2xl mb-4 text-[11px] text-gray-600 space-y-1">
            <div className="flex justify-between items-center text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider border-b border-emerald-500/10 pb-1.5 mb-1">
              <span className="flex items-center space-x-1">
                <span>Settled Bill Receipt ✓</span>
              </span>
              <span className="bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">PAID</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Settled Mode:</span>
              <span className="font-bold text-gray-800 uppercase font-mono">{order.paymentMode || 'cash'}</span>
            </div>
            {order.paymentRemark && (
              <div className="flex justify-between font-medium truncate italic text-gray-400">
                <span>Remark:</span>
                <span>"{order.paymentRemark}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Grand Total</span>
          <span className="text-base font-black text-brand-orange">₹{order.totalAmount}</span>
        </div>

        {/* Action Controls */}
        <div className="flex space-x-2 w-full sm:w-auto">
          {order.status === 'pending' && (
            <button 
              onClick={() => updateStatus('confirmed')}
              className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-[11px] font-bold rounded-2xl tracking-wide transition uppercase shadow-sm cursor-pointer"
            >
              Confirm Order
            </button>
          )}
          {order.status === 'confirmed' && (
            <button 
              onClick={() => setShowPayModal(true)}
              className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-2xl tracking-wide transition uppercase shadow-sm cursor-pointer"
            >
              Serve & Bill Pay
            </button>
          )}
          {order.status === 'served' && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">Served & Settled ✓</span>
          )}

          <button 
            onClick={deleteRecord}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER BILL SETTLEMENT MODAL OVERLAY */}
      {showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-6 shadow-2xl border border-gray-100 text-left space-y-4 animate-scaleUp">
            
            {/* Header */}
            <div>
              <span className="text-[9px] bg-[#FF6B00]/10 text-brand-orange border border-brand-orange/20 font-black px-2 py-0.5 rounded-sm uppercase tracking-wider w-fit mb-1 leading-none inline-block">
                Billing Service
              </span>
              <h3 className="text-sm font-black text-gray-900 leading-tight">
                Bill Settlement — Table {order.tableNumber}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                Record diner payment before marking order served
              </p>
            </div>

            {/* Receipt Summary Info Box */}
            <div className="bg-[#FAF9F7] p-3 rounded-xl border border-gray-150 space-y-1 text-[11px] text-[#55504A]">
              <div className="flex justify-between">
                <span>Diner Profile:</span>
                <strong className="text-gray-800">{order.customerName}</strong>
              </div>
              <div className="flex justify-between font-mono text-[10px]">
                <span>Contact Number:</span>
                <span>{order.phone || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#2C2926]/5 font-black text-gray-800">
                <span>Net Payable Balance:</span>
                <span className="text-brand-orange text-xs font-sans">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Method options grid */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Settlement Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'cash', label: 'Cash', icon: <DollarSign className="w-3.5 h-3.5" /> },
                  { key: 'card', label: 'Card / POS', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { key: 'upi', label: 'UPI / QR', icon: <Sparkles className="w-3.5 h-3.5 text-brand-orange text-center" /> }
                ].map(pay => (
                  <button
                    key={pay.key}
                    type="button"
                    onClick={() => setPayMode(pay.key as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer select-none ${
                      payMode === pay.key 
                        ? 'border-brand-orange bg-brand-orange/5 text-brand-orange font-bold text-[11px]' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px]'
                    }`}
                  >
                    {pay.icon}
                    <span className="mt-1 font-bold leading-none">{pay.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remark Notes input */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Billing Remarks / Reference ID
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g. Tip ₹20, exact amount, UPI transaction ref..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-[#FAF9F7] text-gray-800 outline-none focus:ring-1 focus:ring-brand-orange/30 focus:bg-white font-semibold placeholder-gray-400"
              />
            </div>

            {/* Control buttons */}
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="w-1/3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer transition text-center"
              >
                No, Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckoutAndServe}
                className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>Settle & Kitchen Serve ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ------ MENU INVENTORY MANAGEMENT PANEL --------

function MenuTab() {
  const { menuItems, categories, refreshAll } = useFoodie();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [galleryImages, setGalleryImages] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('15 Min');

  // Load editing state
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image);
    setGalleryImages((item.galleryImages || []).join('\n'));
    setIsVeg(item.isVeg);
    setDescription(item.description);
    setPrepTime(item.prepTime);
    setShowAddForm(true);
  };

  const handleReset = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('');
    setImage('');
    setGalleryImages('');
    setIsVeg(true);
    setDescription('');
    setPrepTime('15 Min');
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category || !image) {
      toast.error('Please specify Name, Price, Category and Photo Url');
      return;
    }

    const payload: MenuItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      name,
      price: parseFloat(price),
      category,
      image,
      galleryImages: galleryImages
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean),
      isVeg,
      description,
      isAvailable: true,
      rating: editingItem?.rating || 4.5,
      prepTime
    };

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Dishes updated successfully!' : 'New recipe cataloged!');
        handleReset();
        refreshAll();
      }
    } catch (e) {
      toast.error('Transmission fail');
    }
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList) return;

    const files: File[] = [];
    for (let index = 0; index < fileList.length; index += 1) {
      const file = fileList.item(index);
      if (file) files.push(file);
    }
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((uploadedImages) => {
        setGalleryImages((prev) => {
          const existing = prev
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean);
          return [...existing, ...uploadedImages].join('\n');
        });
        toast.success(`${uploadedImages.length} gallery photo${uploadedImages.length > 1 ? 's' : ''} added`);
      })
      .catch(() => toast.error('Unable to upload selected photos'));

    e.target.value = '';
  };

  const galleryPreviewImages = galleryImages
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

  const removeGalleryImage = (targetIndex: number) => {
    setGalleryImages((prev) =>
      prev
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean)
        .filter((_, index) => index !== targetIndex)
        .join('\n'),
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove item permanently from inventory?")) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Dishes catalog removed');
        refreshAll();
      }
    } catch (e) {
      toast.error('Fail');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-none">Kitchen culinary catalog</h2>
          <p className="text-xs text-gray-400 mt-1">Manage food items available for scan ordering menus</p>
        </div>
        <button 
          onClick={() => {
            if (showAddForm) handleReset();
            else setShowAddForm(true);
          }}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1 shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Editor' : 'Register New Recipe'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] border border-gray-150 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="text-sm font-black text-gray-900 col-span-full border-b border-gray-50 pb-2 mb-2">
            {editingItem ? 'Edit Dishes Specifications' : 'Catalog New Gourmet Special'}
          </h3>
          
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Dishes Name</label>
            <input 
              type="text" 
              placeholder="E.g., Chicken Tikka Kebab" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Price (₹)</label>
            <input 
              type="number" 
              placeholder="140" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Category Group</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required
            >
              <option value="">-- Choose Category --</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Gourmet Prep Time Estimation</label>
            <input 
              type="text" 
              placeholder="E.g., 20 Min" 
              value={prepTime} 
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Food Image URL</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/your-image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">More Food Photos</label>
                <p className="text-[10px] font-semibold text-gray-400">
                  Upload multiple dish photos or paste one image URL per line.
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-1.5 bg-[#2D2926] hover:bg-black text-white px-4 py-2.5 rounded-xl text-[11px] font-black cursor-pointer transition">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              placeholder="Paste one extra image URL per line for customer gallery popup"
              value={galleryImages}
              onChange={(e) => setGalleryImages(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 h-24 focus:outline-none focus:border-brand-orange focus:bg-white transition"
            />
            {galleryPreviewImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {galleryPreviewImages.map((photo, index) => (
                  <div key={`${photo}-${index}`} className="relative h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-150">
                    <img src={photo} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/95 hover:bg-red-50 text-red-500 rounded-lg shadow-xs transition"
                      title="Remove gallery photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-550 mb-1.5">Diet Type Option</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer select-none">
                <input 
                  type="radio" 
                  checked={isVeg} 
                  onChange={() => setIsVeg(true)}
                  className="accent-brand-orange" 
                />
                <span className="text-emerald-700">Veg Cottage/Plant (Green Dot)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer select-none">
                <input 
                  type="radio" 
                  checked={!isVeg} 
                  onChange={() => setIsVeg(false)}
                  className="accent-brand-orange" 
                />
                <span className="text-red-700">Non Veg / Animal protein (Red Dot)</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Gourmet Recipe Description</label>
            <textarea 
              placeholder="Describe seasonings, fillings, allergy details..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 h-20 focus:outline-none focus:border-brand-orange focus:bg-white transition"
            />
          </div>

          <div className="md:col-span-2 flex space-x-3 justify-end pt-2">
            <button 
              type="button" 
              onClick={handleReset}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold transition shadow"
            >
              {editingItem ? 'Update specifications' : 'Catalog Recipe'}
            </button>
          </div>
        </form>
      )}

      {/* Grid List of catalog items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-150 shadow-xs flex justify-between gap-4">
            <div className="flex-grow flex flex-col justify-between max-w-[65%]">
              <div>
                <div className="flex items-center space-x-1.5 text-[9px] font-bold text-gray-400 uppercase">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{item.category}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">{item.name}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="font-extrabold text-brand-orange">₹{item.price}</span>
                <span className="text-[10px] text-gray-500 font-semibold">⏱️ {item.prepTime}</span>
              </div>
            </div>

            <div className="flex-shrink-0 relative w-20 h-20">
              <img src={item.image} className="w-full h-full object-cover rounded-xl" alt={item.name} />
              {(item.galleryImages?.length || 0) > 0 && (
                <span className="absolute bottom-1 left-1 bg-black/65 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                  +{item.galleryImages?.length}
                </span>
              )}
              
              {/* Overlay controls */}
              <div className="absolute top-1 right-1 flex space-x-1">
                <button 
                  onClick={() => handleEdit(item)} 
                  className="p-1 bg-white/95 text-gray-600 hover:text-brand-orange rounded-md shadow-xs transition"
                  title="Edit item attributes"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="p-1 bg-white/95 text-gray-600 hover:text-red-500 rounded-md shadow-xs transition"
                  title="Recycle recipe archive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------ CATEGORIES TAB PANEL --------

function CategoriesTab() {
  const { categories, refreshAll } = useFoodie();
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catType, setCatType] = useState<'veg' | 'nonveg' | 'both'>('both');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catImage) {
      toast.error('Name & Photo required');
      return;
    }

    const payload: Category = {
      id: `cat-${Date.now()}`,
      name: catName,
      image: catImage,
      type: catType
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Category successfully cataloged');
        setCatName('');
        setCatImage('');
        setCatType('both');
        setShowCatForm(false);
        refreshAll();
      }
    } catch (e) {
      toast.error('Network failed');
    }
  };

  const handleRecycle = async (id: string) => {
    if (!window.confirm("Remove category metadata permanently?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Category removed');
        refreshAll();
      }
    } catch (e) {
      toast.error('Fail');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-none">Catalog categories</h2>
          <p className="text-xs text-gray-400 mt-1">Manage filters visible on dining table home categories sliders</p>
        </div>
        <button 
          onClick={() => setShowCatForm(!showCatForm)}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow transition flex items-center space-x-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showCatForm ? 'Close Category Editor' : 'Catalog Category Chip'}</span>
        </button>
      </div>

      {showCatForm && (
        <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-[2.5rem] border border-gray-150 shadow-xs max-w-xl text-left space-y-4">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Create Diner Category Icon</h3>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center space-x-1">Category Title</label>
            <input 
              type="text" 
              placeholder="E.g., Dessert Room" 
              value={catName} 
              onChange={(e) => setCatName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center space-x-1">Image Thumbnail URL</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/your-dessert" 
              value={catImage} 
              onChange={(e) => setCatImage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center space-x-1">Filters Behavior</label>
            <select 
              value={catType} 
              onChange={(e) => setCatType(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange focus:bg-white transition"
            >
              <option value="both">Both (Veg &amp; Non Veg Items)</option>
              <option value="veg">Veg Only Category</option>
              <option value="nonveg">Non Veg Only Category</option>
            </select>
          </div>
          
          <div className="flex space-x-2 pt-2 justify-end">
            <button 
              type="button" 
              onClick={() => {
                setShowCatForm(false);
                setCatName('');
                setCatImage('');
              }}
              className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-md">Create</button>
          </div>
        </form>
      )}

      {/* Categories Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-3xl border border-gray-150 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-left">
              <img src={cat.image} className="w-12 h-12 rounded-full object-cover" alt={cat.name} />
              <div>
                <h4 className="text-xs font-bold text-gray-900">{cat.name}</h4>
                <span className="text-[9px] text-gray-400 capitalize">{cat.type} Type</span>
              </div>
            </div>
            <button 
              onClick={() => handleRecycle(cat.id)}
              className="p-1 px-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400 text-xs transition"
              title="Recycle Category metadata"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------ OFFERS MANAGEMENT TAB PANEL --------

function OffersTab() {
  const { offers, refreshAll } = useFoodie();
  const [offerText, setOfferText] = useState(offers[0]?.discountText || 'Up To 70% OFF');
  const [offerHeader, setOfferHeader] = useState(offers[0]?.title || 'Up To');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: offers[0]?.id || 'offer-1',
      title: offerHeader,
      discountText: offerText,
      image: offers[0]?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      isActive: true
    };

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Dining room Special Offer banners adjusted!');
        refreshAll();
      }
    } catch (e) {
      toast.error('Adjusting fail');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl">
      <div>
        <h2 className="text-lg font-black text-gray-900 leading-none">Dining offers configurations</h2>
        <p className="text-xs text-gray-400 mt-1">Adjust active discount percentages visible on the diner landing page</p>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-[2.5rem] border border-gray-150 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 mb-2">Configure Landing Offers terms</h3>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Discount Tag Pretext</label>
          <input 
            type="text" 
            placeholder="E.g., Up To / Flat / Exclusive" 
            value={offerHeader} 
            onChange={(e) => setOfferHeader(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange-hover focus:bg-white transition"
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Discount Promotion Terms</label>
          <input 
            type="text" 
            placeholder="E.g., 70% OFF / Buy 1 Get 1" 
            value={offerText} 
            onChange={(e) => setOfferText(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-brand-orange-hover focus:bg-white transition"
            required 
          />
        </div>

        <button 
          type="submit"
          className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow transition cursor-pointer"
        >
          Push adjustments Live
        </button>
      </form>
    </div>
  );
}

// ------ MEMORIESQueue MODERATOR PANEL --------

function MemoriesModeratorTab() {
  const [allMemories, setAllMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);

  // Custom private admin fetch to capture pending memories
  const loadQueue = async () => {
    setLoading(true);
    try {
      // 1. Fetch memories
      const res = await fetch('/api/admin/memories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllMemories(data);
      }
      
      // 2. Fetch auto-approve status setting
      const settingRes = await fetch('/api/admin/memories/auto-approve');
      const settingData = await settingRes.json();
      if (settingData && typeof settingData.enabled === 'boolean') {
        setAutoApproveEnabled(settingData.enabled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/memories/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isApproved ? 'Memory approved & published live!' : 'Memory rejected & removed');
        loadQueue();
      }
    } catch (e) {
      toast.error('Network mistake');
    }
  };

  const handleDeleteMemoryCompletely = async (id: string) => {
    const ok = window.confirm("Are you sure you want to completely delete this gourmet memory from the system?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Memory permanently deleted from the database.");
        loadQueue();
      } else {
        toast.error("Failed to delete memory");
      }
    } catch (e) {
      toast.error("Network error deleting memory");
    }
  };

  const handleToggleAutoApprove = async () => {
    try {
      const nextVal = !autoApproveEnabled;
      const res = await fetch('/api/admin/memories/auto-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextVal })
      });
      const data = await res.json();
      if (data.success) {
        setAutoApproveEnabled(data.enabled);
        toast.success(data.enabled ? "✓ Auto-approve memories enabled! All new uploads go live instantly." : "Auto-approve disabled. Admin review required.");
      }
    } catch (e) {
      toast.error("Failed to change settings");
    }
  };

  const pending = allMemories.filter(m => !m.isApproved);
  const approved = allMemories.filter(m => m.isApproved);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-5 rounded-[2rem] border border-gray-150 shadow-xs">
        <div>
          <h2 className="text-base font-black text-gray-900 leading-none">Memories &amp; Moments Moderation Board</h2>
          <p className="text-xs text-gray-400 mt-1.5 font-medium">Moderate guest snapshots or enable instantaneous publication options.</p>
        </div>
        
        {/* Auto Approve Toggle Switch Card */}
        <div className="flex items-center space-x-3 bg-[#FAF9F7] p-3 rounded-2xl border border-gray-200">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-brand-orange block tracking-wider">Auto-Approve System</span>
            <span className="text-[9px] text-gray-450 font-bold">Publish to Live Wall Instantly</span>
          </div>
          <button 
            type="button"
            onClick={handleToggleAutoApprove}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoApproveEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${autoApproveEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Pending Queue */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full inline-block uppercase tracking-wider">
            Pending Approval ({pending.length})
          </h3>
          
          {pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map(mem => (
                <div key={mem.id} className="bg-white p-4 rounded-3xl border border-gray-150 flex gap-4">
                  <img src={mem.photoUrl} className="w-28 h-20 object-cover rounded-xl border flex-shrink-0" alt="moderation snap" />
                  <div className="flex-grow flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{mem.userName}</h4>
                      <p className="text-[9px] text-gray-400">{mem.userEmail}</p>
                      <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">⏱️ {new Date(mem.uploadedAt).toLocaleString()}</span>
                    </div>
 
                    <div className="flex space-x-2 mt-2">
                      <button 
                        onClick={() => handleDeleteMemoryCompletely(mem.id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[10px] uppercase transition cursor-pointer"
                        title="Delete memory permanently"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleApprove(mem.id, true)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-lg text-[10px] uppercase transition cursor-pointer flex-grow"
                      >
                        Approve Live
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-6">Pending moderation queue is completely empty.</p>
          )}
        </div>

        {/* Right: Approved list */}
        <div className="space-y-4 border-l border-gray-100 pl-0 lg:pl-6">
          <h3 className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-block uppercase tracking-wider">
            Approved &amp; Live Profiles Feed ({approved.length})
          </h3>

          {approved.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {approved.map(mem => (
                <div key={mem.id} className="relative group rounded-2xl overflow-hidden border border-gray-100 h-28 bg-black">
                  <img src={mem.photoUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-105 transition" alt="live" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/90 to-transparent p-2 text-white z-10">
                    <p className="text-[8px] font-bold truncate">{mem.userName}</p>
                    <div className="flex justify-between items-center mt-1">
                      <button 
                        onClick={() => handleApprove(mem.id, false)}
                        className="text-[7.5px] text-orange-400 hover:text-orange-350 font-black uppercase tracking-wider"
                      >
                        Revoke
                      </button>
                      <button 
                        onClick={() => handleDeleteMemoryCompletely(mem.id)}
                        className="text-[7.5px] text-red-400 hover:text-red-500 font-black uppercase tracking-wider pl-1.5 border-l border-white/20"
                        title="Delete permanently"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-6">No memory documents are approved yet.</p>
          )}

        </div>

      </div>
    </div>
  );
}

// ------ PAST ORDERS HISTORIC ARCHIVE --------

function HistoryTab() {
  const { orders } = useFoodie();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'served'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorter logic filters
  const filtered = orders.filter(item => {
    // 1. Status toggle
    if (filter !== 'all' && item.status !== filter) return false;
    
    // 2. Search query matches
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = item.customerName.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchTable = item.tableNumber.toLowerCase().includes(q);
      return matchName || matchPhone || matchTable;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900 leading-none">Past orders library</h2>
          <p className="text-xs text-gray-400 mt-1">Audit past transactions log, dining bills and table metrics</p>
        </div>
        
        {/* Statistics highlights box */}
        <div className="bg-white border border-gray-150 rounded-2xl p-3 flex gap-4 text-xs font-semibold text-gray-500">
          <div>Orders: <span className="text-brand-orange font-sans">{orders.length}</span></div>
          <div className="border-l h-5 border-gray-150"></div>
          <div>Sales Total: <span className="text-brand-orange font-sans">₹{orders.reduce((v, o) => v + o.totalAmount, 0)}</span></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-gray-150 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-3">
          
          {/* Term input search */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 py-2 flex-grow">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by customer name, order, table, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs w-full outline-none text-gray-800"
            />
          </div>

          {/* Status filters buttons */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {['all', 'pending', 'confirmed', 'served'].map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl uppercase tracking-wider transition ${filter === key ? 'bg-brand-orange text-white' : 'bg-gray-100 hover:bg-gray-150 text-gray-500'}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic tables logs view */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 font-bold text-gray-400">
                  <th className="py-3 px-2">Table</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Phone</th>
                  <th className="py-3 px-2 text-center">Meals Count</th>
                  <th className="py-3 px-2 text-right">Sum</th>
                  <th className="py-3 px-2 text-center">Placed</th>
                  <th className="py-3 px-2 text-right">Payment</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 font-bold text-brand-orange">Table {item.tableNumber}</td>
                    <td className="py-3 px-2 font-bold text-gray-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{item.customerName}</span>
                        {item.isManual && (
                          <span className="text-[8px] bg-[#FF6B00]/10 text-brand-orange border border-brand-orange/25 font-black px-1.5 py-0.5 rounded uppercase leading-none" title="Staff-entered Order">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-gray-500">{item.phone}</td>
                    <td className="py-3 px-2 text-center font-bold">{item.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="py-3 px-2 text-right font-black font-sans text-brand-orange">₹{item.totalAmount}</td>
                    <td className="py-3 px-2 text-center text-gray-400 font-medium">{(new Date(item.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-2 text-right">
                      {item.status === 'served' ? (
                        <div className="inline-flex flex-col items-end text-right">
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase leading-none border border-emerald-500/10">
                            Paid ✓
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono mt-1 font-bold capitalize">
                            {item.paymentMode || 'cash'}{item.paymentRemark ? ` - "${item.paymentRemark}"` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase leading-none border border-amber-500/10">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        item.status === 'confirmed' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.status === 'served' ? 'Served' : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-10 italic">No historical orders match the specified filters.</p>
        )}
      </div>
    </div>
  );
}
