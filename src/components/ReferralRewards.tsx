"use client";

import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Users, Gift, ChevronRight, Share2, Award } from "lucide-react";
import { UsdtIcon } from "./UsdtIcon";

export function ReferralRewards() {
  const { user } = useUser();
  const { toast } = useToast();

  const milestones = [
    { count: 5, reward: "25 USDT", id: 1 },
    { count: 10, reward: "75 USDT", id: 2 },
    { count: 25, reward: "250 USDT", id: 3 },
    { count: 100, reward: "1,500 USDT", id: 4 },
  ];

  const handleInvite = () => {
    if (!user) return toast("Please login to invite friends", "error");
    const link = `https://blockchain.com/invite/${user.email?.split('@')[0] || 'crypto'}`;
    navigator.clipboard.writeText(link);
    toast("Referral link copied to clipboard!", "success");
  };

  const currentInvites = user?.referralStats?.totalInvites || 0; // Fixed default mock
  const nextMilestone = milestones.find(m => m.count > currentInvites) || milestones[milestones.length - 1];
  const progress = (currentInvites / nextMilestone.count) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-gray-800/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Referral Rewards <Gift className="w-5 h-5 text-indigo-400" />
        </h3>
        <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
           <UsdtIcon className="w-2.5 h-2.5" />
           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter italic">Tether (USDT) Paid</span>
        </div>
        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="mb-6 relative z-10">
        <div className="flex justify-between items-end mb-2">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">Next Milestone: {nextMilestone.count} Friends</div>
           <div className="text-sm font-black text-indigo-400">{currentInvites} / {nextMilestone.count}</div>
        </div>
        <div className="w-full h-2.5 bg-gray-900/60 rounded-full overflow-hidden border border-gray-700/50 p-0.5">
           <div 
             className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20"
             style={{ width: `${Math.min(progress, 100)}%` }}
           ></div>
        </div>
      </div>

      <div className="bg-black/40 rounded-2xl p-4 border border-indigo-500/10 mb-6 relative z-10">
         <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Upcoming Bonus</div>
         <div className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> {nextMilestone.reward} Reward
         </div>
      </div>

      <div className="flex gap-3 relative z-10">
         <button onClick={handleInvite} className="flex-1 bg-white hover:bg-gray-100 text-gray-900 font-black py-4 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 active:scale-95 shadow-xl">
            <Share2 className="w-4 h-4" /> Invite Friend
         </button>
         <button className="bg-gray-800/80 hover:bg-gray-700 text-white font-black px-6 rounded-2xl transition-all border border-gray-700 active:scale-95">
            <Users className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
