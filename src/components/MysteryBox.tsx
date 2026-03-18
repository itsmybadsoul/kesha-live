"use client";

import { Gift, LockKeyhole } from "lucide-react";

export function MysteryBox() {
  return (
    <div className="bg-gradient-to-b from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden group text-center cursor-pointer transition-all hover:scale-[1.02]">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-colors duration-500"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-2xl p-[2px] shadow-2xl shadow-indigo-500/40 mb-6 group-hover:rotate-12 transition-transform duration-500">
          <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center border border-indigo-400/20 relative">
             <Gift className="w-10 h-10 text-indigo-400 group-hover:text-fuchsia-400 transition-colors" />
             
             {/* sparkles */}
             <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>

        <h3 className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 mb-2">
          Mystery Crypto Box
        </h3>
        <p className="text-sm text-gray-400 mb-6 max-w-[200px] leading-relaxed">
          Deposit <span className="text-white font-bold">$500+</span> to unlock a random bonus up to <span className="text-amber-400 font-bold">$1,000 USDT</span>!
        </p>

        <button className="flex items-center gap-2 bg-gray-900/80 border border-indigo-500/50 hover:bg-gray-800 text-indigo-300 font-medium py-2 px-6 rounded-full transition-colors text-sm">
          <LockKeyhole className="w-4 h-4" /> Locked
        </button>
      </div>
    </div>
  );
}
