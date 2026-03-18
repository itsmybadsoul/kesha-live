"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Star } from "lucide-react";

type Activity = {
  id: number;
  type: "deposit" | "withdrawal" | "upgrade";
  amount?: number;
  user: string;
  time: string;
};

const DUMMY_ACTIVITIES: Activity[] = [
  { id: 1, type: "deposit", amount: 5500, user: "User ID 84**2", time: "Just now" },
  { id: 2, type: "upgrade", user: "User ID 29**9", time: "2 min ago" },
  { id: 3, type: "withdrawal", amount: 1200, user: "User ID 71**4", time: "5 min ago" },
  { id: 4, type: "deposit", amount: 15000, user: "User ID 11**8", time: "12 min ago" },
  { id: 5, type: "deposit", amount: 850, user: "User ID 44**1", time: "18 min ago" },
];

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES);

  // Simulating live feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Math.random(),
        type: Math.random() > 0.7 ? (Math.random() > 0.5 ? "withdrawal" : "upgrade") : "deposit",
        amount: Math.floor(Math.random() * 10000) + 100,
        user: `User ID ${Math.floor(Math.random() * 90) + 10}**${Math.floor(Math.random() * 9)}`,
        time: "Just now"
      } as Activity;

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mt-8 relative overflow-hidden">
       <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-gray-300 font-bold text-sm uppercase tracking-wider">Live Platform Activity</h3>
       </div>

       <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className="flex items-center gap-4 bg-gray-900/40 p-3 rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-all cursor-default"
            style={{
              animation: index === 0 ? "slideIn 0.5s ease-out forwards" : "none",
            }}
          >
            {/* Icon */}
            <div className={`p-2 rounded-lg ${
              activity.type === "deposit" ? "bg-emerald-500/20 text-emerald-400" :
              activity.type === "withdrawal" ? "bg-red-500/20 text-red-500" :
              "bg-amber-500/20 text-amber-400"
            }`}>
              {activity.type === "deposit" && <ArrowDownLeft className="w-4 h-4" />}
              {activity.type === "withdrawal" && <ArrowUpRight className="w-4 h-4" />}
              {activity.type === "upgrade" && <Star className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {activity.user}
                <span className="text-gray-400 font-normal ml-2">
                  {activity.type === "deposit" && "deposited"}
                  {activity.type === "withdrawal" && "withdrew"}
                  {activity.type === "upgrade" && "upgraded to VIP Gold!"}
                </span>
              </p>
              {activity.amount && (
                <p className={`text-sm font-bold mt-0.5 ${
                  activity.type === "deposit" ? "text-emerald-400" : "text-white"
                }`}>
                  {activity.type === "deposit" ? "+" : "-"}${activity.amount.toLocaleString()} USDT
                </p>
              )}
            </div>

            {/* Time / Trust Badge */}
            <div className="text-right">
              <span className="text-xs text-gray-500 block mb-1">{activity.time}</span>
              {activity.type === "deposit" && (
                 <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                   <ShieldCheck className="w-3 h-3" /> Secure
                 </span>
              )}
            </div>
          </div>
        ))}
       </div>
       
       {/* Global styles for animation */}
       <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
       `}} />
    </div>
  );
}
