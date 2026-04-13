"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0B] flex flex-col items-center justify-center">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Logo/Spinner */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] relative z-10">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Stocks Indicators</h2>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">Restoring Secure Session</p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.5em]">Institutional Infrastructure</p>
      </div>
    </div>
  );
};
