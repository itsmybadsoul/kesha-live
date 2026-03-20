"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Wallet, Landmark, ArrowLeft, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function WithdrawPage() {
  const router = useRouter();
  const { user, balance, requestWithdraw } = useUser();
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

            <div className="space-y-6">
              {method === "CRYPTO" ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">USDT (TRC20) Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter your TRC20 destination address"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all font-mono text-sm"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Beneficiary Full Name</label>
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all text-sm font-bold"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank IBAN</label>
                      <input
                        type="text"
                        placeholder="International Bank Account Number"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all font-mono text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Beneficiary Bank Name</label>
                      <input
                        type="text"
                        placeholder="Name of your bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white focus:outline-none transition-all text-sm font-bold"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
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
