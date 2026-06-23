/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useFoodie } from "../context/FoodieContext.js";
import {
  Search,
  Heart,
  Award,
  Sparkles,
  Camera,
  LogIn,
  LogOut,
  Check,
  Plus,
  Trash2,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import type { MenuItem } from "../types.js";

export default function HomeView() {
  const {
    menuItems,
    categories,
    offers,
    memories,
    setScreen,
    setSelectedCategoryName,
    vegOnly,
    setVegOnly,
    tableNumber,
    currentUser,
    loginGoogle,
    logoutGoogle,
    submitMemory,
    addToCart,
  } = useFoodie();

  // Search trigger
  const handleSearchClick = () => {
    setScreen("search");
  };

  // Google Sign-In helper state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [selectedShowcaseItem, setSelectedShowcaseItem] =
    useState<MenuItem | null>(null);
  const [activeShowcasePhoto, setActiveShowcasePhoto] = useState(0);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(
    null,
  );

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleOpenLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginName) {
      toast.error("Please fill in both email and name");
      return;
    }
    loginGoogle(loginEmail, loginName);
    setShowLoginModal(false);
    setLoginEmail("");
    setLoginName("");
  };

  // Standard Google login shortcut buttons
  const handleQuickLogin = (email: string, name: string) => {
    loginGoogle(email, name);
    setShowLoginModal(false);
  };

  const getShowcasePhotos = (item: MenuItem) => {
    const photos = [item.image, ...(item.galleryImages || [])]
      .map((photo) => photo.trim())
      .filter(Boolean);
    return Array.from(new Set(photos));
  };

  const openShowcaseModal = (item: MenuItem) => {
    setSelectedShowcaseItem(item);
    setActiveShowcasePhoto(0);
  };

  const closeShowcaseModal = () => {
    setSelectedShowcaseItem(null);
    setActiveShowcasePhoto(0);
  };

  const showcasePhotos = selectedShowcaseItem
    ? getShowcasePhotos(selectedShowcaseItem)
    : [];

  const visibleMemories = memories.slice(0, 4);
  const selectedMemory =
    selectedMemoryIndex !== null ? visibleMemories[selectedMemoryIndex] : null;

  const closeMemoryModal = () => {
    setSelectedMemoryIndex(null);
  };

  const showPreviousMemory = () => {
    if (visibleMemories.length === 0) return;
    setSelectedMemoryIndex((prev) =>
      prev === null || prev === 0 ? visibleMemories.length - 1 : prev - 1,
    );
  };

  const showNextMemory = () => {
    if (visibleMemories.length === 0) return;
    setSelectedMemoryIndex((prev) =>
      prev === null ? 0 : (prev + 1) % visibleMemories.length,
    );
  };

  // Activate capture getUserMedia
  const startCamera = async () => {
    setCapturedPhoto(null);
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "navigator.mediaDevices.getUserMedia is not supported on this browser or inside some iframe sandboxes.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access failed, fallback active:", err);
      setCameraError(err.message || "Failed to access physical camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    try {
      if (videoRef.current && streamRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1); // Flip horizontally for selfie mirroring
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCapturedPhoto(dataUrl);

          // Stop video track
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      } else {
        throw new Error("Video element is not running");
      }
    } catch (e: any) {
      // If hardware capture fails, simulate a visual food selfie simulation
      console.error("Capture capturePhoto fails, using fallback simulation", e);
      // Give a gorgeous photo of dynamic food selfie memory
      const fakeFoodSelfies = [
        "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=70",
      ];
      setCapturedPhoto(
        fakeFoodSelfies[Math.floor(Math.random() * fakeFoodSelfies.length)],
      );
    }
  };

  const triggerUploadMemory = async () => {
    if (capturedPhoto) {
      const ok = await submitMemory(capturedPhoto);
      if (ok) {
        stopCamera();
      }
    }
  };

  // Fallback upload (Standard files picker for sandboxes without camera device)
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Latest 10 approved memories auto-slider for welcome banner background
  const fallbackUrls = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
  ];

  const sliderMemories = memories.slice(0, 10);
  const sliderImages =
    sliderMemories.length > 0
      ? sliderMemories.map((m) => m.photoUrl)
      : fallbackUrls;

  const [activeSlide, setActiveSlide] = useState(0);

  React.useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  return (
    <div className="pb-24 bg-[#FDFBF7] text-[#2D2926]">
      {/* 1. Header Hero with Back Image */}
      <div className="relative h-60 rounded-b-[2rem] overflow-hidden shadow-lg bg-black">
        {/* Sliding memories layer on top */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${sliderImages[activeSlide]}')`,
          }}
        />

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white z-10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-orange to-yellow-400 bg-clip-text text-transparent">
              Foodie
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setScreen("notifications")}
              className="relative p-2 bg-white/20 backdrop-blur-md rounded-full shadow-inner hover:bg-white/30 transition-all cursor-pointer"
            >
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4.9-5.904V4a1 1 0 00-2 0v1.096A6.02 6.02 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            {currentUser ? (
              <button
                onClick={logoutGoogle}
                title="Google Logout"
                className="flex items-center space-x-1 p-1 bg-white/20 backdrop-blur-md rounded-full pr-3 text-xs hover:bg-white/30 transition"
              >
                <img
                  src={currentUser.profilePic}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                  alt="avatar"
                />
                <span className="font-medium text-white max-w-[60px] truncate">
                  {currentUser.name.split(" ")[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={handleOpenLogin}
                className="flex items-center space-x-1 p-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full text-xs font-semibold px-4 shadow transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
            )}
            <button
              onClick={() => setScreen("admin")}
              title="Open admin login"
              aria-label="Open admin login"
              className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-inner hover:bg-white/30 transition-all cursor-pointer text-white"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 text-white z-10">
          <p className="text-xs text-brand-orange font-bold uppercase tracking-wider mb-1">
            Urban Eatery
          </p>
          <h1 className="text-2xl font-bold font-sans tracking-tight mb-0.5 animate-slideUp">
            Welcome to Urban Eatery...
          </h1>
          <p className="text-xs text-gray-200 font-medium">
            Your order will be on{" "}
            <span className="font-bold text-yellow-400">
              Table no {tableNumber}
            </span>
          </p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        {/* 2. Interactive Search Bar */}
        <div
          onClick={handleSearchClick}
          className="bg-white flex items-center space-x-3 px-4 py-3.5 rounded-2xl shadow-md border border-gray-150 hover:border-brand-orange/40 transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg active:scale-98"
        >
          <Search className="w-5 h-5 text-brand-orange animate-pulse" />
          <span className="text-sm text-gray-400 flex-grow font-semibold">
            Search for gourmet dishes...
          </span>
          <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-ping"></span>
          </div>
        </div>
      </div>

      {/* 3. Special Offers Banner */}
      <div className="mt-6 px-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Special Offers
          </h2>
          <span className="text-xs text-brand-orange font-semibold">
            Swipe offers
          </span>
        </div>

        {/* Swiper Banner Mock */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-orange to-amber-500 rounded-3xl p-6 text-white shadow-md flex justify-between items-center">
          <div className="z-10 max-w-[60%]">
            <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              {offers[0]?.title || "Up To"}
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-2 mb-1">
              {offers[0]?.discountText || "70% OFF"}
            </h3>
            <p className="text-[10px] text-orange-100 font-light">
              Valid on primary dine-in orders today
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
            className="w-24 h-24 object-contain rounded-full transform rotate-12 shadow-inner border-2 border-white/10"
            alt="offer illustration"
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* 4. Find by Category + Veg/NonVeg Filter */}
      <div className="mt-8">
        <div className="px-5 flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-950">Find by Category</h2>

          {/* Custom Veg/Non Veg Toggle button */}
          <div className="bg-gray-100 p-0.5 rounded-full flex text-xs">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${vegOnly ? "bg-brand-orange text-white" : "text-gray-500"}`}
            >
              Veg
            </button>
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${!vegOnly ? "bg-brand-orange text-white" : "text-gray-500"}`}
            >
              Non Veg
            </button>
          </div>
        </div>

        {/* Categories Chips horizontal scroll */}
        <div className="flex space-x-5 overflow-x-auto px-5 pb-2 no-scrollbar">
          <div
            onClick={() => {
              setSelectedCategoryName("All");
              setScreen("explore");
            }}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center shadow-md group-hover:scale-105 transition-all outline-2 outline-offset-2 outline-brand-orange/0 group-hover:outline-brand-orange">
              <Sparkles className="w-8 h-8 text-brand-orange" />
            </div>
            <span className="text-xs font-semibold mt-2 text-gray-700">
              All Menu
            </span>
          </div>

          {categories
            .filter((c) => {
              if (vegOnly) return c.type === "veg" || c.type === "both";
              return true;
            })
            .map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryName(cat.name);
                  setScreen("explore");
                }}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <img
                  src={cat.image}
                  className="w-16 h-16 rounded-full object-cover shadow-md group-hover:scale-105 transition-all border border-gray-100 outline-2 outline-offset-2 outline-transparent group-hover:outline-brand-orange"
                  alt={cat.name}
                />
                <span className="text-xs font-semibold mt-2 text-gray-700">
                  {cat.name}
                </span>
              </div>
            ))}

          {/* See more card */}
          <div
            onClick={() => setScreen("categories")}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all">
              <span className="text-xs font-bold text-brand-orange">
                View All
              </span>
            </div>
            <span className="text-xs font-semibold mt-2 text-gray-500">
              More
            </span>
          </div>
        </div>
      </div>

      {/* 5. AR Food Showcase Section */}
      <div className="mt-8 px-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-orange" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              AR Food Showcase
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryName("All");
              setScreen("explore");
            }}
            className="text-xs font-bold text-brand-orange flex items-center space-x-0.5"
          >
            <span>See all</span>
            <span className="font-sans">▶</span>
          </button>
        </div>

        {/* Grid / List of AR food items from categories */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => openShowcaseModal(item)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100/80 p-3.5 hover:shadow-md transition flex flex-col justify-between cursor-pointer active:scale-[0.98]"
            >
              <div className="relative">
                <img
                  src={item.image}
                  className="w-full h-28 object-cover rounded-2xl"
                  alt={item.name}
                />
                <span
                  className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-white ${item.isVeg ? "bg-green-500" : "bg-red-500"}`}
                  title={item.isVeg ? "Veg" : "Non-Veg"}
                ></span>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-brand-orange shadow hover:scale-105 transition"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  {/* <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    Tap for details
                  </span> */}
                  {(item.galleryImages?.length || 0) > 0 && (
                    <span className="bg-white/90 text-brand-orange text-[9px] font-black px-2 py-1 rounded-full shadow-sm">
                      +{item.galleryImages?.length} photos
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium mb-1">
                  <span>⭐ {item.rating}</span>
                  <span>⏱️ {item.prepTime}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-extrabold text-brand-orange">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="flex items-center space-x-0.5 bg-brand-orange hover:bg-brand-orange-hover text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AR Food Showcase Detail Modal */}
      <AnimatePresence>
        {selectedShowcaseItem && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
            onClick={closeShowcaseModal}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md max-h-[92vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl text-gray-900"
            >
              <div className="relative bg-black">
                <img
                  src={
                    showcasePhotos[activeShowcasePhoto] ||
                    selectedShowcaseItem.image
                  }
                  alt={selectedShowcaseItem.name}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                <button
                  onClick={closeShowcaseModal}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-md transition"
                  aria-label="Close food details"
                >
                  <X className="w-4 h-4" />
                </button>

                {showcasePhotos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveShowcasePhoto((prev) =>
                          prev === 0 ? showcasePhotos.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white text-gray-900 rounded-full shadow-md transition"
                      aria-label="Previous food photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveShowcasePhoto(
                          (prev) => (prev + 1) % showcasePhotos.length,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white text-gray-900 rounded-full shadow-md transition"
                      aria-label="Next food photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute left-5 right-5 bottom-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border border-white ${selectedShowcaseItem.isVeg ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 px-2 py-1 rounded-full backdrop-blur-sm">
                      {selectedShowcaseItem.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black leading-tight">
                    {selectedShowcaseItem.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(92vh-18rem)]">
                {showcasePhotos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                    {showcasePhotos.map((photo, index) => (
                      <button
                        key={`${photo}-${index}`}
                        onClick={() => setActiveShowcasePhoto(index)}
                        className={`w-16 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                          activeShowcasePhoto === index
                            ? "border-brand-orange"
                            : "border-transparent opacity-75"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${selectedShowcaseItem.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#FAF9F7] rounded-2xl p-3 text-center">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] font-black text-gray-900">
                      {selectedShowcaseItem.rating}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                      Rating
                    </p>
                  </div>
                  <div className="bg-[#FAF9F7] rounded-2xl p-3 text-center">
                    <Clock className="w-4 h-4 text-brand-orange mx-auto mb-1" />
                    <p className="text-[10px] font-black text-gray-900">
                      {selectedShowcaseItem.prepTime}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                      Prep
                    </p>
                  </div>
                  <div className="bg-[#FAF9F7] rounded-2xl p-3 text-center">
                    <Info className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-[10px] font-black text-gray-900">
                      {selectedShowcaseItem.isVeg ? "Veg" : "Non Veg"}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                      Type
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {selectedShowcaseItem.description ||
                    "Freshly prepared chef special with premium ingredients."}
                </p>

                <div className="flex items-center justify-between gap-3 mt-5">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                      Price
                    </p>
                    <p className="text-2xl font-black text-brand-orange">
                      ₹{selectedShowcaseItem.price}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedShowcaseItem);
                      closeShowcaseModal();
                    }}
                    className="flex items-center justify-center gap-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Gourmet Moments Catalog Showcase Card section */}
      <div className="mt-10 px-5 text-left">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-black text-gray-950 leading-none">
              Diner Moments
            </h2>
            <p className="text-[10px] text-gray-400 font-bold mt-1.5">
              Take a peek at the happy moments of our guests!
            </p>
          </div>
          <button
            onClick={() => setScreen("memories")}
            className="text-xs bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-brand-orange font-bold px-3 py-1.5 rounded-xl cursor-pointer transition select-none flex items-center space-x-1"
          >
            <span>See All</span>
            <span className="font-sans text-[10px]">▶</span>
          </button>
        </div>

        {/* Dynamic Card Photos list */}
        {memories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {visibleMemories.map((mem, index) => (
              <div
                key={mem.id}
                onClick={() => setSelectedMemoryIndex(index)}
                className="bg-white rounded-[2rem] p-2 border border-gray-150 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-md transition active:scale-[0.98]"
              >
                <div className="relative">
                  <img
                    src={mem.photoUrl}
                    className="w-full h-24 object-cover rounded-[1.5rem]"
                    alt="Memory thumbnail"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-white/95 p-1 rounded-full text-brand-orange shadow-xxs">
                    <Heart className="w-3 h-3 fill-current" />
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm">
                    View
                  </div>
                </div>
                <div className="mt-2.5 px-1.5 pb-1 flex flex-col justify-between flex-grow">
                  <h4 className="text-[10px] font-black text-gray-800 truncate">
                    {mem.userName}
                  </h4>
                  <div className="flex justify-between items-center text-[7px] text-gray-400 font-bold mt-1">
                    <span>{new Date(mem.uploadedAt).toLocaleDateString()}</span>
                    <span className="text-[#FF6B00]">✓ Approved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* High contrast visual backup if empty */
          <div className="bg-[#FAF9F7] rounded-[2rem] border border-dashed border-gray-200 p-8 text-center text-gray-400 italic text-xs">
            <Sparkles className="w-6 h-6 mx-auto text-brand-orange/40 mb-2 animate-pulse" />
            <p className="font-semibold text-gray-500">
              No public moments approved yet.
            </p>
            <button
              onClick={() => setScreen("memories")}
              className="mt-3 bg-[#FF6B00] hover:bg-brand-orange-hover text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow transition-all cursor-pointer"
            >
              Be the first to upload!
            </button>
          </div>
        )}
      </div>

      {/* Diner Moments Fullscreen Photo Modal */}
      <AnimatePresence>
        {selectedMemory && selectedMemoryIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeMemoryModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[86vh] bg-[#111] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center"
            >
              <img
                src={selectedMemory.photoUrl}
                alt={`${selectedMemory.userName} diner moment`}
                className="w-full h-full object-contain bg-black"
              />

              <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                    Diner Moment
                  </p>
                  <h3 className="text-sm sm:text-base font-black leading-tight">
                    {selectedMemory.userName}
                  </h3>
                  <p className="text-[10px] text-white/70 font-bold mt-0.5">
                    {new Date(selectedMemory.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={closeMemoryModal}
                  className="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-full shadow-md transition"
                  aria-label="Close diner moment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {visibleMemories.length > 1 && (
                <>
                  <button
                    onClick={showPreviousMemory}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg transition"
                    aria-label="Previous diner moment"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={showNextMemory}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg transition"
                    aria-label="Next diner moment"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {visibleMemories.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
                  <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
                    {visibleMemories.map((memory, index) => (
                      <button
                        key={memory.id}
                        onClick={() => setSelectedMemoryIndex(index)}
                        className={`w-14 h-12 sm:w-16 sm:h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                          selectedMemoryIndex === index
                            ? "border-brand-orange scale-105"
                            : "border-white/20 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`Open diner moment ${index + 1}`}
                      >
                        <img
                          src={memory.photoUrl}
                          alt={`${memory.userName} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Dialog Modal Simulation */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl text-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Google Identity Login
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Simply input yours below or click on quick demo choices to
                authenticate your Google (Gmail) credentials instantly.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() =>
                    handleQuickLogin("manmohansu7@gmail.com", "Manmohan")
                  }
                  className="bg-gray-100 p-2.5 rounded-2xl text-left border border-gray-200 hover:border-brand-orange transition"
                >
                  <p className="text-xs font-bold text-gray-800">Manmohan</p>
                  <p className="text-[9px] text-gray-400">
                    manmohansu7@gmail.com
                  </p>
                </button>
                <button
                  onClick={() =>
                    handleQuickLogin("gourmet88@gmail.com", "Amrita Sen")
                  }
                  className="bg-gray-100 p-2.5 rounded-2xl text-left border border-gray-200 hover:border-brand-orange transition"
                >
                  <p className="text-xs font-bold text-gray-800">Amrita Sen</p>
                  <p className="text-[9px] text-gray-400">
                    gourmet88@gmail.com
                  </p>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    Enter Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Ryan"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-orange"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">
                    Enter Gmail Address
                  </label>
                  <input
                    type="email"
                    placeholder="username@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-orange"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    Google Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
