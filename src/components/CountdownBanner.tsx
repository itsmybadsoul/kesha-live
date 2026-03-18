"use client";

import { useEffect, useState } from "react";
import { Timer, Zap } from "lucide-react";

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl p-[1px] shadow-lg shadow-blue-500/20 mb-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400/20 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">10% Welcome Bonus Active!</h3>
            <p className="text-blue-100/80 text-sm">Make your first deposit within the time limit to claim.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10">
          <Timer className="w-5 h-5 text-cyan-400" />
          <div className="flex items-center gap-2 text-white font-mono text-xl font-bold">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-white/50 animate-pulse">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-white/50 animate-pulse">:</span>
            <span className="text-cyan-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
