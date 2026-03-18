"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Wallet, Landmark, ArrowLeft, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function WithdrawPage() {
  const router = useRouter();
  const { user, balance, requestWithdraw } = useUser();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CRYPTO" | "BANK">("CRYPTO");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !details) return alert("Please fill in all fields.");
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > balance) return alert("Insufficient balance.");
    if (withdrawAmount < 20) return alert("Minimum withdrawal is $20.");

    setLoading(true);
    await requestWithdraw(amount, method, details);
    setLoading(false);
    alert("Withdrawal request submitted! Our finance team will process it within 24 hours.");
    router.push("/");
  };

  if (!user) return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white">Please login first.</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 md:p-10 shadow-2xl">
          <header className="mb-10">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
              Request Withdrawal <Landmark className="w-8 h-8 text-indigo-400" />
            </h1>
            <p className="text-gray-400 font-medium">Safe and encrypted funds settlement to your preferred method.</p>
          </header>

          <div className="mb-10 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available for Settlement</span>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                   <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" className="w-5 h-5" />
                   ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
             </div>
             <div className="hidden sm:block text-right">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Verified Asset Account</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
              onClick={() => setMethod("CRYPTO")}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                method === "CRYPTO" ? "bg-indigo-600/10 border-indigo-500 text-white" : "bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              <Wallet className={`w-8 h-8 ${method === "CRYPTO" ? "text-indigo-400" : "text-gray-600"}`} />
              <span className="text-xs font-black uppercase tracking-widest">Cryptocurrency</span>
            </button>
            <button 
              onClick={() => setMethod("BANK")}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                method === "BANK" ? "bg-indigo-600/10 border-indigo-500 text-white" : "bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              <Landmark className={`w-8 h-8 ${method === "BANK" ? "text-indigo-400" : "text-gray-600"}`} />
              <span className="text-xs font-black uppercase tracking-widest">Bank Transfer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Withdrawal Amount (USDT)</label>
              <div className="relative">
                 <input
                   type="number"
                   placeholder="0.00"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all text-lg font-bold"
                   required
                 />
                 <button 
                   type="button"
                   onClick={() => setAmount(balance.toString())}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors"
                 >
                   Withdraw All
                 </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {method === "CRYPTO" ? "USDT (TRC20) Wallet Address" : "Bank IBAN & Account Holder Name"}
              </label>
              <textarea
                placeholder={method === "CRYPTO" ? "Enter your TRC20 destination address" : "Enter IBAN, SWIFT, and Full Name"}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all font-mono text-sm resize-none"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex gap-3 p-4 bg-gray-900/80 border border-gray-800 rounded-2xl">
                  <Info className="w-5 h-5 text-gray-500 shrink-0" />
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                     Withdrawals are subject to 24-hour verification. Ensure your destination details are correct, as settlements to wrong addresses/IBANs cannot be reversed.
                  </p>
               </div>
               
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest text-xs"
               >
                 {loading ? "Processing..." : "Submit Withdrawal Request"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
