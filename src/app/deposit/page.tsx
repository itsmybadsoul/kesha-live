"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Wallet, Copy, CheckCircle2, ArrowLeft, Info } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function DepositPage() {
  const router = useRouter();
  const { requestDeposit, user, addNotification, isLoading } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const address = "TWyr5EAEPfp3nUEsQB5r7ZcwMZCZaZw1ut";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txid) { toast("Please fill in all fields.", "warning"); return; }
    
    setLoading(true);
    await requestDeposit(amount, txid);
    setLoading(false);
    addNotification({
      title: "Deposit Submitted",
      body: `Your deposit of $${amount} USDT is under review. Funds will be credited within 5–15 minutes.`,
      type: "deposit",
    });
    toast("Deposit request submitted! It will appear in your balance once verified.", "success");
    router.push("/");
  };

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="text-center bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
           <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-indigo-400" />
           </div>
           <h1 className="text-xl font-bold text-white mb-2">Session Required</h1>
           <p className="text-gray-400 text-sm mb-8">Please login to your secure trading account to manage funds and deposits.</p>
           <a href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
             Go to Login
           </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 md:p-10 shadow-2xl">
          
          {!user.hasDepositBonus && (
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/20 border border-indigo-500/30 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-0.5 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <div className="w-full h-full bg-gray-900 rounded-[14px] flex items-center justify-center">
                       <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-emerald-400">+5%</span>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white mb-1 tracking-tight">First-Time Deposit Bonus!</h3>
                    <p className="text-sm text-indigo-200/80 font-medium">Deposit <strong className="text-white">$100 USDT or more</strong> right now and we will instantly credit your account with a permanent <strong className="text-emerald-400">+5% Cash Bonus</strong>! (One-time only)</p>
                 </div>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Deposit USDT <Wallet className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-gray-400 mb-8">Send USDT (TRC20) to the address below. Your funds will be credited after verification.</p>

          <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 mb-8">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Network: TRON (TRC20)</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-800 px-4 py-3 rounded-xl font-mono text-sm break-all border border-gray-700/50 text-indigo-400">
                {address}
              </div>
              <button 
                onClick={handleCopy}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-95 shrink-0 shadow-lg shadow-indigo-500/20"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-400 mt-2 font-medium">Address copied to clipboard!</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
             <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-400">Minimum deposit is <span className="text-white font-bold">$10 USDT</span>. Smaller amounts may be lost.</p>
             </div>
             <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-gray-400">Average processing time: <span className="text-white font-bold">5-15 mins</span>.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Amount (USDT)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID (TXID)</label>
              <input
                type="text"
                placeholder="Paste your TRC20 transaction hash here"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : "I have made the payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
