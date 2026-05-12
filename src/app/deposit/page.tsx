"use client";

import Link from "next/link";
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

  const address = "TBVNCbZkHMxYT2A8hgY5j3SarjQmipTjny";

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
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="text-center bg-white/60 dark:bg-gray-900/40 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Session Required</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Please login to your secure trading account to manage funds and deposits.</p>
          <Link href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Link href="/" className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          {!user.hasDepositBonus && (
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-0.5 shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[14px] flex items-center justify-center">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-emerald-400">+5%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">First-Time Deposit Bonus!</h3>
                  <p className="text-sm text-slate-500 dark:text-indigo-200/60 font-medium">Deposit <strong className="text-slate-900 dark:text-white">$100 USDT or more</strong> and we will instantly credit your account with a permanent <strong className="text-emerald-500">+5% Cash Bonus</strong>!</p>
                </div>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-black mb-3 flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
            Deposit USDT <Wallet className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mb-10 text-base">Send USDT (TRC20) to the address below. Your funds will be credited after verification.</p>

          <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 mb-10 shadow-inner">
            <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Network: TRON (TRC20)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full bg-white dark:bg-gray-800/50 px-5 py-4 rounded-2xl font-mono text-sm break-all border border-slate-200 dark:border-gray-700/50 text-indigo-500 dark:text-indigo-400 shadow-sm">
                {address}
              </div>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all active:scale-95 shrink-0 shadow-lg shadow-indigo-600/20 flex items-center justify-center"
              >
                {copied ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-500 mt-3 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Address copied to clipboard!</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-4">
              <Info className="w-6 h-6 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Minimum deposit is <span className="text-slate-900 dark:text-white font-bold">$10 USDT</span>. Smaller amounts may be lost during transmission.</p>
            </div>
            <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
              <Info className="w-6 h-6 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Average network confirmation time: <span className="text-slate-900 dark:text-white font-bold">5-15 minutes</span> depending on load.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3 ml-1">Deposit Amount (USDT)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3 ml-1">Transaction ID (TXID)</label>
              <input
                type="text"
                placeholder="Paste your TRC20 transaction hash here"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <span className="animate-pulse">Verifying Transaction...</span> : "Confirm Payment Submission"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
