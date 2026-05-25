"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Database, ArrowRightLeft, Activity, TrendingUp, TrendingDown, User, MessageSquare, Trash2, Target, Settings2, BarChart3, RefreshCw, Zap, Send, FileText } from "lucide-react";
import { useCrypto } from "@/context/CryptoContext";
import { P2PAdminTable } from "@/components/P2PAdminTable";
import { AbuFaresAdmin } from "@/components/AbuFaresAdmin";

export default function AdminPage() {
  const { prices } = useCrypto();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [optionsHistory, setOptionsHistory] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [customMarkets, setCustomMarkets] = useState<any[]>([]);
  const [privateAssets, setPrivateAssets] = useState<any[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifModal, setNotifModal] = useState<{ open: boolean; email: string; title: string; body: string }>({ open: false, email: "", title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  const ADMIN_PWD = "8751721901:AAFgZ-XxGhxUa7W7jDY8BDQoCVhjkJzOUvQ";

  const fetchData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [depRes, withRes, optRes, histRes, kycRes, userRes, supRes, marketRes, privateRes, actRes] = await Promise.all([
        fetch("/api/admin/deposits"),
        fetch("/api/admin/withdrawals"),
        fetch("/api/admin/options"),
        fetch("/api/admin/options/history"),
        fetch("/api/admin/kyc"),
        fetch("/api/admin/users"),
        fetch("/api/support"),
        fetch("/api/admin/market"),
        fetch("/api/admin/private"),
        fetch("/api/admin/actions")
      ]);
      const depData = await depRes.json();
      const withData = await withRes.json();
      const optData = await optRes.json();
      const histData = await histRes.json();
      const kycData = await kycRes.json();
      const userData = await userRes.json();
      const supportData = await supRes.json();
      const marketData = await marketRes.json();
      const privateData = await privateRes.json();
      const actData = await actRes.json();
      
      if (depData.deposits) setDeposits(depData.deposits);
      if (withData.withdrawals) setWithdrawals(withData.withdrawals);
      if (optData.activeTrades) setOptions(optData.activeTrades);
      if (histData.history) setOptionsHistory(histData.history);
      if (kycData.pendingKyc) setKycRequests(kycData.pendingKyc);
      if (userData.users) setAllUsers(userData.users);
      if (supportData.tickets) setSupportTickets(supportData.tickets);
      if (marketData.markets) setCustomMarkets(marketData.markets);
      if (privateData.assets) setPrivateAssets(privateData.assets);
      if (actData.logs) setActionLogs(actData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (email: string, action: string) => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action })
      });
      const data = await res.json();
      if (data.success) {
        toast(`${action === "approve" ? "✅ Approved" : "❌ Rejected"} successfully!`, action === "approve" ? "success" : "warning");
        fetchData();
      }
    } catch (e) {
      toast("Action failed.", "error");
    }
  };

  const handleKycAction = async (email: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action })
      });
      const data = await res.json();
      if (data.success) {
        toast(`KYC ${action === "approve" ? "Approved" : "Rejected"} successfully!`, action === "approve" ? "success" : "warning");
        fetchData();
      }
    } catch (e) {
      toast("KYC Action failed.", "error");
    }
  };

  const handleOptionsAction = async (userEmail: string, tradeId: string, adminResult: "WIN" | "LOSE") => {
    try {
      const res = await fetch("/api/admin/options/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, tradeId, adminResult })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Intercept pushed successfully. Account forcibly closed with ${adminResult}.`, "success");
        fetchData();
      }
    } catch (e) {
      toast("Intercept failed to deploy.", "error");
    }
  };

  const handleEditBalance = async (email: string) => {
    const newBal = prompt(`Enter new exact balance for ${email}:`);
    if (!newBal || isNaN(Number(newBal))) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newBalance: Number(newBal) })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Balance formally modified to $${newBal}.`, "success");
        fetchData();
      }
    } catch (e) {
      toast("Failed to adjust account.", "error");
    }
  };

  const handleClearTicket = async (id: string) => {
    try {
      const res = await fetch("/api/support", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast("Message wiped from institutional records.", "success");
        fetchData();
      }
    } catch (e) {
      toast("Failed to purge ticket.", "error");
    }
  };

  const handleSendNotification = async () => {
    if (!notifModal.title || !notifModal.body) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: notifModal.email, 
          notification: { 
            title: notifModal.title, 
            body: notifModal.body, 
            type: "system" 
          } 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Notification broadcasted to user device.", "success");
        setNotifModal({ open: false, email: "", title: "", body: "" });
        fetchData();
      }
    } catch (e) {
      toast("Failed to transmit alert.", "error");
    }
  };

  const handleMarketAction = async (action: "jump" | "target" | "clear", sym: string, forcedPrice?: number, forcedDuration?: number) => {
    let price;
    let durationMinutes;
    if (forcedPrice !== undefined) {
       price = forcedPrice;
       durationMinutes = forcedDuration;
    } else if (action === "jump") {
       const pr = prompt(`Enter new exact Base Price for ${sym}:`);
       if (!pr || isNaN(Number(pr))) return;
       price = Number(pr);
    } else if (action === "target") {
       const pr = prompt(`Enter Target Price for ${sym} to reach:`);
       if (!pr || isNaN(Number(pr))) return;
       const dur = prompt(`Enter Duration in minutes for ${sym} to reach the target:`);
       if (!dur || isNaN(Number(dur))) return;
       price = Number(pr);
       durationMinutes = Number(dur);
    } else if (action === "clear") {
       price = 0;
    }
    
    const currentPrice = prices[sym];
    
    try {
      const res = await fetch("/api/admin/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sym, price, durationMinutes, currentPrice })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Deployed ${action} to ${sym} successfully!`, "success");
        fetchData();
      } else {
        toast(data.error || "Action failed", "error");
      }
    } catch (e) {
      toast("Action failed.", "error");
    }
  };

  const handleQuickShift = (sym: string, percent: number) => {
    const cur = prices[sym];
    if (!cur) return;
    const dur = prompt(`How many minutes should it take to reach ${percent > 0 ? "+" : ""}${percent}% ($${(cur * (1 + percent / 100)).toLocaleString()})? (Enter 0 for instant)`);
    if (dur === null) return;
    const minutes = Number(dur);
    const target = cur * (1 + percent / 100);
    
    if (minutes <= 0) {
      handleMarketAction("jump", sym, target);
    } else {
      handleMarketAction("target", sym, target, minutes);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PWD) {
      setIsAuthorized(true);
    } else {
      toast("Invalid Admin Password", "error");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const handlePrivateAssetUpdate = async (id: string, field: string, value: any) => {
    const newAssets = privateAssets.map(a => a.id === id ? { ...a, [field]: value } : a);
    setPrivateAssets(newAssets);
    try {
      await fetch("/api/admin/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: newAssets })
      });
      toast("Private protocol asset updated.", "success");
    } catch (e) {
      toast("Failed to update private asset.", "error");
    }
  };

  const handlePrivateMarketAction = async (action: string, id: string) => {
    let price = 0;
    let duration = 0;
    
    if (action !== "clear") {
      const p = prompt("Enter target price:");
      if (!p || isNaN(Number(p))) return;
      price = Number(p);
      
      if (action === "target") {
        const d = prompt("Enter duration in minutes:");
        if (!d || isNaN(Number(d))) return;
        duration = Number(d);
      }
    }

    try {
      const res = await fetch("/api/admin/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, price, durationMinutes: duration })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Private market ${action} deployed.`, "success");
        fetchData();
      }
    } catch (e) {
      toast("Failed to deploy private manipulation.", "error");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center p-6 bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)]">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 opacity-60"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-600/20 group-hover:scale-110 transition-transform duration-700 shadow-xl">
               <ShieldCheck className="w-12 h-12 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black text-center mb-3 tracking-tighter text-slate-900 dark:text-white uppercase italic">Authority <span className="text-indigo-500 not-italic">Terminal</span></h1>
            <p className="text-slate-500 dark:text-gray-400 text-center mb-10 font-bold uppercase tracking-widest text-[10px] opacity-70">Enter encrypted access token to establish node link.</p>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Database className="w-5 h-5 text-slate-400 dark:text-gray-600 group-focus-within/input:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="AUTHORITY_SIGNATURE_KEY"
                  className="block w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-700 font-mono text-xs tracking-widest"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                Establish Secure Connection
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060607] text-slate-900 dark:text-white p-8 md:p-12 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div>
            <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
              Authority <span className="text-indigo-500 not-italic">Control</span> <ShieldCheck className="w-10 h-10 text-indigo-500" />
            </h1>
            <p className="text-slate-500 dark:text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] opacity-70">Global settlement infrastructure & funding validation</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsAuthorized(false)} className="bg-white dark:bg-gray-900/40 hover:bg-rose-500/10 hover:text-rose-400 px-6 py-3 rounded-2xl border border-slate-200 dark:border-gray-800 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
               Terminate Session
            </button>
            <button onClick={fetchData} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
              Synchronize Node
            </button>
          </div>
        </div>

        
        {/* --- TABS NAVIGATION --- */}
        <div className="flex overflow-x-auto gap-4 mb-8 pb-4 snap-x hide-scrollbar">
          {[
            { id: "overview", label: "Overview Cards" },
            { id: "settlements", label: "Settlements" },
            { id: "kyc", label: "Identity (KYC)" },
            { id: "options", label: "Contract Intercept" },
            { id: "assets", label: "Institutional Assets" },
            { id: "activity", label: "Activity Logs" },
            { id: "users", label: "User Registry" },
            { id: "support", label: "Support Inquiries" },
            { id: "p2p", label: "P2P Market" },
            { id: "abufares", label: "Abu Fares" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg snap-start ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-white dark:bg-gray-900/40 text-slate-500 hover:text-indigo-500 border border-slate-200 dark:border-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (<>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 text-indigo-500 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-6 h-6" /> 
              </div>
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Pending Funding</span>
            </div>
            <p className="text-4xl font-black tabular-nums tracking-tighter">{deposits.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="flex items-center gap-4 text-rose-500 mb-4">
               <div className="p-3 bg-rose-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Pending Withdrawals</span>
            </div>
            <p className="text-4xl font-black tabular-nums tracking-tighter">{withdrawals.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="flex items-center gap-4 text-amber-500 mb-4">
               <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Pending KYC</span>
            </div>
            <p className="text-4xl font-black tabular-nums tracking-tighter">{kycRequests.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-slate-200 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="flex items-center gap-4 text-emerald-500 mb-4">
               <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Database className="w-6 h-6" />
              </div>
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Cloud Node</span>
            </div>
            <p className="text-lg font-black text-emerald-500 uppercase tracking-widest">KV Synchronized</p>
          </div>
        </div>

        </>)} {/* End overview */}

        {activeTab === "settlements" && (<>
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-12">

        </>)} {/* End settlements */}

        {activeTab === "kyc" && (<>
        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Identity <span className="text-amber-500 not-italic">Verification</span> <ShieldCheck className="w-8 h-8 text-amber-500" />
          </h2>
          <div className="px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3 shadow-lg">
             <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
             {kycRequests.length} Pending Nodes
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Registrant Entity</th>
                  <th className="px-8 py-5 text-center">Credential Identification</th>
                  <th className="px-8 py-5 text-center">Biometric Face Match</th>
                  <th className="px-8 py-5 text-right">Validation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : kycRequests.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">REGISTRY_IDLE: No pending KYC applications.</td></tr>
                ) : (
                  kycRequests.map((k) => (
                    <tr key={k.email} className="hover:bg-amber-500/[0.02] transition-colors group">
                      <td className="px-8 py-8 font-black text-sm text-slate-900 dark:text-white">
                         <div className="flex flex-col gap-2">
                           <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border border-amber-500/20 w-max">Security_Level_2</span>
                           {k.email}
                           <span className="text-slate-400 dark:text-gray-500 text-[10px] font-mono tracking-tighter opacity-60 font-medium">{new Date(k.kycDocuments?.timestamp).toLocaleString()}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8 text-center">
                         {k.kycDocuments?.idFront ? (
                           <div className="relative inline-block group/img group-hover:z-[100] z-10 transition-all">
                             <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl blur-2xl"></div>
                             <img src={k.kycDocuments.idFront} alt="ID Document" className="h-28 w-auto rounded-xl border-2 border-slate-200 dark:border-gray-800 shadow-xl cursor-crosshair transform origin-center transition-all duration-500 hover:scale-[3.5] hover:shadow-[0_0_50px_rgba(79,70,229,0.3)] relative z-50 bg-white dark:bg-gray-950" />
                           </div>
                         ) : <span className="text-slate-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Data_Missing</span>}
                      </td>
                      <td className="px-8 py-8 text-center">
                         {k.kycDocuments?.idBack ? (
                           <div className="relative inline-block group/img group-hover:z-[100] z-10 transition-all">
                             <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl blur-2xl"></div>
                             <img src={k.kycDocuments.idBack} alt="Selfie" className="h-28 w-auto rounded-full aspect-square object-cover border-2 border-slate-200 dark:border-gray-800 shadow-xl cursor-crosshair transform origin-center transition-all duration-500 hover:scale-[3.5] hover:shadow-[0_0_50px_rgba(79,70,229,0.3)] relative z-50 bg-white dark:bg-gray-950" />
                           </div>
                         ) : <span className="text-slate-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Data_Missing</span>}
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleKycAction(k.email, "approve")} className="p-4 bg-emerald-500 text-white rounded-2xl hover:scale-110 hover:rotate-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"><CheckCircle2 className="w-6 h-6" /></button>
                          <button onClick={() => handleKycAction(k.email, "reject")} className="p-4 bg-white dark:bg-gray-900 text-slate-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl border border-slate-200 dark:border-gray-800 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all active:scale-95"><XCircle className="w-6 h-6" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        </>)} {/* End kyc */}

        {activeTab === "options" && (<>
        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Contract <span className="text-indigo-500 not-italic">Intercept</span> <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
          </h2>
          <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-3 shadow-lg">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> 
             {options.length} Live Positions
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Trader Identity</th>
                  <th className="px-8 py-5">Contract Asset</th>
                  <th className="px-8 py-5">Settlement / Prediction</th>
                  <th className="px-8 py-5">Time To Expiry</th>
                  <th className="px-8 py-5 text-right">Settlement Override (God Mode)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Live Positions...</td></tr>
                ) : options.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">MONITOR_IDLE: No active options contracts detected on the platform.</td></tr>
                ) : (
                  options.map((opt) => {
                    const timeLeftMs = Math.max(0, (opt.startTime + opt.durationMinutes * 60 * 1000) - Date.now());
                    const mins = Math.floor(timeLeftMs / 60000);
                    const isUp = opt.direction === "UP";
                    
                    return (
                      <tr key={opt.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                        <td className="px-8 py-8 font-black text-sm text-slate-900 dark:text-white">
                           <div className="flex items-center gap-4">
                             <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full"></div>
                                <img src={opt.userAvatar} alt="user" className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 relative z-10 shadow-lg" />
                             </div>
                             <div>
                               <div className="text-sm font-black">{opt.userEmail}</div>
                               <div className="text-[9px] text-slate-400 dark:text-gray-600 uppercase tracking-widest font-bold">Authenticated_User</div>
                             </div>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <div className="flex flex-col gap-1">
                             <div className="text-base font-black text-slate-900 dark:text-white tracking-tighter">{opt.asset}/USD</div>
                             <div className="text-[9px] text-indigo-500 font-black uppercase tracking-widest opacity-60">Leveraged_Binary</div>
                           </div>
                        </td>
                        <td className="px-8 py-8">
                           <div className="text-2xl font-black text-indigo-500 tabular-nums tracking-tighter">${opt.amount.toLocaleString()}</div>
                           <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                             Expected: {isUp ? "BUY / CALL" : "SELL / PUT"}
                           </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="w-40">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 tabular-nums">~{mins}m </span>
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600 animate-pulse" />
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner border border-slate-200 dark:border-gray-700/50">
                               <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${Math.max(5, (timeLeftMs / (opt.durationMinutes * 60 * 1000)) * 100)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          {opt.adminResult ? (
                            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${
                              opt.adminResult === "WIN" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10" : "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/10"
                            }`}>
                              <Activity className="w-4 h-4 animate-spin" /> INTERCEPT_ACTIVE: {opt.adminResult}
                            </div>
                          ) : (
                            <div className="flex justify-end gap-3">
                              <button onClick={() => handleOptionsAction(opt.userEmail, opt.id, "WIN")} className="px-5 py-3 bg-white dark:bg-gray-900 text-emerald-500 border-2 border-slate-200 dark:border-gray-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 group/btn active:scale-95">
                                <TrendingUp className="w-4 h-4 group-hover/btn:animate-bounce" /> Force_Profit
                              </button>
                              <button onClick={() => handleOptionsAction(opt.userEmail, opt.id, "LOSE")} className="px-5 py-3 bg-white dark:bg-gray-900 text-rose-500 border-2 border-slate-200 dark:border-gray-800 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2 group/btn active:scale-95">
                                <TrendingDown className="w-4 h-4 group-hover/btn:animate-bounce" /> Force_Loss
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        </>)} {/* End options */}

        {activeTab === "assets" && (<>
        <div className="mt-20 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic text-amber-500">
            Institutional <span className="text-slate-900 dark:text-white not-italic">Private Assets</span> <ShieldCheck className="w-8 h-8 text-amber-500" />
          </h2>
          <div className="px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 shadow-lg">
             Exclusive Synthetic Markets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Asset Identity</th>
                  <th className="px-8 py-5">Trajectory Path</th>
                  <th className="px-8 py-5">Basis Price / Vol</th>
                  <th className="px-8 py-5 text-right">Synthetic Market Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {privateAssets.map((pa) => {
                  const hasTarget = pa.targetPrice && pa.targetEndTime && pa.targetStartTime;
                  const isFinished = hasTarget && Date.now() > pa.targetEndTime;
                  const timeLeftMs = hasTarget && !isFinished ? pa.targetEndTime - Date.now() : 0;
                  const mins = Math.ceil(timeLeftMs / 60000);

                  return (
                    <tr key={pa.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                         <div className="flex flex-col gap-1">
                           <div className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                             <input 
                               type="text" 
                               value={pa.sym} 
                               onChange={(e) => handlePrivateAssetUpdate(pa.id, 'sym', e.target.value)}
                               className="bg-transparent border-none text-indigo-500 font-black text-xl w-24 focus:ring-0 uppercase p-0"
                             />
                             {hasTarget && !isFinished && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                           </div>
                           <input 
                             type="text" 
                             value={pa.name} 
                             onChange={(e) => handlePrivateAssetUpdate(pa.id, 'name', e.target.value)}
                             className="bg-transparent border-none text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest focus:ring-0 p-0 w-full"
                           />
                         </div>
                      </td>
                      <td className="px-8 py-8">
                        {hasTarget ? (
                          isFinished ? (
                            <span className="text-[9px] px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 rounded-xl uppercase font-black tracking-widest border border-slate-200 dark:border-gray-700">PATH_COMPLETED</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="text-base font-black text-amber-500 tracking-tighter tabular-nums">TARGET: ${pa.targetPrice.toFixed(pa.targetPrice < 1 ? 4 : 2)}</div>
                              <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest animate-pulse">Converging in ~{mins}m</div>
                            </div>
                          )
                        ) : (
                          <span className="text-[9px] px-3 py-1.5 bg-white dark:bg-gray-900 text-slate-300 dark:text-gray-700 rounded-xl uppercase font-black tracking-widest border border-slate-100 dark:border-gray-800 opacity-40">Static_Trajectory</span>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-widest opacity-60">Basis_Price_v_Vol</div>
                          <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-base tabular-nums tracking-tighter">
                            $
                            <input 
                              type="number" 
                              value={pa.price} 
                              onChange={(e) => handlePrivateAssetUpdate(pa.id, 'price', parseFloat(e.target.value))}
                              className="bg-transparent border-none text-amber-400 font-bold p-0 w-24 focus:ring-0"
                            />
                            <span className="text-slate-300 dark:text-gray-800 ml-1">V_INDEX:
                              <input 
                                type="number" 
                                value={pa.volatility} 
                                step="0.1"
                                onChange={(e) => handlePrivateAssetUpdate(pa.id, 'volatility', parseFloat(e.target.value))}
                                className="bg-transparent border-none text-slate-400 w-12 p-0 focus:ring-0 ml-1"
                              />
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          {hasTarget && !isFinished && (
                             <button onClick={() => handlePrivateMarketAction('clear', pa.id)} className="p-4 bg-white dark:bg-gray-900 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border-2 border-slate-200 dark:border-gray-800 hover:border-rose-500 transition-all shadow-xl active:scale-95" title="Abort Path Injection">
                               <XCircle className="w-5 h-5" />
                             </button>
                          )}
                          <button onClick={() => handlePrivateMarketAction('jump', pa.id)} className="px-6 py-4 bg-white dark:bg-gray-900 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white border-2 border-slate-200 dark:border-gray-800 hover:border-indigo-500 transition-all shadow-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 group/btn active:scale-95">
                            <Zap className="w-4 h-4 group-hover/btn:animate-pulse" /> Instant_Shift
                          </button>
                          <button onClick={() => handlePrivateMarketAction('target', pa.id)} className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 group/btn active:scale-95">
                            <Target className="w-4 h-4 group-hover/btn:animate-bounce" /> Path_Injection
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Equities <span className="text-indigo-500 not-italic">Manipulation</span> <Activity className="w-8 h-8 text-indigo-500" />
          </h2>
          <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-lg">
             {customMarkets.filter(m => m.category === 'STOCK').length} Configured Assets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                   <th className="px-8 py-5">Asset Symbol / Taxonomy</th>
                   <th className="px-8 py-5">Baseline Metrics</th>
                   <th className="px-8 py-5">Active Injection Path</th>
                   <th className="px-8 py-5 text-right">Synthetic Market Overrides</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : (
                  customMarkets.filter(m => m.category === 'STOCK').map(m => {
                    const hasTarget = m.targetPrice && m.targetEndTime && m.targetStartTime;
                    const isFinished = hasTarget && Date.now() > m.targetEndTime;
                    const timeLeftMs = hasTarget && !isFinished ? m.targetEndTime - Date.now() : 0;
                    const mins = Math.ceil(timeLeftMs / 60000);
                    return (
                      <tr key={m.sym} className="hover:bg-indigo-500/[0.02] transition-colors group">
                         <td className="px-8 py-8">
                           <div className="flex flex-col gap-1">
                             <div className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                               {m.sym}
                               {hasTarget && !isFinished && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                             </div>
                             <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest">{m.name}</div>
                           </div>
                         </td>
                         <td className="px-8 py-8">
                           <div className="flex flex-col gap-1.5">
                             <div className="text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-widest opacity-60">Basis_Price_v_Vol</div>
                             <div className="font-mono font-bold text-indigo-400 text-base tabular-nums tracking-tighter">
                               ${m.basePrice.toFixed(2)} <span className="text-slate-300 dark:text-gray-800 ml-1">V_INDEX:{m.volatility}</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-8">
                           {hasTarget ? (
                             isFinished ? (
                               <span className="text-[9px] px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 rounded-xl uppercase font-black tracking-widest border border-slate-200 dark:border-gray-700">PATH_COMPLETED</span>
                             ) : (
                               <div className="flex flex-col gap-1">
                                 <div className="text-base font-black text-emerald-500 tracking-tighter tabular-nums">TARGET: ${m.targetPrice.toFixed(2)}</div>
                                 <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest animate-pulse">Converging in ~{mins}m</div>
                               </div>
                             )
                           ) : (
                             <span className="text-[9px] px-3 py-1.5 bg-white dark:bg-gray-900 text-slate-300 dark:text-gray-700 rounded-xl uppercase font-black tracking-widest border border-slate-100 dark:border-gray-800 opacity-40">Static_Trajectory</span>
                           )}
                         </td>
                         <td className="px-8 py-8 text-right">
                           <div className="flex justify-end gap-3">
                             {hasTarget && !isFinished && (
                                <button onClick={() => handleMarketAction('clear', m.sym)} className="p-4 bg-white dark:bg-gray-900 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border-2 border-slate-200 dark:border-gray-800 hover:border-rose-500 transition-all shadow-xl active:scale-95" title="Abort Path Injection">
                                  <XCircle className="w-5 h-5" />
                                </button>
                             )}
                             <button onClick={() => handleMarketAction('target', m.sym)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95">
                               <Target className="w-4 h-4" /> Deploy_Path
                             </button>
                             <button onClick={() => handleMarketAction('jump', m.sym)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95">
                               <TrendingUp className="w-4 h-4" /> Instant_Shift
                             </button>
                           </div>
                         </td>
                      </tr>
                    )
                  })
                )}
               </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Digital <span className="text-indigo-500 not-italic">Liquidity</span> <BarChart3 className="w-8 h-8 text-indigo-500" />
          </h2>
          <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-lg">
             {customMarkets.filter(m => m.category === 'CRYPTO').length} Tracked Nodes
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                   <th className="px-8 py-5">Cryptocurrency Pair</th>
                   <th className="px-8 py-5">Real-Time Valuation</th>
                   <th className="px-8 py-5">Active Target Path</th>
                   <th className="px-8 py-5 text-right">Liquidity Manipulations</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : (
                  customMarkets.filter(m => m.category === 'CRYPTO').map(m => {
                    const hasTarget = m.targetPrice && m.targetEndTime && m.targetStartTime;
                    const isFinished = hasTarget && Date.now() > m.targetEndTime;
                    const timeLeftMs = hasTarget && !isFinished ? m.targetEndTime - Date.now() : 0;
                    const mins = Math.ceil(timeLeftMs / 60000);
                    return (
                      <tr key={m.sym} className="hover:bg-indigo-500/[0.02] transition-colors group">
                         <td className="px-8 py-8">
                           <div className="flex flex-col gap-1">
                             <div className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                               {m.sym}
                               {hasTarget && !isFinished && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                             </div>
                             <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest">{m.name}</div>
                           </div>
                         </td>
                         <td className="px-8 py-8">
                           <div className="flex flex-col gap-1.5">
                             <div className="text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-widest opacity-60">Exchange_Price_v_Vol</div>
                             <div className="font-mono font-bold text-indigo-400 text-base tabular-nums tracking-tighter">
                               ${(prices[m.sym] || m.basePrice) < 1 ? (prices[m.sym] || m.basePrice).toFixed(4) : (prices[m.sym] || m.basePrice).toLocaleString()} <span className="text-slate-300 dark:text-gray-800 ml-1">V_INDEX:{m.volatility}</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-8">
                           {hasTarget ? (
                             isFinished ? (
                               <span className="text-[9px] px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 rounded-xl uppercase font-black tracking-widest border border-slate-200 dark:border-gray-700">PATH_COMPLETED</span>
                             ) : (
                               <div className="flex flex-col gap-1">
                                 <div className="text-base font-black text-emerald-500 tracking-tighter tabular-nums">TARGET: ${m.targetPrice < 1 ? m.targetPrice.toFixed(4) : m.targetPrice.toLocaleString()}</div>
                                 <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest animate-pulse">Converging in ~{mins}m</div>
                               </div>
                             )
                           ) : (
                             <span className="text-[9px] px-3 py-1.5 bg-white dark:bg-gray-900 text-slate-300 dark:text-gray-700 rounded-xl uppercase font-black tracking-widest border border-slate-100 dark:border-gray-800 opacity-40">Dynamic_Basis</span>
                           )}
                         </td>
                         <td className="px-8 py-8 text-right">
                           <div className="flex flex-col gap-3">
                             <div className="flex justify-end gap-1.5">
                               {[-5, -2, -1, 1, 2, 5].map(pct => (
                                 <button 
                                   key={pct} 
                                   onClick={() => handleQuickShift(m.sym, pct)}
                                   className={`px-2 py-1 text-[8px] font-black rounded-lg border transition-all ${pct > 0 ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500 hover:text-white" : "bg-rose-500/5 text-rose-500 border-rose-500/10 hover:bg-rose-500 hover:text-white"}`}
                                 >
                                   {pct > 0 ? `+${pct}%` : `${pct}%`}
                                 </button>
                               ))}
                             </div>
                             <div className="flex justify-end gap-3">
                               {hasTarget && !isFinished && (
                                  <button onClick={() => handleMarketAction('clear', m.sym)} className="p-4 bg-white dark:bg-gray-900 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border-2 border-slate-200 dark:border-gray-800 hover:border-rose-500 transition-all shadow-xl active:scale-95" title="Abort Path Injection">
                                    <XCircle className="w-5 h-5" />
                                  </button>
                               )}
                               <button 
                                 onClick={() => handleMarketAction('jump', m.sym, 0)} 
                                 className="bg-white dark:bg-gray-900 text-slate-400 dark:text-gray-600 p-4 rounded-2xl hover:bg-indigo-500 hover:text-white border-2 border-slate-200 dark:border-gray-800 hover:border-indigo-500 transition-all shadow-xl active:scale-95" 
                                 title="Reset to Real Market"
                               >
                                 <RefreshCw className="w-5 h-5" />
                               </button>
                               <button onClick={() => handleMarketAction('target', m.sym)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95">
                                 <Target className="w-4 h-4" /> Deploy_Path
                               </button>
                               <button onClick={() => handleMarketAction('jump', m.sym)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95">
                                 <TrendingUp className="w-4 h-4" /> Instant_Shift
                               </button>
                             </div>
                           </div>
                         </td>
                      </tr>
                    )
                  })
                )}
               </tbody>
            </table>
          </div>
        </div>

        </>)} {/* End assets */}

        {activeTab === "options" && (<>
        {/* Global Operations History Archive */}
        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Settlement <span className="text-slate-400 not-italic">Archive</span> <Database className="w-8 h-8 text-slate-400 dark:text-gray-600" />
          </h2>
          <div className="px-5 py-2 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500 shadow-lg">
             {optionsHistory.length} Settled Contracts
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/20 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 opacity-80 hover:opacity-100 transition-opacity">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Settlement Timestamp</th>
                  <th className="px-8 py-5">Trader Identity</th>
                  <th className="px-8 py-5">Asset Contract</th>
                  <th className="px-8 py-5">Prediction / Strike</th>
                  <th className="px-8 py-5 text-right">Node Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : optionsHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">ARCHIVE_EMPTY: No settled trades in registry.</td></tr>
                ) : (
                  optionsHistory.map((hist, i) => {
                    const isUp = hist.direction === "UP";
                    const userWon = hist.payout && hist.payout > 0;
                    return (
                      <tr key={`${hist.id}-${i}`} className="hover:bg-slate-50 dark:hover:bg-gray-950 transition-colors">
                        <td className="px-8 py-6 text-xs font-mono text-slate-400 dark:text-gray-600 tabular-nums font-medium">
                           {new Date(hist.resolvedAt || hist.startTime).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">
                           {hist.email}
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-sm font-black text-slate-900 dark:text-white">{hist.asset}/USD</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{hist.durationMinutes}M_DURATION</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className={`text-[10px] font-black uppercase tracking-widest ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                             {hist.direction} @ ${hist.strikePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {hist.adminResult ? (
                              <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${hist.adminResult === "WIN" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border border-rose-500/20"}`}>
                                FORCED_{hist.adminResult}
                              </div>
                           ) : (
                               <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${userWon ? "text-emerald-500 bg-emerald-500/5" : "text-slate-400 dark:text-gray-700 bg-slate-100 dark:bg-gray-900"}`}>
                                 {userWon ? "NODE_WIN" : "NODE_LOSS"}
                               </div>
                           )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>


        </>)} {/* End options / archive */}

        {activeTab === "activity" && (<>
          <div className="mt-16 mb-8 flex justify-between items-center px-4">
            <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
              User <span className="text-indigo-500 not-italic">Activity</span> <FileText className="w-8 h-8 text-indigo-500" />
            </h2>
            <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-lg">
               {actionLogs.length} Events Logged
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                    <th className="px-8 py-5">Timestamp</th>
                    <th className="px-8 py-5">Entity</th>
                    <th className="px-8 py-5">Action Type</th>
                    <th className="px-8 py-5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {actionLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">LOGS_EMPTY: No recent actions detected.</td></tr>
                  ) : (
                    actionLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                        <td className="px-8 py-6 text-xs font-mono text-slate-400 dark:text-gray-600 tabular-nums font-medium">
                           {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">
                           {log.email}
                        </td>
                        <td className="px-8 py-6">
                           <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border border-indigo-500/20 w-max">{log.action}</span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 dark:text-gray-400">
                           {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>)} {/* End activity */}

        {activeTab === "users" && (<>
        {/* Global User Database */}
        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            User <span className="text-indigo-500 not-italic">Registry</span> <User className="w-8 h-8 text-indigo-500" />
          </h2>
          <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-lg">
             {allUsers.length} Authenticated Entities
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Account Holder</th>
                  <th className="px-8 py-5">Available Liquidity</th>
                  <th className="px-8 py-5">Encrypted Seed Phrase</th>
                  <th className="px-8 py-5">KYC Status</th>
                  <th className="px-8 py-5 text-right">Protocol Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : allUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">REGISTRY_EMPTY: No accounts recorded on active node.</td></tr>
                ) : (
                  allUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-indigo-500/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-4">
                            <div className="relative">
                               <div className="absolute inset-0 bg-slate-200 dark:bg-indigo-500/20 blur-lg rounded-full"></div>
                               <img src={u.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 relative z-10 shadow-lg" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-base tracking-tighter">{u.firstName} {u.lastName}</div>
                              <div className="text-[10px] text-slate-400 dark:text-gray-600 font-mono font-medium">{u.email}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="text-2xl font-black text-indigo-500 tabular-nums tracking-tighter">${u.balance.toLocaleString('en-US')}</div>
                         <div className="text-[9px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-widest mt-1 opacity-60">Liquid_Capital</div>
                      </td>
                      <td className="px-8 py-8">
                         {u.seedPhrase ? (
                           <div className="group/seed relative">
                             <div className="text-[9px] font-mono text-slate-400 dark:text-gray-700 bg-slate-50 dark:bg-gray-950/50 p-4 rounded-xl max-w-[240px] break-all border border-slate-200 dark:border-gray-800 cursor-text select-all group-hover/seed:text-slate-900 dark:group-hover/seed:text-white transition-colors tracking-tight leading-relaxed">
                               {u.seedPhrase.join(" ")}
                             </div>
                             <div className="absolute top-1 right-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover/seed:opacity-100 transition-opacity">Private</div>
                           </div>
                         ) : <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div> UNSECURED</span>}
                      </td>
                      <td className="px-8 py-8">
                         <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                           u.kycStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                           u.kycStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_100px_rgba(245,158,11,0.2)]' : 'bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-600 border-slate-200 dark:border-gray-700'
                         }`}>
                           {u.kycStatus || 'UNVERIFIED'}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <div className="flex justify-end gap-3">
                           <button onClick={() => setNotifModal({ open: true, email: u.email, title: "", body: "" })} className="p-4 bg-white dark:bg-gray-900 text-slate-400 dark:text-gray-600 hover:text-indigo-500 rounded-2xl border-2 border-slate-200 dark:border-gray-800 hover:border-indigo-500 transition-all shadow-xl active:scale-95" title="Push Protocol Alert">
                              <MessageSquare className="w-6 h-6" />
                           </button>
                           <button onClick={() => handleEditBalance(u.email)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                             Override Balance
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        </>)} {/* End users */}

        {activeTab === "support" && (<>
        {/* Support Inquiries Inbox */}
        <div className="mt-16 mb-8 flex justify-between items-center px-4">
          <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
            Support <span className="text-indigo-500 not-italic">Inquiries</span> <MessageSquare className="w-8 h-8 text-indigo-500" />
          </h2>
          <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-lg">
             {supportTickets.length} Pending Transmissions
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Registrant Entity</th>
                  <th className="px-8 py-5">Subject Payload</th>
                  <th className="px-8 py-5">Message Content</th>
                  <th className="px-8 py-5 text-right">Node Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing Authority Node...</td></tr>
                ) : supportTickets.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">INBOX_EMPTY: No pending support transmissions detected.</td></tr>
                ) : (
                  supportTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                      <td className="px-8 py-8 font-black text-sm text-slate-900 dark:text-white">
                         <div className="flex flex-col gap-2">
                           <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border border-indigo-500/20 w-max">External_Comms</span>
                           {t.email}
                           <span className="text-slate-400 dark:text-gray-500 text-[10px] font-mono tracking-tighter opacity-60 font-medium">{new Date(t.timestamp).toLocaleString('en-US')}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="text-base font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t.subject}</div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="text-xs text-slate-500 dark:text-gray-400 max-w-md bg-slate-50 dark:bg-gray-950/50 p-4 rounded-xl border border-slate-200 dark:border-gray-800 font-medium leading-relaxed italic">
                           "{t.message}"
                         </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setNotifModal({ open: true, email: t.email, title: `RE: ${t.subject}`, body: "" })} className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-110 hover:rotate-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95" title="Reply via System Notification"><Send className="w-6 h-6" /></button>
                          <button onClick={() => handleClearTicket(t.id)} className="p-4 bg-white dark:bg-gray-900 text-slate-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl border border-slate-200 dark:border-gray-800 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all active:scale-95" title="Purge Transmission"><Trash2 className="w-6 h-6" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        </>)} {/* End support */}

      {/* Notification Modal */}
      {notifModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md" onClick={() => setNotifModal({ ...notifModal, open: false })}></div>
          <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 w-full max-w-lg rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 opacity-60"></div>
            
            <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">Broadcast <span className="text-indigo-500 not-italic">Alert</span></h3>
            <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-10 font-black uppercase tracking-widest opacity-70">Transmitting system notification to node: <span className="text-indigo-500">{notifModal.email}</span></p>
            
            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 ml-1">Alert_Context_Title</label>
                <input 
                  type="text" 
                  value={notifModal.title} 
                  onChange={(e) => setNotifModal({ ...notifModal, title: e.target.value })}
                  placeholder="e.g. INFRASTRUCTURE_SYNC_REQUIRED"
                  className="w-full bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-800 font-bold"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 ml-1">Transmission_Payload</label>
                <textarea 
                  value={notifModal.body} 
                  onChange={(e) => setNotifModal({ ...notifModal, body: e.target.value })}
                  placeholder="Enter detailed protocol instructions..."
                  className="w-full bg-slate-50 dark:bg-gray-950/50 border-2 border-slate-100 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-indigo-500 outline-none transition-all min-h-[150px] resize-none placeholder:text-slate-300 dark:placeholder:text-gray-800 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => setNotifModal({ ...notifModal, open: false })}
                className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Abort
              </button>
              <button 
                onClick={handleSendNotification}
                disabled={!notifModal.title || !notifModal.body}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                Execute Transmission
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "abufares" && (<>
      <div className="mt-8">
        <AbuFaresAdmin />
      </div>
      </>)}

      {activeTab === "p2p" && (<>
      <div className="mt-8">
        <P2PAdminTable />
      </div>
      </>)}

      </div>
    </div>
  );
}
