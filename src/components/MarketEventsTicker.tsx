"use client";

import { AlertTriangle, TrendingUp, Zap, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

const events = [
  { id: 1, type: "Flash Crash", asset: "ETH", percentage: "-12.5%", description: "Over-leveraged longs wiped out in 5 minutes.", icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, color: "border-rose-500/50 bg-rose-500/10" },
  { id: 2, type: "Moonshot", asset: "SOL", percentage: "+24.8%", description: "New major protocol partnership announced.", icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, color: "border-emerald-500/50 bg-emerald-500/10" },
  { id: 3, type: "Volatility Spike", asset: "BTC", percentage: "±5.0%", description: "High CPI data release causing erratic swings.", icon: <Zap className="w-4 h-4 text-amber-500" />, color: "border-amber-500/50 bg-amber-500/10" },
];

export function MarketEventsTicker() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const event = events[currentEventIndex];

  return (
    <div className={`transition-all duration-500 border rounded-2xl p-4 flex items-center justify-between overflow-hidden relative ${event.color}`}>
      <div className="flex items-center gap-4">
        <div className="bg-gray-900/50 p-2 rounded-xl backdrop-blur-md">
           {event.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{event.type} Detected</span>
            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${event.percentage.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : event.percentage.startsWith('-') ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {event.asset} {event.percentage}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{event.description}</p>
        </div>
      </div>
      
      <button className="hidden sm:flex bg-gray-900/80 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-gray-700 transition-colors shrink-0">
        Trade Now
      </button>

      {/* Warning Tape Overlay Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
    </div>
  );
}
