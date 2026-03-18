"use client";

import { CheckCircle2, CircleDashed, Gift, Zap } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function DailyQuests() {
  const { quests, completeQuest } = useUser();

  const completedCount = quests.filter((q) => q.completed).length;
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0;

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Daily Quests <Zap className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Complete tasks to earn real rewards.</p>
        </div>
        <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          {completedCount}/{quests.length} Done
        </span>
      </div>

      <div className="mb-6 relative z-10">
        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {quests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => !quest.completed && completeQuest(quest.id)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              quest.completed
                ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                : "bg-gray-900/50 border-gray-700/50 hover:border-indigo-500/40 cursor-pointer group"
            }`}
          >
            <div className="flex items-center gap-4">
              {quest.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : (
                <CircleDashed className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors shrink-0" />
              )}
              <div>
                <h3 className={`font-bold text-sm ${quest.completed ? "text-gray-400 line-through" : "text-white"}`}>
                  {quest.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
              quest.completed ? "bg-gray-800 text-gray-500" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              <Gift className="w-3 h-3" />{quest.reward}
            </div>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl text-center">
          <p className="text-emerald-400 font-bold text-sm">🎉 All quests completed! Check your balance.</p>
        </div>
      )}
    </div>
  );
}
