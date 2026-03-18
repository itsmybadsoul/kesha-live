"use client";

import { useEffect, useState } from "react";
import { Timer, Zap } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function CountdownBanner() {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    if (!user?.welcomeExpiry) return;

    const calculateTime = () => {
      const now = Date.now();
      const diff = user.welcomeExpiry! - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [user?.welcomeExpiry]);

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl p-[1px] shadow-lg shadow-blue-500/20 mb-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="bg-amber-400/20 p-2 rounded-xl shrink-0">
            <Zap className="w-6 h-6 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">10% Welcome Bonus Active!</h3>
            <p className="text-blue-100/80 text-sm">Valid until {new Date(user?.welcomeExpiry || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 shrink-0">
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
