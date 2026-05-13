"use client";
import { useUser } from "@/context/UserContext";

export function DigitalMembershipCard() {
  const { user, balance } = useUser();
  
  if (!user) return null;

  // Determine VIP Tier based on balance
  let tier = "Standard";
  let bgGradient = "from-gray-900 via-gray-800 to-black";
  let borderGlow = "border-slate-300 dark:border-gray-700/50";
  let iconColor = "text-slate-500 dark:text-gray-400";
  let textColor = "text-gray-100";

  if (balance >= 50000) {
    tier = "Diamond";
    bgGradient = "from-cyan-900 via-indigo-900 to-purple-900";
    borderGlow = "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]";
    iconColor = "text-cyan-300";
  } else if (balance >= 10000) {
    tier = "Gold";
    bgGradient = "from-yellow-900 via-amber-800 to-orange-950";
    borderGlow = "border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]";
    iconColor = "text-amber-300";
  } else if (balance >= 1000) {
    tier = "Silver";
    bgGradient = "from-slate-700 via-gray-600 to-gray-900";
    borderGlow = "border-slate-300/50 shadow-[0_0_30px_rgba(203,213,225,0.2)]";
    iconColor = "text-slate-300";
  }

  // Format serial number - Generate a persistent 8-character hex ID based on email to look professional
  const hashEmail = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };
  const memberId = hashEmail(user?.email || 'unknown');
  const serial = `ID-${memberId.slice(0,4)}-${memberId.slice(4,8)}`;

  return (
    <div className={`relative overflow-hidden w-full aspect-[1.6/1] rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br ${bgGradient} border border-white/10 ${borderGlow} transition-all duration-700 hover:scale-[1.02] shadow-2xl group`}>
      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity"></div>
      
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] pointer-events-none"></div>

      {/* Decorative orbital elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-white/10 transition-colors"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">
            Stocks <span className="text-white/40 not-italic">Institutional</span>
          </h3>
          <div className="h-0.5 w-12 bg-gradient-to-r from-white/60 to-transparent"></div>
        </div>
        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 ${iconColor} bg-black/40 backdrop-blur-xl shadow-lg`}>
          {tier} VIP
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] font-black text-white/50 mb-2">Cardholder Identification</p>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-md">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="text-right">
             <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center">
                <div className="w-6 h-4 bg-gradient-to-r from-amber-400/40 to-amber-600/40 rounded-sm"></div>
             </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-white/5">
           <div className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white/60 tabular-nums">
             {serial}
           </div>
           <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
              <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
