"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, Gift, Zap } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function DailyQuests() {
  const { quests, completeQuest } = useUser();

  const completedCount = quests.filter((q) => q.completed).length;
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0;

  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const handleQuestClick = (quest: any) => {
    if (quest.completed || verifyingId) return;
    
    setVerifyingId(quest.id);
    
    // Simulate a verification delay
    setTimeout(() => {
      completeQuest(quest.id);
      setVerifyingId(null);
    }, 2500);
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            Liquidity Quests <Zap className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 uppercase font-black tracking-widest">Execute operations to unlock incentives</p>
        </div>
        <div className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest">
          {completedCount} / {quests.length} Verified
        </div>
      </div>

      <div className="mb-10 relative z-10">
        <div className="h-2 w-full bg-slate-50 dark:bg-gray-950/50 rounded-full overflow-hidden border border-slate-100 dark:border-gray-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => handleQuestClick(quest)}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${
              quest.completed
                ? "bg-emerald-500/5 border-emerald-500/10 opacity-60"
                : "bg-slate-50 dark:bg-gray-950/40 border-slate-100 dark:border-gray-800 hover:border-indigo-500/30 shadow-inner"
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                {quest.completed ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                ) : verifyingId === quest.id ? (
                  <CircleDashed className="w-7 h-7 text-indigo-500 animate-spin" />
                ) : (
                  <CircleDashed className="w-7 h-7 text-slate-300 dark:text-gray-700 group-hover:text-indigo-500 transition-colors" />
                )}
              </div>
              <div>
                <h3 className={`font-black text-sm tracking-tight ${quest.completed ? "text-slate-500 dark:text-gray-500 line-through" : "text-slate-900 dark:text-white"}`}>
                  {quest.title}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-tight mt-1">{quest.description}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-lg shrink-0 uppercase tracking-widest shadow-sm ${
              quest.completed ? "bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500" : "bg-amber-500/5 text-amber-500 border border-amber-500/20"
            }`}>
              <Gift className="w-3.5 h-3.5" />{quest.reward}
            </div>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <div className="mt-10 p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl text-center shadow-lg shadow-emerald-500/5 animate-in zoom-in duration-500">
          <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">🎉 Protocol Operations Synchronized. Rewards Disbursed.</p>
        </div>
      )}
    </div>
  );
}
