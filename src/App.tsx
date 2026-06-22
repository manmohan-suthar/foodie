/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FoodieProvider, useFoodie } from "./context/FoodieContext.js";
import { Toaster } from "react-hot-toast";
import {
  Home,
  Search,
  ShoppingBag,
  Bell,
  Settings,
  ArrowLeft,
  Camera,
} from "lucide-react";
import HomeView from "./components/HomeView.js";
import CategoriesView from "./components/CategoriesView.js";
import ExploreView from "./components/ExploreView.js";
import SearchView from "./components/SearchView.js";
import CartView from "./components/CartView.js";
import ConfirmationView from "./components/ConfirmationView.js";
import NotificationView from "./components/NotificationView.js";
import AdminView from "./components/AdminView.js";
import MemoriesView from "./components/MemoriesView.js";

function AppContent() {
  const { currentScreen, setScreen, cartCount } = useFoodie();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeView />;
      case "categories":
        return <CategoriesView />;
      case "explore":
        return <ExploreView />;
      case "search":
        return <SearchView />;
      case "cart":
        return <CartView />;
      case "confirmation":
        return <ConfirmationView />;
      case "notifications":
        return <NotificationView />;
      case "memories":
        return <MemoriesView />;
      case "admin":
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  if (currentScreen === "admin") {
    return (
      <div className="min-h-screen bg-[#F4F1EE] font-sans">
        <AdminView />
      </div>
    );
  }

  // Hide the floating action button on Admin & Confirmation views to maintain design hygiene
  const isNavHidden =
    currentScreen === "admin" || currentScreen === "confirmation";

  return (
    <div className="min-h-screen bg-[#F4F1EE] flex justify-center font-sans">
      {/* Container simulating a premium mobile screen width (max-w-[480px]) on big monitors */}
      <div className="w-full max-w-[480px] bg-white text-[#2D2926] shadow-2xl flex flex-col relative min-h-screen border-x border-[#EBE6E0]">
        {/* Main Active Page Frame */}
        <main className="flex-grow select-none">{renderActiveScreen()}</main>

        {/* Floating Bottom Navigation & Cart Launcher (Sticky footer) */}
        {!isNavHidden && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[420px] bg-[#1A1A1A] rounded-full p-3 flex justify-between items-center shadow-2xl border border-white/10 z-40">
            {/* 1. Home tab */}
            <button
              onClick={() => setScreen("home")}
              className={`flex flex-col items-center flex-1 cursor-pointer transition ${currentScreen === "home" ? "text-brand-orange" : "text-gray-400 hover:text-white"}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">
                Dine
              </span>
            </button>

            {/* 2. Explore Tab */}
            <button
              onClick={() => setScreen("explore")}
              className={`flex flex-col items-center flex-1 cursor-pointer transition ${currentScreen === "explore" ? "text-brand-orange" : "text-gray-400 hover:text-white"}`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">
                Catalog
              </span>
            </button>

            {/* 3. Floating Bottom Center Action Button (Orange highlight Cart toggle) */}
            <button
              onClick={() =>
                setScreen(currentScreen === "cart" ? "home" : "cart")
              }
              className="relative bg-brand-orange hover:bg-brand-orange-hover p-4 rounded-full -mt-9 border-[5px] border-[#1A1A1A] text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Quick checkout cart"
            >
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B00] border-2 border-[#1A1A1A] text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
              <ShoppingBag className="w-5 h-5 text-white" />
            </button>

            {/* 4. Notification Alerts Tab */}
            <button
              onClick={() => setScreen("notifications")}
              className={`flex flex-col items-center flex-1 cursor-pointer transition ${currentScreen === "notifications" ? "text-brand-orange" : "text-gray-400 hover:text-white"}`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">
                Alerts
              </span>
            </button>

            {/* 5. Admin Dashboard Gate */}
            {/* <button
              onClick={() => setScreen("admin")}
              className={`flex flex-col items-center flex-1 cursor-pointer transition ${currentScreen === "admin" ? "text-brand-orange" : "text-gray-400 hover:text-white"}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">
                Admin
              </span>
            </button> */}

            {/* 3. Memories Tab */}
            <button
              onClick={() => setScreen("memories")}
              className={`flex flex-col items-center flex-1 cursor-pointer transition ${currentScreen === "memories" ? "text-brand-orange" : "text-gray-400 hover:text-white"}`}
            >
              <Camera className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">
                Moments
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FoodieProvider>
      <AppContent />
      <Toaster position="top-center" reverseOrder={false} />
    </FoodieProvider>
  );
}
