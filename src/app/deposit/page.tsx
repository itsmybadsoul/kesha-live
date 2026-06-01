"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Wallet, Copy, CheckCircle2, ArrowLeft, Info, ArrowRightLeft, Globe, Building2, Lock } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
export default function DepositPage() {
  const router = useRouter();
  const { requestDeposit, user, addNotification, isLoading } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"crypto" | "bank">("crypto");
  const [location, setLocation] = useState<{
    country: string;
    city: string;
    region: string;
    countryCode: string;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    async function fetchLocation() {
      setLoadingLocation(true);
      try {
        const res = await fetch("/api/location");
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
        }
      } catch (e) {
        console.error("Failed to fetch location:", e);
      } finally {
        setLoadingLocation(false);
      }
    }
    fetchLocation();
  }, []);

  const locationString = location
    ? [location.city, location.region, location.country]
        .filter(Boolean)
        .filter(val => val !== "unknown")
        .join(", ")
    : "your region";

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

          <h1 className="text-3xl md:text-4xl font-black mb-6 flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
            Deposit Funds <Wallet className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </h1>

          {/* Deposit Method Tabs */}
          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-100/80 dark:bg-gray-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-gray-800/80 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("crypto")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer ${
                activeTab === "crypto"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/50 dark:border-gray-700/30 scale-[1.02]"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              USDT (TRC20)
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer ${
                activeTab === "bank"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/50 dark:border-gray-700/30 scale-[1.02]"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Bank Deposit
            </button>
          </div>

          {activeTab === "crypto" ? (
            <>
              <p className="text-slate-500 dark:text-gray-400 mb-10 text-base">Send USDT (TRC20) to the address below. Your funds will be credited after verification.</p>

              <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 mb-10 shadow-inner">
                <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Network: TRON (TRC20)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full bg-white dark:bg-gray-800/50 px-5 py-4 rounded-2xl font-mono text-sm break-all border border-slate-200 dark:border-gray-700/50 text-indigo-500 dark:text-indigo-400 shadow-sm">
                    {address}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all active:scale-95 shrink-0 shadow-lg shadow-indigo-600/20 flex items-center justify-center cursor-pointer"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                >
                  {loading ? <span className="animate-pulse">Verifying Transaction...</span> : "Confirm Payment Submission"}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6 relative z-10 py-2">
              {loadingLocation ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-gray-500">
                  <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-black animate-pulse">Checking local banking gateways...</p>
                </div>
              ) : (
                <>
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                      <Lock className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-rose-500 tracking-tight">
                        Service Restricted
                      </h3>
                      <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                        Detected Region: <span className="text-slate-700 dark:text-gray-300 normal-case font-black">{locationString || "your region"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner space-y-4">
                    <h4 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-500" /> Direct Bank Transfer (ACH / SEPA / SWIFT)
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                      Direct Bank Deposits are currently restricted in your detected region of{" "}
                      <strong className="text-slate-900 dark:text-white">{locationString || "your region"}</strong>. Due to strict compliance guidelines, local banking licensing, and international anti-money laundering regulations, standard wire options cannot be processed in your jurisdiction.
                    </p>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3.5 items-start mt-4">
                      <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-black text-slate-800 dark:text-white mb-0.5">Recommended Alternative</h5>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                          To deposit instantly, please switch to the <strong className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => setActiveTab("crypto")}>USDT (TRC20)</strong> method. Cryptocurrency deposits are globally accessible, execute in under 15 minutes, and incur zero local transaction processing fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
