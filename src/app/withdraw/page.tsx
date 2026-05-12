"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Wallet, Landmark, ArrowLeft, Info, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { UsdtIcon } from "@/components/UsdtIcon";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function WithdrawPage() {
  const router = useRouter();
  const { user, balance, requestWithdraw, isLoading } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CRYPTO" | "BANK">("CRYPTO");
  const [iban, setIban] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDetails = "";
    if (method === "CRYPTO") {
      if (!cryptoAddress) { toast("Please enter your wallet address.", "warning"); return; }
      finalDetails = cryptoAddress;
    } else {
      if (!iban || !accountName || !bankName) { toast("Please fill in all banking details.", "warning"); return; }
      finalDetails = `IBAN: ${iban} | Name: ${accountName} | Bank: ${bankName}`;
    }

    if (!amount) { toast("Please enter an amount.", "warning"); return; }
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > balance) { toast("Insufficient balance.", "error"); return; }
    if (withdrawAmount < 20) { toast("Minimum withdrawal is $20.", "warning"); return; }

    setLoading(true);
    await requestWithdraw(amount, method, finalDetails);
    setLoading(false);
    toast("Withdrawal request submitted! Our finance team will process it within 24 hours.", "success");
    router.push("/");
  };

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="text-center bg-white/60 dark:bg-gray-900/40 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
           <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8 text-amber-400" />
           </div>
           <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
           <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Authentication is required to settle accounts and withdraw funds.</p>
           <a href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
             Sign In
           </a>
        </div>
      </div>
    );
  }

  if (user.kycStatus !== "VERIFIED") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="bg-white/60 dark:bg-gray-900/40 dark:bg-gray-800/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verification Required</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">In accordance with global AML regulations, institutional KYC verification is required to unlock funds settlement and withdrawals.</p>
          <button 
             onClick={() => router.push("/profile")}
             className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
             Complete KYC
          </button>
          <button onClick={() => router.push("/")} className="mt-4 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white text-sm font-bold transition-colors">
             Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Link href="/" className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors w-fit group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <header className="mb-10 relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-3 flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
              Request Settlement <Landmark className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </h1>
            <p className="text-slate-500 dark:text-gray-400 font-medium text-base">Safe and encrypted funds settlement to your preferred method.</p>
          </header>

          <div className="mb-10 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-inner">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Available Balance</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                   <UsdtIcon className="w-6 h-6" />
                   ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
             </div>
             <div className="hidden sm:block text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">Verified Account</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
            <button 
              onClick={() => setMethod("CRYPTO")}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 ${
                method === "CRYPTO" ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-gray-700"
              }`}
            >
              <Wallet className={`w-10 h-10 ${method === "CRYPTO" ? "text-indigo-500" : "text-gray-600"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cryptocurrency</span>
            </button>
            <button 
              onClick={() => setMethod("BANK")}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 ${
                method === "BANK" ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-gray-700"
              }`}
            >
              <Landmark className={`w-10 h-10 ${method === "BANK" ? "text-indigo-500" : "text-gray-600"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Bank Transfer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Withdrawal Amount (USDT)</label>
              <div className="relative">
                 <input
                   type="number"
                   placeholder="0.00"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-gray-700"
                   required
                 />
                 <button 
                   type="button"
                   onClick={() => setAmount(balance.toString())}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-widest transition-colors px-2 py-1 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10"
                 >
                   Withdraw All
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              {method === "CRYPTO" ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">USDT (TRC20) Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter your TRC20 destination address"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all font-mono text-sm placeholder:text-slate-300 dark:placeholder:text-gray-700"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Beneficiary Full Name</label>
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-gray-700"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Bank IBAN</label>
                      <input
                        type="text"
                        placeholder="International Bank Account Number"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all font-mono text-sm placeholder:text-slate-300 dark:placeholder:text-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Beneficiary Bank Name</label>
                      <input
                        type="text"
                        placeholder="Name of your bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-gray-700"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6">
               <div className="flex gap-4 p-5 bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-inner">
                  <Info className="w-6 h-6 text-slate-400 dark:text-gray-500 shrink-0" />
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium leading-relaxed">
                     Withdrawals are subject to 24-hour security verification. Ensure your destination details are correct, as settlements to wrong addresses/IBANs cannot be reversed by the protocol.
                  </p>
               </div>
               
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
               >
                 {loading ? <span className="animate-pulse">Processing Settlement...</span> : "Submit Withdrawal Request"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
