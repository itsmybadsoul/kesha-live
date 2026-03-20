"use client";
import { useUser } from "@/context/UserContext";

export function DigitalMembershipCard() {
  const { user, balance } = useUser();
  
  if (!user) return null;

  // Determine VIP Tier based on balance
  let tier = "Standard";
  let bgGradient = "from-gray-900 via-gray-800 to-black";
  let borderGlow = "border-gray-700/50";
  let iconColor = "text-gray-400";
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

  // Format serial number
  const serial = `BLOCK-${user?.email?.split('@')[0].toUpperCase().substring(0,4) || 'X'}-${new Date().getFullYear().toString().slice(-2)}00`;

  return (
    <div className={`relative overflow-hidden w-full aspect-[1.6/1] rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br ${bgGradient} border border-opacity-50 ${borderGlow} transition-all duration-700 hover:scale-[1.02]`}>
      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start">
        <h3 className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tier === 'Standard' ? 'from-white to-gray-400' : 'from-white to-white'}`}>
          Blockchain
        </h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${borderGlow} ${iconColor} bg-black/20 backdrop-blur-md`}>
          {tier} VIP
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <div>
            <p className={`text-[10px] uppercase tracking-widest font-bold opacity-70 ${textColor}`}>Cardholder Name</p>
            <p className={`text-lg font-black tracking-widest uppercase ${textColor}`}>{user.firstName} {user.lastName}</p>
          </div>
          <div className="text-right">
             <div className="w-8 h-8 rounded-full border-2 border-white/20 opacity-50"></div>
          </div>
        </div>
        <div className={`mt-2 font-mono text-xs tracking-widest opacity-60 ${textColor}`}>
          {serial}
        </div>
      </div>
    </div>
  );
}
