"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, MessageSquare, Heart } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  type: "TRADE" | "REWARD" | "DEPOSIT";
  message: string;
  time: string;
  amount?: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: "1", user: "Alex trades", type: "TRADE", message: "Closed BTC Long with 120% profit!", time: "just now", amount: "$1,240" },
  { id: "2", user: "CryptoKing", type: "REWARD", message: "Completed Daily Check-in quest.", time: "2 mins ago", amount: "$5.00" },
  { id: "3", user: "Sarah_W", type: "DEPOSIT", message: "Funded wallet for Copy Trading.", time: "5 mins ago", amount: "$2,500" },
  { id: "4", user: "MoonWalker", type: "TRADE", message: "Copied WhaleHunter's ETH strategy.", time: "12 mins ago", amount: "$500" },
  { id: "5", user: "AltCoinGuru", type: "REWARD", message: "Reached Silver VIP status!", time: "20 mins ago" },
];

export function SocialSentimentFeed() {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new activity occasionally
      const names = ["user_88", "CryptoPro", "InvestorX", "BullRun", "TraderOne"];
      const newActivity: Activity = {
        id: Math.random().toString(),
        user: names[Math.floor(Math.random() * names.length)],
        type: "TRADE",
        message: "Just opened a new SOL position.",
        time: "just now",
        amount: "$" + (Math.random() * 1000).toFixed(0)
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Social Sentiment <Users className="w-5 h-5 text-indigo-400" />
        </h3>
        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5 anim-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          2,481 Online
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50 hover:border-indigo-500/30 transition-all group">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-gray-300 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{act.user}</span>
              <span className="text-[9px] text-gray-500 font-medium">{act.time}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">{act.message}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="text-gray-600 hover:text-rose-500 transition-colors flex items-center gap-1 text-[10px] font-bold">
                  <Heart className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 20)}
                </button>
                <button className="text-gray-600 hover:text-indigo-400 transition-colors flex items-center gap-1 text-[10px] font-bold">
                  <MessageSquare className="w-3.5 h-3.5" /> Reply
                </button>
              </div>
              {act.amount && (
                <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {act.amount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-gray-900/50 hover:bg-gray-700/50 text-gray-500 hover:text-white font-bold py-3 rounded-2xl transition-all text-xs border border-gray-800 flex items-center justify-center gap-2">
         Join Community Chat
      </button>
    </div>
  );
}
