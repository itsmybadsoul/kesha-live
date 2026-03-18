"use client";

import { Gift, LockKeyhole, Sparkles } from "lucide-react";

export function MysteryBox() {
  return (
    <a href="/deposit" className="block group">
      <div className="bg-gradient-to-br from-[#1A1B1E] to-[#0D0E12] border border-indigo-500/20 rounded-3xl p-5 relative overflow-hidden transition-all hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] active:scale-[0.98]">
        {/* Animated Glow Overlay */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl group-hover:bg-fuchsia-500/10 transition-all duration-700"></div>

        <div className="flex items-center gap-5 relative z-10">
          {/* Box Icon Container */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
               <Gift className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
               <Sparkles className="absolute top-1 right-1 w-3 h-3 text-amber-400 animate-bounce" />
            </div>
            {/* Status Badge */}
            <div className="absolute -bottom-1 -right-1 bg-gray-900 border border-indigo-500/30 rounded-full px-1.5 py-0.5 text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
              Epic
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
              Mystery Box <span className="text-[10px] text-indigo-400 font-bold">Lvl 1</span>
            </h3>
            <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
              Unlock a random bonus up to <span className="text-white font-bold">$1,000 USDT</span> when you deposit <span className="text-amber-400 font-bold">$500+</span>.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-1">
             <div className="w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                <LockKeyhole className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
             </div>
             <span className="text-[8px] font-black text-gray-500 group-hover:text-indigo-400 uppercase tracking-widest">Locked</span>
          </div>
        </div>

        {/* Progress Bar (Simulated requirement) */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
           <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 group-hover:w-[15%] transition-all duration-1000"></div>
           </div>
           <span className="text-[9px] font-bold text-gray-500">0 / $500</span>
        </div>
      </div>
    </a>
  );
}
