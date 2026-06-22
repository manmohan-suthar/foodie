import React, { useState, useMemo } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { 
  ShoppingBag, Trash2, Plus, Minus, Search, Check, 
  ChevronRight, Users, Phone, User, AlertTriangle, 
  ArrowLeft, MessageSquare, CreditCard, DollarSign, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuItem, Order, OrderItem } from '../types.js';

type Step = 'table' | 'customer' | 'menu' | 'review' | 'success';

interface ManualCartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function ManualOrderTab() {
  const { menuItems, categories, orders, refreshAll } = useFoodie();

  // Navigation Steps
  const [currentStep, setCurrentStep] = useState<Step>('table');

  // Order building states
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [manualCart, setManualCart] = useState<ManualCartItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi'>('cash');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);

  // Appending support
  const [isAppendingMode, setIsAppendingMode] = useState<boolean>(false);
  const [targetOrderId, setTargetOrderId] = useState<string>('');
  const [showTableWarning, setShowTableWarning] = useState<boolean>(false);
  const [pendingWarningTable, setPendingWarningTable] = useState<string>('');

  // Search & Filters in Menu Step
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [isPlacing, setIsPlacing] = useState<boolean>(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<Order | null>(null);

  // Expanded cart preview modal in step 3
  const [showCartDropdown, setShowCartDropdown] = useState<boolean>(false);

  // Define visual tables list (Table 1 to 12)
  const availableTables = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  }, []);

  // Compute table status & current active orders from live order data
  const tableStatusMap = useMemo(() => {
    const map: Record<string, { status: 'available' | 'occupied' | 'pending'; order?: Order }> = {};
    
    // Assign defaults
    availableTables.forEach(t => {
      map[t] = { status: 'available' };
    });

    // Populate from active orders (status !== 'served')
    const activeOrders = orders.filter(o => o.status !== 'served');
    activeOrders.forEach(order => {
      const table = order.tableNumber;
      // Map based on order state
      if (order.status === 'pending') {
        map[table] = { status: 'pending', order };
      } else if (order.status === 'confirmed') {
        map[table] = { status: 'occupied', order };
      }
    });

    return map;
  }, [orders, availableTables]);

  // Handle table selector
  const handleTableSelect = (tableNum: string) => {
    const tableState = tableStatusMap[tableNum];
    
    if (tableState && tableState.status !== 'available') {
      // Table occupied/pending, show overlay conflict controls
      setPendingWarningTable(tableNum);
      setShowTableWarning(true);
    } else {
      // Standard flow
      setSelectedTable(tableNum);
      setIsAppendingMode(false);
      setTargetOrderId('');
      setCurrentStep('customer');
    }
  };

  // Continue to menu after warning for Append Mode
  const handleChooseAppend = () => {
    const tableState = tableStatusMap[pendingWarningTable];
    if (tableState && tableState.order) {
      const existingOrder = tableState.order;
      setSelectedTable(pendingWarningTable);
      setCustomerName(existingOrder.customerName);
      setPhone(existingOrder.phone);
      setGuestCount(existingOrder.guestCount || 2);
      
      // Load current elements in that order into the booking cart
      const loadedCart: ManualCartItem[] = existingOrder.items.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity
      }));
      setManualCart(loadedCart);
      
      setIsAppendingMode(true);
      setTargetOrderId(existingOrder.id);
      setSpecialInstructions(existingOrder.specialInstructions || '');
      setDiscountPercent(existingOrder.discountPercent || 0);
      setPaymentMode(existingOrder.paymentMode || 'cash');

      toast.success(`Loading Table ${pendingWarningTable} current selections into work desk.`);
      setShowTableWarning(false);
      // Directly go to Menu building step
      setCurrentStep('menu');
    }
  };

  // Continue to menu after warning to start an isolated checkout
  const handleChooseSeparate = () => {
    setSelectedTable(pendingWarningTable);
    setIsAppendingMode(false);
    setTargetOrderId('');
    setManualCart([]); // Clear any previous choices
    setShowTableWarning(false);
    setCurrentStep('customer');
  };

  // Stepper quantity managers
  const addToManualCart = (item: MenuItem) => {
    setManualCart(prev => {
      const idx = prev.findIndex(c => c.menuItem.id === item.id);
      if (idx >= 0) {
        return prev.map((c, i) => i === idx ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { menuItem: item, quantity: 1 }];
      }
    });
    toast.success(`Added ${item.name}`);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setManualCart(prev => {
      const idx = prev.findIndex(c => c.menuItem.id === itemId);
      if (idx === -1) return prev;
      
      const nextQty = prev[idx].quantity + change;
      if (nextQty <= 0) {
        toast.error(`Removed item from list`);
        return prev.filter(c => c.menuItem.id !== itemId);
      }
      return prev.map((c, i) => i === idx ? { ...c, quantity: nextQty } : c);
    });
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return manualCart.reduce((acc, current) => acc + current.menuItem.price * current.quantity, 0);
  }, [manualCart]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Menu items list filter matching selections
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVeg = !vegOnly || item.isVeg;
      return matchCat && matchSearch && matchVeg && item.isAvailable;
    });
  }, [menuItems, selectedCategory, searchQuery, vegOnly]);

  // Confirm and submit sequence to backend server
  const handlePlaceRemote = async () => {
    if (!customerName.trim()) {
      toast.error("Customer Name is required.");
      return;
    }
    if (manualCart.length === 0) {
      toast.error("Cart is empty. Please select food items.");
      return;
    }

    setIsPlacing(true);
    try {
      if (isAppendingMode && targetOrderId) {
        // Appending to existing order using PUT
        const payload = {
          items: manualCart,
          totalAmount: finalTotal,
          specialInstructions,
          isManual: true,
          guestCount,
          discountPercent,
          isPaid: false
        };

        const response = await fetch(`/api/orders/${targetOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
          setPlacedOrderInfo(result.order);
          toast.success(`Table ${selectedTable} Order Updated Successfully!`);
          setCurrentStep('success');
          refreshAll();
        } else {
          toast.error(result.error || 'Failed to update order');
        }
      } else {
        // Normal Flow: Create brand new manual booking
        const payload = {
          tableNumber: selectedTable,
          customerName,
          phone: phone || 'Walk-in',
          items: manualCart,
          totalAmount: finalTotal,
          isManual: true,
          guestCount,
          specialInstructions,
          discountPercent,
          isPaid: false
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
          setPlacedOrderInfo(result.order);
          toast.success(`Table ${selectedTable} Manual Order Booked!`);
          setCurrentStep('success');
          refreshAll();
        } else {
          toast.error(result.error || 'Failed to book order');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Network connectivity issues. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  // Reset entire flow back to Table Selection
  const resetFlow = () => {
    setCurrentStep('table');
    setSelectedTable('');
    setCustomerName('');
    setPhone('');
    setGuestCount(2);
    setManualCart([]);
    setSpecialInstructions('');
    setDiscountPercent(0);
    setPaymentMode('cash');
    setIsAppendingMode(false);
    setTargetOrderId('');
    setPlacedOrderInfo(null);
  };

  return (
    <div id="manual-order-workspace" className="bg-white rounded-3xl border border-[#2C2926]/10 overflow-hidden shadow-sm relative">
      
      {/* Dynamic Header with Status Step Indicators */}
      <div className="bg-gradient-to-r from-[#121110] to-[#24211E] text-white p-5 lg:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] bg-[#FF6B00] text-white font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
              Service Desk
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center space-x-2">
              <span>Book Customer Walk-In Order</span>
            </h1>
            <p className="text-xs text-[#A39E99] mt-0.5">
              Service terminals for active waiters to place orders instantly
            </p>
          </div>
          
          {/* Breadcrumb Stepper Banner */}
          <div className="flex items-center space-x-2 text-[10px] font-bold bg-white/5 p-2 rounded-xl self-start lg:self-center overflow-x-auto max-w-full">
            <span className={`px-2.5 py-1 rounded-lg transition-colors ${currentStep === 'table' ? 'bg-[#FF6B00] text-white' : 'text-gray-400'}`}>1. Table</span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className={`px-2.5 py-1 rounded-lg transition-colors ${currentStep === 'customer' ? 'bg-[#FF6B00] text-white' : 'text-gray-400'}`}>2. Owner</span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className={`px-2.5 py-1 rounded-lg transition-colors ${currentStep === 'menu' ? 'bg-[#FF6B00] text-white' : 'text-gray-400'}`}>3. Menu</span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className={`px-2.5 py-1 rounded-lg transition-colors ${currentStep === 'review' ? 'bg-[#FF6B00] text-white' : 'text-gray-400'}`}>4. Post & Checkout</span>
          </div>
        </div>
      </div>

      {/* Main step routing wrapper */}
      <div className="p-5 lg:p-8 min-h-[500px]">

        {/* STEP 1: SELECT TABLE */}
        {currentStep === 'table' && (
          <div id="step-table-container" className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FBF9F6] p-4 rounded-2xl border border-[#2C2926]/5">
              <div>
                <h3 className="text-sm font-black text-gray-800">Select Diner Table ID</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose table from the grid below. Color identifies live physical status.</p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-bold text-gray-600">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
                  <span>Available</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 block animate-pulse"></span>
                  <span>Order Pending</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                  <span>Occupied</span>
                </span>
              </div>
            </div>

            {/* Tables Visual Grid Map */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableTables.map(num => {
                const info = tableStatusMap[num];
                const isAvail = info.status === 'available';
                const isPending = info.status === 'pending';
                const isOccupied = info.status === 'occupied';

                return (
                  <button
                    key={num}
                    onClick={() => handleTableSelect(num)}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 text-left group hover:scale-[1.02] cursor-pointer hover:shadow-md ${
                      isAvail 
                        ? 'bg-emerald-50/20 hover:bg-emerald-50/50 border-emerald-500/20 hover:border-emerald-500/80' 
                        : isPending 
                          ? 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-400/30 hover:border-amber-400/90' 
                          : 'bg-red-50/10 hover:bg-red-50/30 border-red-500/20 hover:border-red-500/70'
                    }`}
                  >
                    {/* Status Badge Tag */}
                    <div className="absolute top-3.5 right-3.5 flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${
                        isAvail ? 'bg-emerald-500' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                      }`}></span>
                    </div>

                    <div className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">Table</div>
                    <div className="text-2xl font-black text-gray-800 mt-1 leading-none">{num}</div>
                    
                    {/* Inner status detail */}
                    <div className="mt-4 pt-3 border-t border-[#2C2926]/5 flex flex-col justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        isAvail ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {isAvail ? 'Available' : isPending ? 'Pending Order' : 'Cooking/Occupied'}
                      </span>
                      
                      {/* Current summary on hover or visual expand */}
                      {!isAvail && info.order && (
                        <div className="mt-1.5 text-[10px] text-gray-500 space-y-0.5 line-clamp-1 group-hover:block transition-all duration-300">
                          <p className="truncate font-bold">👤 {info.order.customerName}</p>
                          <p className="font-mono text-[9px] text-[#FF6B00]">
                            {info.order.items.reduce((sum, item) => sum + item.quantity, 0)} Items · ₹{info.order.totalAmount}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Warn user if conflicting order is active */}
            {showTableWarning && (
              <div className="fixed inset-0 bg-[#121110]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#2C2926]/10 shadow-xl space-y-4">
                  <div className="flex items-center space-x-3 text-amber-600">
                    <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-bounce" />
                    <div>
                      <h4 className="font-black text-base text-gray-800">Overlap Warn: Table {pendingWarningTable} Already Occupied</h4>
                      <p className="text-xs text-gray-500">What operation would you like to perform for this active setup?</p>
                    </div>
                  </div>
                  
                  {tableStatusMap[pendingWarningTable]?.order && (
                    <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs space-y-1.5 border border-brand-orange/5 text-gray-600">
                      <p><strong>Diner Name:</strong> {tableStatusMap[pendingWarningTable].order?.customerName}</p>
                      <p><strong>Contact Info:</strong> {tableStatusMap[pendingWarningTable].order?.phone}</p>
                      <p><strong>Current Active Bill:</strong> ₹{tableStatusMap[pendingWarningTable].order?.totalAmount}</p>
                      <p><strong>Menu items:</strong> {tableStatusMap[pendingWarningTable].order?.items.map(i => `${i.menuItem.name} (x${i.quantity})`).join(', ')}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    <button
                      onClick={handleChooseAppend}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add / Append Items to Existing Order</span>
                    </button>
                    <button
                      onClick={handleChooseSeparate}
                      className="w-full bg-[#1A1A1A] hover:bg-black text-white font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-brand-orange" />
                      <span>Create New Isolated Order</span>
                    </button>
                    <button
                      onClick={() => setShowTableWarning(false)}
                      className="w-full bg-[#F4F1EE] hover:bg-[#EBE6E0] text-gray-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel & Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CUSTOMER DETAILS FORM */}
        {currentStep === 'customer' && (
          <div id="step-client-details-forms" className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-[#FBF9F6] p-4 rounded-2xl border border-[#2C2926]/5 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Selected Placement Table:</span>
              <span className="text-base font-black text-white bg-brand-orange px-4 py-1.5 rounded-xl">
                Table {selectedTable}
              </span>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#2C2926]/5 shadow-xs">
              <h3 className="font-extrabold text-sm text-gray-800 border-b border-[#2C2926]/5 pb-3">
                Customer Walk-In Particulars
              </h3>

              {/* Passenger Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-[#6C6359] uppercase tracking-wider">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name (e.g., Rajesh Kumar)"
                    className="w-full pl-10 pr-4 py-3 border border-[#EBE6E0] rounded-xl text-xs bg-[#FAF9F7] text-[#2D2926] placeholder-gray-400 outline-none focus:ring-1 focus:ring-brand-orange/40 focus:bg-white transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Telephone digits */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-[#6C6359] uppercase tracking-wider">
                  Phone Number (Optional - For notifications)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-[#EBE6E0] rounded-xl text-xs bg-[#FAF9F7] text-[#2D2926] placeholder-gray-400 outline-none focus:ring-1 focus:ring-brand-orange/40 focus:bg-white transition-all font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Stepper for Guest Counts */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-[#6C6359] uppercase tracking-wider">
                  Number of Guests
                </label>
                <div className="flex items-center space-x-4 bg-[#FAF9F7] p-3.5 rounded-xl border border-[#EBE6E0] justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-semibold">Diners Headcount:</span>
                  </div>
                  
                  <div className="flex items-center space-x-3.5">
                    <button
                      type="button"
                      disabled={guestCount <= 1}
                      onClick={() => setGuestCount(prev => prev - 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EBE6E0] hover:bg-[#F4F1EE] text-gray-700 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-black text-gray-800 w-4 text-center">{guestCount}</span>
                    <button
                      type="button"
                      disabled={guestCount >= 10}
                      onClick={() => setGuestCount(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#EBE6E0] hover:bg-[#F4F1EE] text-gray-700 font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('table')}
                className="w-1/3 py-3 rounded-xl text-xs font-bold text-gray-600 hover:text-black border border-[#EBE6E0] hover:bg-[#F4F1EE] cursor-pointer transition"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={!customerName.trim()}
                onClick={() => setCurrentStep('menu')}
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] hover:shadow-[#FF6B00]/10 hover:shadow-lg text-white font-black py-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>Continue to Menu Browser</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUILD THE ORDER (MENU BROWSER) */}
        {currentStep === 'menu' && (
          <div id="step-menu-browser-elements" className="space-y-6 animate-fadeIn">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2926]/10 pb-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentStep('customer')}
                  className="p-1.5 hover:bg-[#F4F1EE] rounded-lg transition text-gray-500 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm font-black text-gray-800 mb-0.5">Step 3: Select Food Menu</h3>
                  <p className="text-[11px] text-[#A39E99]">Adding for <strong>{customerName}</strong> on Table <strong>{selectedTable}</strong> {isAppendingMode && <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.5 rounded font-black ml-1.5">APPEND MODE</span>}</p>
                </div>
              </div>

              {/* Veg Toggle + Search Combo */}
              <div className="flex items-center space-x-3">
                {/* Search query box */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="w-44 pl-9 pr-3 py-1.5 border border-[#EBE6E0] rounded-xl text-xs bg-[#FAF9F7] text-[#2D2926] outline-none font-semibold focus:ring-1 focus:ring-brand-orange/40 focus:bg-white"
                  />
                </div>

                {/* Veg pill toggle */}
                <button
                  onClick={() => setVegOnly(prev => !prev)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    vegOnly 
                      ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/10' 
                      : 'bg-[#F4F1EE] text-gray-600 hover:bg-[#EBE6E0]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-500'}`}></span>
                  <span>Veg Only</span>
                </button>
              </div>
            </div>

            {/* Horizontal Category filter list */}
            <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-thin select-none max-w-full">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'All' 
                    ? 'bg-brand-orange text-white font-extrabold shadow-sm' 
                    : 'bg-[#F4F1EE] text-gray-700 hover:bg-[#EBE6E0]'
                }`}
              >
                All items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.name 
                      ? 'bg-brand-orange text-white font-extrabold shadow-sm' 
                      : 'bg-[#F4F1EE] text-gray-700 hover:bg-[#EBE6E0]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Main Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenuItems.map(item => {
                const cartMatch = manualCart.find(c => c.menuItem.id === item.id);
                const quantity = cartMatch ? cartMatch.quantity : 0;

                return (
                  <div 
                    key={item.id} 
                    className="bg-[#FAF9F7]/40 hover:bg-white border border-[#2C2926]/5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xs p-3.5 flex space-x-4 relative group"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Veg indicator dot */}
                      <span className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-sm border-2 bg-white flex items-center justify-center`} style={{ borderColor: item.isVeg ? '#22C55E' : '#EF4444' }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </span>
                    </div>

                    {/* Meta information */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-xs text-gray-800 leading-snug truncate pr-2" title={item.name}>
                            {item.name}
                          </h4>
                          <span className="text-xs font-black text-brand-orange shrink-0">
                            ₹{item.price}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Add button quantity controls */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-[#2C2926]/5">
                        <span className="text-[9px] text-[#A39E99] font-semibold">{item.prepTime || '10 Min'} prep</span>
                        
                        {quantity > 0 ? (
                          <div className="flex items-center bg-white border border-[#EBE6E0] rounded-lg shadow-xxs">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-1 text-gray-500 hover:text-red-500 transition cursor-pointer font-bold"
                            >
                              <Minus className="w-3" />
                            </button>
                            <span className="text-xs font-black px-1.5 text-gray-800 text-center select-none w-5">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToManualCart(item)}
                              className="px-2 py-1 text-gray-500 hover:text-green-500 transition cursor-pointer font-bold"
                            >
                              <Plus className="w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToManualCart(item)}
                            className="bg-brand-orange hover:bg-[#E05E00] text-white px-3 py-1 rounded-lg text-xxs font-black transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>ADD</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMenuItems.length === 0 && (
                <div className="py-12 text-center col-span-full space-y-2">
                  <p className="text-xs text-gray-400">No matching food dishes found.</p>
                  <p className="text-[11px] text-gray-400">Try modifying your text filters or selecting a different category.</p>
                </div>
              )}
            </div>

            {/* Floating CART PREVIEW BAR at bottom */}
            {manualCart.length > 0 && (
              <div className="sticky bottom-4 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl border border-brand-orange/20 p-4 shadow-xl z-20 flex items-center justify-between animate-slideUp">
                <div className="flex items-center space-x-3">
                  <span className="bg-brand-orange/10 p-2.5 rounded-xl text-brand-orange">
                    <ShoppingBag className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-gray-800">
                      {manualCart.reduce((sum, item) => sum + item.quantity, 0)} Items Selected
                    </p>
                    <p className="text-[11px] text-[#FF6B00] font-black">
                      Subtotal: ₹{subtotal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Expanded Mini Dropdown list toggle */}
                  <button
                    onClick={() => setShowCartDropdown(prev => !prev)}
                    className="bg-[#F4F1EE] hover:bg-[#EBE6E0] text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    {showCartDropdown ? 'Hide Items' : 'Show Cart Items'}
                  </button>

                  <button
                    onClick={() => setCurrentStep('review')}
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 hover:shadow-md hover:shadow-brand-orange/15 transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* mini cart list overlay */}
                {showCartDropdown && (
                  <div className="absolute bottom-16 right-4 left-4 bg-white rounded-2xl border border-[#2C2926]/10 p-4 max-h-60 overflow-y-auto shadow-2xl space-y-2.5 animate-fadeIn">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-2">Cart Selections</p>
                    {manualCart.map(item => (
                      <div key={item.menuItem.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                        <div className="truncate pr-4 flex-grow font-bold text-gray-700">
                          {item.menuItem.name} <span className="text-[10px] text-brand-orange">x{item.quantity}</span>
                        </div>
                        <div className="flex items-center space-x-2.5 shrink-0">
                          <span className="font-mono text-gray-700 font-bold">₹{item.menuItem.price * item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, -1)}
                            className="text-red-400 hover:text-red-500 font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 'review' && (
          <div id="step-review-and-confirm-desk" className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <h3 className="font-extrabold text-sm text-gray-800 mb-0.5 mt-2 flex items-center space-x-2">
              <span>Step 4: Audit & Confirm Order Invoice</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Items details + instructions */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-[#2C2926]/5 p-5 shadow-xxs space-y-3">
                  <h4 className="text-xs font-black text-gray-800 tracking-wider uppercase border-b border-[#2C2926]/5 pb-2">Reviewed Cart Items</h4>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {manualCart.map(item => (
                      <div key={item.menuItem.id} className="flex items-center justify-between gap-2.5 py-1 text-xs">
                        <div className="min-w-0 flex-grow">
                          <p className="font-bold text-gray-800 truncate">{item.menuItem.name}</p>
                          <p className="text-[10px] text-brand-orange mt-0.5">₹{item.menuItem.price} each</p>
                        </div>

                        {/* Quantity management stepper */}
                        <div className="flex items-center bg-[#FBF9F6] border border-[#EBE6E0] rounded-lg shadow-xxs shrink-0">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, -1)}
                            className="px-2 py-1 text-gray-500 hover:text-[#FF6B00] font-bold"
                          >
                            <Minus className="w-3" />
                          </button>
                          <span className="text-[11px] font-black px-1.5 text-gray-700 text-center w-5 select-none font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToManualCart(item.menuItem)}
                            className="px-2 py-1 text-gray-500 hover:text-[#22C55E] font-bold"
                          >
                            <Plus className="w-3" />
                          </button>
                        </div>

                        {/* Sum price */}
                        <span className="font-mono font-bold text-gray-800 min-w-[50px] text-right">
                          ₹{item.menuItem.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions textarea */}
                <div className="bg-white rounded-3xl border border-[#2C2926]/5 p-5 shadow-xxs space-y-2">
                  <label className="block text-[11px] font-black text-[#6C6359] uppercase tracking-wider">
                    Special Chef Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. less spicy, make extra crispy, allergen precautions, etc."
                    className="w-full border border-[#EBE6E0] rounded-xl p-3 text-xs bg-[#FAF9F7] text-[#2D2926] placeholder-gray-400 outline-none focus:ring-1 focus:ring-brand-orange/40 focus:bg-white resize-none font-semibold"
                  />
                </div>
              </div>

              {/* Right Column: Payment settings, discounts, totals */}
              <div className="space-y-4">
                
                {/* Financial math summary */}
                <div className="bg-[#FAF9F7]/60 rounded-3xl border border-[#2C2926]/10 p-5 space-y-4">
                  <h4 className="text-xs font-black text-gray-800 tracking-wider uppercase border-b border-[#2C2926]/5 pb-2">Invoice Calculations</h4>
                  
                  {/* Manual discount input controls */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-[#6C6359] uppercase tracking-wider">
                      Staff Discount % (0% - 50%)
                    </label>
                    <div className="flex items-center bg-white border border-[#EBE6E0] rounded-xl p-2.5 justify-between">
                      <span className="text-xs font-semibold text-gray-500">Apply Percentage:</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={discountPercent || ''}
                          onChange={(e) => {
                            const val = Math.min(50, Math.max(0, parseInt(e.target.value) || 0));
                            setDiscountPercent(val);
                          }}
                          placeholder="0"
                          className="w-14 text-center border-b border-[#EBE6E0] outline-none text-xs font-black text-gray-800 font-mono"
                        />
                        <span className="text-xs font-bold text-gray-500">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations breakdown list */}
                  <div className="space-y-2.5 pt-2 text-xs border-t border-[#2C2926]/5">
                    <div className="flex justify-between text-gray-600">
                      <span>Calculated Subtotal:</span>
                      <span className="font-mono">₹{subtotal}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>Applied Discount ({discountPercent}%):</span>
                        <span className="font-mono">- ₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Processing Taxes & Service:</span>
                      <span className="font-mono text-emerald-600 font-extrabold uppercase text-[10px]">Free</span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#2C2926]/5 mt-3">
                      <span className="font-black text-gray-800">Final Gross Total:</span>
                      <span className="font-mono text-base font-black text-brand-orange">₹{finalTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Deferred Payment Notice segment */}
                <div className="bg-amber-50/50 rounded-3xl border border-amber-500/10 p-5 shadow-xxs space-y-2.5 text-left">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Deferred Payment Mode</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    This order is booked as <span className="text-[#FF6B00] font-bold">Unpaid</span> first. 
                    Diners can place additional dishes or edit selections freely. You will view and record the bill payment (Cash, Card, or UPI) when completing/serving the order in the Kitchen Board.
                  </p>
                </div>

              </div>
            </div>

            {/* Submissions actions buttons row */}
            <div className="flex space-x-3 pt-4 border-t border-[#2C2926]/5">
              <button
                type="button"
                onClick={() => setCurrentStep('menu')}
                className="w-1/3 py-3 rounded-xl text-xs font-bold text-gray-600 hover:text-black border border-[#EBE6E0] hover:bg-[#F4F1EE] cursor-pointer transition"
              >
                Modify Selections
              </button>
              <button
                type="button"
                disabled={isPlacing}
                onClick={handlePlaceRemote}
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8A3D] hover:shadow-[#FF6B00]/10 hover:shadow-lg text-white font-black py-3 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isPlacing ? (
                  <span className="animate-pulse">Registering Order on DB Server...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Place Walk-in Order (₹{finalTotal})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: BOOKED SUCCESS INTERACTIVE */}
        {currentStep === 'success' && (
          <div id="step-booked-success-workspace" className="max-w-md mx-auto text-center py-8 space-y-6 animate-fadeIn">
            
            {/* animated check box */}
            <div className="flex flex-col items-center justify-center">
              <span className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transform scale-110 duration-500 animate-scaleUp">
                <Check className="w-8 h-8 stroke-[3]" />
              </span>
              <h2 className="text-xl font-black text-gray-800 tracking-tight mt-5 leading-tight">
                Order successfully booked!
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Table {selectedTable} database status has updated to <span className="font-extrabold text-red-500">🔴 Occupied</span>. Kitchen notified.
              </p>
            </div>

            {/* Formatted order receipt container */}
            {placedOrderInfo && (
              <div className="bg-[#FAF9F7] p-5 rounded-2xl border border-[#2C2926]/5 text-left text-xs text-gray-600 space-y-3.5">
                <div className="flex justify-between border-b border-dashed border-[#2C2926]/10 pb-2.5">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Booking ID</span>
                    <strong className="text-gray-800 font-mono text-xs">{placedOrderInfo.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Order Source</span>
                    <span className="bg-brand-orange/10 text-brand-orange font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                      👤 {placedOrderInfo.isManual ? 'Admin Booked' : 'Scanned QR'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p><strong>Diner Name:</strong> {placedOrderInfo.customerName} ({placedOrderInfo.guestCount || 1} diners)</p>
                  {placedOrderInfo.phone && placedOrderInfo.phone !== 'Walk-in' && (
                    <p><strong>Phone Contact:</strong> {placedOrderInfo.phone}</p>
                  )}
                  <p><strong>Table Registered:</strong> Table {placedOrderInfo.tableNumber}</p>
                  <p><strong>Payment Status:</strong> <span className="uppercase font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">Pending (Pay Later)</span></p>
                  {placedOrderInfo.specialInstructions && (
                    <p className="text-[#FF6B00]"><strong>Note:</strong> "{placedOrderInfo.specialInstructions}"</p>
                  )}
                </div>

                {/* Sub-total with discount percentages info */}
                <div className="pt-2 border-t border-[#2C2926]/5 flex justify-between font-black text-gray-800">
                  <span>Gross Placed Invoice:</span>
                  <span className="text-brand-orange text-sm font-mono">₹{placedOrderInfo.totalAmount}</span>
                </div>
              </div>
            )}

            {/* WhatsApp/SMS notification triggers */}
            {phone && phone !== 'Walk-in' && (
              <div className="bg-amber-50/30 border border-amber-500/10 p-4 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black">Notify Customer on WhatsApp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00] cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  Automatically launches API text parameters confirming the food invoice registration for mobile <strong>+91-{phone}</strong>.
                </p>
              </div>
            )}

            {/* Back options */}
            <div className="space-y-2 pt-3">
              <button
                type="button"
                onClick={resetFlow}
                className="w-full bg-[#FF6B00] hover:bg-brand-orange hover:shadow-lg text-white font-black py-3 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Book Another Walk-in Order</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
