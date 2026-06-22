/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFoodie } from '../context/FoodieContext.js';
import { 
  Camera, Check, LogIn, LogOut, ArrowLeft, Image as ImageIcon, 
  Sparkles, ShieldAlert, Heart, Calendar, User as UserIcon, HelpCircle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function MemoriesView() {
  const {
    memories,
    setScreen,
    currentUser,
    loginGoogle,
    logoutGoogle,
    submitMemory,
    refreshAll
  } = useFoodie();

  // Load latest memories on mount
  useEffect(() => {
    refreshAll();
  }, []);

  const handleDeleteMyMemory = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete your memory photo permanently?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Successfully deleted your dining memory!");
        refreshAll();
      } else {
        toast.error("Failed to delete memory");
      }
    } catch (e) {
      toast.error("Network error deleting memory");
    }
  };

  // Google Sign-In options state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  // Camera and Image Capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
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
    setLoginEmail('');
    setLoginName('');
  };

  const handleQuickLogin = (email: string, name: string) => {
    loginGoogle(email, name);
    setShowLoginModal(false);
  };

  // Live Camera handlers
  const startCamera = async () => {
    setCapturedPhoto(null);
    setCameraError(null);
    setIsCameraActive(true);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Web camera is not supported on this browser context.");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access failed, fallback standard upload active:", err);
      setCameraError(err.message || "Failed to access physical camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    try {
      if (videoRef.current && streamRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1); // mirror selfie
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto(dataUrl);
          
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      } else {
        throw new Error("Video element is not active");
      }
    } catch (e: any) {
      console.error("Selfie capture failed, utilizing premium food fallback preview instead", e);
      const foodBackups = [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=70',
        'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=500&auto=format&fit=crop&q=70',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=70'
      ];
      setCapturedPhoto(foodBackups[Math.floor(Math.random() * foodBackups.length)]);
    }
  };

  const triggerUploadMemory = async () => {
    if (!capturedPhoto) return;
    setUploading(true);
    try {
      const ok = await submitMemory(capturedPhoto);
      if (ok) {
        stopCamera();
      }
    } catch (e) {
      toast.error('Failed to submit memory entry');
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <div className="pb-32 bg-[#FDFBF7] text-[#2D2926]">
      
      {/* Premium Header toolbar */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-[#FAF9F7] flex items-center justify-between z-30 shadow-subtle">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setScreen('home')}
            className="p-2 hover:bg-[#F4F1EE] rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-left">
            <h1 className="text-base font-black tracking-tight text-gray-900 leading-none">Diner Memories</h1>
            <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">Our Happy Gourmet Moments</span>
          </div>
        </div>
        <span className="text-xs font-mono font-black text-white bg-brand-orange px-2.5 py-1 rounded-sm shadow-xs">
          {memories.length} LIVE
        </span>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Memory uploading dashboard area */}
        <div className="bg-gradient-to-br from-[#1F1D1B] to-[#121110] rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2.5 text-left">
              <div className="p-2.5 bg-brand-orange/15 rounded-2xl border border-brand-orange/20 text-brand-orange">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Share Your Dining Memory!
                </h2>
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-0.5">
                  Snap some dishes or your happy faces. Once approved, it will showcase on our home page wall!
                </p>
              </div>
            </div>

            {currentUser ? (
              <div className="space-y-4">
                {/* Visual logged in card */}
                <div className="flex items-center justify-between bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.05] text-left">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={currentUser.profilePic} 
                      className="w-10 h-10 rounded-full border border-brand-orange object-cover" 
                      alt="avatar" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-100">{currentUser.name}</h4>
                      <span className="text-[9px] text-gray-400 font-mono font-bold leading-none">{currentUser.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={logoutGoogle}
                    title="Change account"
                    className="p-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-full transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Live viewpoint workspace */}
                {isCameraActive ? (
                  <div className="relative bg-[#0F0E0D] rounded-2.5xl overflow-hidden aspect-video border border-[#FF6B00]/30 flex flex-col justify-center items-center">
                    {!capturedPhoto && !cameraError && (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                    )}

                    {capturedPhoto && (
                      <img src={capturedPhoto} className="w-full h-full object-cover rounded-2.5xl" alt="captured preview" />
                    )}

                    {cameraError && (
                      <div className="p-5 text-center flex flex-col items-center">
                        <ShieldAlert className="w-8 h-8 text-amber-500 mb-2" />
                        <p className="text-[10px] text-orange-200/90 font-medium leading-relaxed max-w-[85%]">
                          {cameraError}
                        </p>
                        
                        {/* Simulated/fallback upload choice */}
                        <div className="mt-3 inline-block">
                          <label 
                            htmlFor="mem-fallback-upload" 
                            className="bg-[#FF6B00] hover:bg-[#FF8A3D] text-white text-[10px] font-bold px-3 py-2 rounded-full cursor-pointer shadow-lg transition inline-flex items-center space-x-1"
                          >
                            <ImageIcon className="w-3.5 h-3.5 mr-1" />
                            <span>Select photo from device</span>
                          </label>
                          <input 
                            type="file" 
                            id="mem-fallback-upload" 
                            accept="image/*" 
                            onChange={handleFallbackFile} 
                            className="hidden" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Camera bottom panel control buttons */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                      <button 
                        onClick={stopCamera}
                        className="text-[11px] bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-full transition"
                      >
                        Cancel
                      </button>

                      {capturedPhoto ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={startCamera}
                            className="text-[11px] bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-full transition"
                          >
                            Retake
                          </button>
                          <button 
                            disabled={uploading}
                            onClick={triggerUploadMemory}
                            className="text-[11px] bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2 rounded-full shadow transition-all flex items-center space-x-1 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{uploading ? 'Uploading...' : 'Upload Moments'}</span>
                          </button>
                        </div>
                      ) : (
                        !cameraError && (
                          <button 
                            onClick={capturePhoto}
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white p-3 rounded-full shadow-lg transition-transform active:scale-90"
                            title="Capture snapshot"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={startCamera}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-gray-950" />
                    <span>Open Camera / Upload Moments</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center bg-white/[0.02] border border-dashed border-white/10 p-5 rounded-2xl flex flex-col items-center">
                <p className="text-xs text-gray-400 max-w-[85%] leading-relaxed mb-4">
                  Please sign in with your mock google account to capture dining logs.
                </p>
                <button 
                  onClick={handleOpenLogin}
                  className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-6 rounded-full shadow transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Verify Identity</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Gallery Feed of Approved Customer Memories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h3 className="text-sm font-black text-gray-950 leading-none">Public Moments Gallery</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Real memories captured by returning foodies</p>
            </div>
            <Sparkles className="w-4 h-4 text-brand-orange animate-spin-slow" />
          </div>

          {memories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {memories.map(mem => (
                <div 
                  key={mem.id} 
                  className="bg-white rounded-[2rem] overflow-hidden shadow-xs border border-gray-150 p-2 text-left flex flex-col justify-between"
                >
                  <div className="relative">
                    <img 
                      src={mem.photoUrl} 
                      className="w-full h-32 object-cover rounded-[1.5rem]" 
                      alt="mem" 
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full text-brand-orange shadow-sm">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                    {currentUser && mem.userEmail === currentUser.email && (
                      <button 
                        onClick={() => handleDeleteMyMemory(mem.id)}
                        className="absolute top-2 left-2 bg-red-500/90 text-white p-1.5 rounded-full shadow-sm hover:bg-red-600 hover:scale-105 transition active:scale-95 cursor-pointer z-10"
                        title="Delete my memory"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-2.5 px-1.5 pb-1 flex flex-col justify-between flex-grow">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-[8px] uppercase">
                        {mem.userName.substring(0,2)}
                      </div>
                      <h4 className="text-[10px] font-black text-gray-800 truncate flex-grow">
                        {mem.userName}
                      </h4>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-gray-400 mt-1 font-bold">
                      <span className="flex items-center">
                        <Calendar className="w-2.5 h-2.5 mr-0.5" />
                        {(new Date(mem.uploadedAt)).toLocaleDateString()}
                      </span>
                      <span className="text-[#FF6B00]">✓ Approved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 py-12 text-center text-gray-400 italic text-xs">
              <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <span>No live public memories uploaded yet.</span>
            </div>
          )}
        </div>

      </div>

      {/* Login Dialog Modal Simulation */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] max-w-sm w-full p-6 shadow-2xl text-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-left">Google Identity Login</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed text-left">Choose an instant shortcut to authenticate your mock Google (Gmail) credentials safely.</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  onClick={() => handleQuickLogin('manmohansu7@gmail.com', 'Manmohan')}
                  className="bg-gray-50 p-2.5 rounded-2xl text-left border border-gray-200 hover:border-brand-orange transition"
                >
                  <p className="text-xs font-bold text-gray-800">Manmohan</p>
                  <p className="text-[9px] text-gray-400">manmohansu7@gmail.com</p>
                </button>
                <button 
                  onClick={() => handleQuickLogin('gourmet88@gmail.com', 'Amrita Sen')}
                  className="bg-gray-50 p-2.5 rounded-2xl text-left border border-gray-200 hover:border-brand-orange transition"
                >
                  <p className="text-xs font-bold text-gray-800">Amrita Sen</p>
                  <p className="text-[9px] text-gray-400">gourmet88@gmail.com</p>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Your Name</label>
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
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Gmail Address</label>
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
                    Verify login
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
