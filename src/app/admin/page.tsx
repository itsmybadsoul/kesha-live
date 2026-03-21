"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Database, ArrowRightLeft, Activity, TrendingUp, TrendingDown, User, MessageSquare, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [optionsHistory, setOptionsHistory] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  const ADMIN_PWD = "8751721901:AAFgZ-XxGhxUa7W7jDY8BDQoCVhjkJzOUvQ";

  const fetchData = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [depRes, withRes, optRes, histRes, kycRes, userRes, supRes] = await Promise.all([
        fetch("/api/admin/deposits"),
        fetch("/api/admin/withdrawals"),
        fetch("/api/admin/options"),
        fetch("/api/admin/options/history"),
        fetch("/api/admin/kyc"),
        fetch("/api/admin/users"),
        fetch("/api/support")
      ]);
      const depData = await depRes.json();
      const withData = await withRes.json();
      const optData = await optRes.json();
      const histData = await histRes.json();
      const kycData = await kycRes.json();
      const userData = await userRes.json();
      const supportData = await supRes.json();
      
      if (depData.deposits) setDeposits(depData.deposits);
      if (withData.withdrawals) setWithdrawals(withData.withdrawals);
      if (optData.activeTrades) setOptions(optData.activeTrades);
      if (histData.history) setOptionsHistory(histData.history);
      if (kycData.pendingKyc) setKycRequests(kycData.pendingKyc);
      if (userData.users) setAllUsers(userData.users);
      if (supportData.tickets) setSupportTickets(supportData.tickets);
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-2xl border border-gray-700/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-50"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-center mb-2 tracking-tight">Restricted Area</h1>
            <p className="text-gray-400 text-center mb-8 font-medium">Enter administrative credential to proceed.</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Database className="w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Token Key"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tighter">
              Authority Control <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </h1>
            <p className="text-gray-400 mt-1">Manage global settlements and funding validation.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAuthorized(false)} className="bg-gray-800/50 hover:bg-rose-500/10 hover:text-rose-400 px-4 py-2 rounded-lg border border-gray-700 transition-all text-sm font-bold flex items-center gap-2">
               Sign Out
            </button>
            <button onClick={fetchData} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-indigo-500/20">
              Sync Node
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Clock className="w-5 h-5" /> <span className="font-bold uppercase text-[10px] tracking-widest">Pending Funding</span>
            </div>
            <p className="text-2xl font-black">{deposits.length}</p>
          </div>
          <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl">
             <div className="flex items-center gap-3 text-rose-400 mb-2">
              <ArrowRightLeft className="w-5 h-5" /> <span className="font-bold uppercase text-[10px] tracking-widest">Pending Withdrawals</span>
            </div>
            <p className="text-2xl font-black">{withdrawals.length}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
             <div className="flex items-center gap-3 text-amber-400 mb-2">
              <ShieldCheck className="w-5 h-5" /> <span className="font-bold uppercase text-[10px] tracking-widest">Pending KYC</span>
            </div>
            <p className="text-2xl font-black">{kycRequests.length}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
             <div className="flex items-center gap-3 text-gray-400 mb-2">
              <Database className="w-5 h-5" /> <span className="font-bold uppercase text-[10px] tracking-widest">Database Node</span>
            </div>
            <p className="text-base font-bold text-emerald-400">Cloudflare KV Active</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Context</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Details / Signature</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500 animate-pulse font-bold uppercase text-xs tracking-widest">Syncing Authority Cloud...</td></tr>
              ) : deposits.length === 0 && withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic text-sm">No pending funding requests found.</td></tr>
              ) : (
                <>
                  {/* Render Deposits */}
                  {deposits.map((d) => (
                    <tr key={d.email} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className="px-6 py-6 font-bold text-sm">
                         <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-[10px] uppercase mr-2 tracking-tighter font-black">Deposit</span>
                         {d.email}
                      </td>
                      <td className="px-6 py-6 text-xs text-gray-500 font-bold uppercase tracking-widest">USDT TRC20</td>
                      <td className="px-6 py-6 text-emerald-400 font-black text-lg">${d.pendingDeposit?.amount.toLocaleString()}</td>
                      <td className="px-6 py-6"><code className="text-[10px] text-gray-400 break-all bg-black/30 p-2 rounded">{d.pendingDeposit?.txid}</code></td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction(d.email, "approve")} className="p-2 bg-emerald-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-5 h-5" /></button>
                          <button onClick={() => handleAction(d.email, "reject")} className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"><XCircle className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Render Withdrawals */}
                  {withdrawals.map((w) => (
                    <tr key={w.email} className="hover:bg-rose-500/5 transition-colors group">
                      <td className="px-6 py-6 font-bold text-sm">
                         <span className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded text-[10px] uppercase mr-2 tracking-tighter font-black">Withdraw</span>
                         {w.email}
                      </td>
                      <td className="px-6 py-6 text-xs text-gray-400 font-bold uppercase tracking-widest">{w.pendingWithdrawal?.method}</td>
                      <td className="px-6 py-6 text-rose-400 font-black text-lg">${w.pendingWithdrawal?.amount.toLocaleString()}</td>
                      <td className="px-6 py-6"><code className="text-[10px] text-rose-300 break-all bg-black/30 p-2 rounded">{w.pendingWithdrawal?.details}</code></td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction(w.email, "approve")} className="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-rose-500/20"><CheckCircle2 className="w-5 h-5" /></button>
                          <button onClick={() => handleAction(w.email, "reject")} className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg hover:bg-rose-500/20 transition-colors"><XCircle className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* KYC Verification Queue */}
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Identity Verification Queue <ShieldCheck className="w-5 h-5 text-amber-400" />
          </h2>
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
             {kycRequests.length} Pending
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-center">Government ID</th>
                <th className="px-6 py-4 text-center">Face Match</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 animate-pulse font-bold uppercase text-xs tracking-widest">Syncing Authority Cloud...</td></tr>
              ) : kycRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic text-sm">No pending KYC applications.</td></tr>
              ) : (
                kycRequests.map((k) => (
                  <tr key={k.email} className="hover:bg-amber-500/5 transition-colors group">
                    <td className="px-6 py-6 font-bold text-sm">
                       <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded text-[10px] uppercase block w-max tracking-tighter font-black mb-1">Level 2 KYC</span>
                       {k.email}
                       <span className="block text-gray-500 text-xs mt-1">{new Date(k.kycDocuments?.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                       {k.kycDocuments?.idFront ? (
                         <div className="relative inline-block group/img group-hover:z-50 z-10 transition-all">
                           <img src={k.kycDocuments.idFront} alt="ID Document" className="h-24 w-auto rounded border border-gray-600 shadow-xl cursor-crosshair transform origin-center transition-transform hover:scale-[3.5] duration-300 relative z-50" />
                         </div>
                       ) : <span className="text-gray-500 text-xs italic">Missing</span>}
                    </td>
                    <td className="px-6 py-6 text-center">
                       {k.kycDocuments?.idBack ? (
                         <div className="relative inline-block group/img group-hover:z-50 z-10 transition-all">
                           <img src={k.kycDocuments.idBack} alt="Selfie" className="h-24 w-auto rounded border border-gray-600 shadow-xl cursor-crosshair transform origin-center transition-transform hover:scale-[3.5] duration-300 relative z-50" />
                         </div>
                       ) : <span className="text-gray-500 text-xs italic">Missing</span>}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleKycAction(k.email, "approve")} className="p-2 bg-emerald-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20"><CheckCircle2 className="w-5 h-5" /></button>
                        <button onClick={() => handleKycAction(k.email, "reject")} className="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-rose-500/20"><XCircle className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Binary Options Intercept Console */}
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Live Market Operations <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> {options.length} Active Positions
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Contract Asset</th>
                <th className="px-6 py-4">Stake / Predicted</th>
                <th className="px-6 py-4">Timer</th>
                <th className="px-6 py-4 text-right">God Mode Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500 animate-pulse font-bold uppercase text-xs tracking-widest">Syncing Live Positions...</td></tr>
              ) : options.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic text-sm">No active options contracts detected on the platform.</td></tr>
              ) : (
                options.map((opt) => {
                  const timeLeftMs = Math.max(0, (opt.startTime + opt.durationMinutes * 60 * 1000) - Date.now());
                  const mins = Math.floor(timeLeftMs / 60000);
                  const isUp = opt.direction === "UP";
                  
                  return (
                    <tr key={opt.id} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className="px-6 py-6 font-bold text-sm flex items-center gap-3">
                         <img src={opt.userAvatar} alt="user" className="w-8 h-8 rounded-full bg-gray-800" />
                         {opt.userEmail}
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-white">{opt.asset}/USD Live</td>
                      <td className="px-6 py-6">
                         <div className="text-lg font-black text-indigo-400">${opt.amount.toLocaleString()}</div>
                         <div className={`text-[10px] font-bold uppercase tracking-widest ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                           {isUp ? "Calls (Up)" : "Puts (Down)"} expected
                         </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs font-mono text-gray-400 mb-1">~{mins}m remaining</div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                           <div className="bg-indigo-500 h-full animate-pulse" style={{ width: `${Math.max(5, (timeLeftMs / (opt.durationMinutes * 60 * 1000)) * 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        {opt.adminResult ? (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest ${
                            opt.adminResult === "WIN" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}>
                            <Activity className="w-3 h-3 animate-spin" /> Manipulating: {opt.adminResult}
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOptionsAction(opt.userEmail, opt.id, "WIN")} className="px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg hover:-translate-y-1 transition-all shadow-lg flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group/btn">
                              <TrendingUp className="w-3 h-3 group-hover/btn:animate-bounce" /> Force Win
                            </button>
                            <button onClick={() => handleOptionsAction(opt.userEmail, opt.id, "LOSE")} className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-lg hover:-translate-y-1 transition-all shadow-lg flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group/btn">
                              <TrendingDown className="w-3 h-3 group-hover/btn:animate-bounce" /> Force Lose
                            </button>
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

        {/* Global Operations History Archive */}
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Global Trade History <Database className="w-5 h-5 text-gray-500" />
          </h2>
          <div className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
             {optionsHistory.length} Settled Contracts
          </div>
        </div>

        <div className="bg-gray-800/20 border border-gray-700/50 rounded-3xl overflow-hidden mb-20 opacity-80 hover:opacity-100 transition-opacity">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Settled At</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contract</th>
                <th className="px-6 py-4">Direction / Strike</th>
                <th className="px-6 py-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-600 animate-pulse font-bold uppercase text-[10px] tracking-widest">Loading history ledger...</td></tr>
              ) : optionsHistory.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-600 italic text-xs font-mono">Ledger is empty. No completed trades yet.</td></tr>
              ) : (
                optionsHistory.map((hist, i) => {
                  const isUp = hist.direction === "UP";
                  // Payout > 0 means they won.
                  const userWon = hist.payout && hist.payout > 0;
                  return (
                    <tr key={`${hist.id}-${i}`} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                         {new Date(hist.resolvedAt || hist.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-300">
                         {hist.email}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-gray-200">{hist.asset}/USD <span className="text-[10px] text-gray-500 font-mono font-medium ml-2">{hist.durationMinutes}m</span></td>
                      <td className="px-6 py-4">
                         <div className={`text-[10px] font-black uppercase tracking-widest ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                           {hist.direction} @ ${hist.strikePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {hist.adminResult ? (
                            <div className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${hist.adminResult === "WIN" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"}`}>
                               Forced {hist.adminResult}
                            </div>
                         ) : (
                             <div className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${userWon ? "text-emerald-500" : "text-gray-500"}`}>
                               {userWon ? "Won" : "Lost"}
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

        {/* Global User Database */}
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Global User Database <User className="w-5 h-5 text-indigo-400" />
          </h2>
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
             {allUsers.length} Registered Accounts
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl mb-20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Account Holder</th>
                <th className="px-6 py-4">Available Funds</th>
                <th className="px-6 py-4">Security Recovery Phrase</th>
                <th className="px-6 py-4">KYC Node</th>
                <th className="px-6 py-4 text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-600 animate-pulse font-bold uppercase text-[10px] tracking-widest">Bridging global registries...</td></tr>
              ) : allUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-600 italic text-sm">No accounts recorded on active node.</td></tr>
              ) : (
                allUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-indigo-500/5 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-700" />
                          <div>
                            <div className="font-bold text-white text-sm">{u.firstName} {u.lastName}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-black">
                       <div className="text-indigo-400">${u.balance.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                       {u.seedPhrase ? (
                         <div className="text-[9px] font-mono hover:text-white text-gray-500 bg-black/40 p-2 rounded max-w-[200px] break-all border border-gray-800 cursor-text select-all">
                           {u.seedPhrase.join(" ")}
                         </div>
                       ) : <span className="text-[10px] text-rose-500 italic block">Unsecured</span>}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                         u.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' :
                         u.kycStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'
                       }`}>
                         {u.kycStatus || 'UNVERIFIED'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleEditBalance(u.email)} className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-white shadow-lg transition-colors">
                         Edit Balance
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Support Inbox */}
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Encrypted Support Inbox <MessageSquare className="w-5 h-5 text-indigo-400" />
          </h2>
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
             {supportTickets.length} Messages
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {supportTickets.length === 0 ? (
            <div className="col-span-full py-10 text-center text-gray-600 italic text-sm bg-gray-900 border border-gray-800 rounded-2xl">Inbox is currently empty.</div>
          ) : (
             supportTickets.map(t => (
               <div key={t.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="text-[10px] text-gray-500 font-mono mb-1">{new Date(t.timestamp).toLocaleString()}</div>
                       <div className="text-sm font-bold text-indigo-400">{t.email}</div>
                     </div>
                     <button onClick={() => handleClearTicket(t.id)} className="text-gray-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="text-base font-black text-white mb-2">{t.subject}</div>
                  <p className="text-sm text-gray-400 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                     {t.message}
                  </p>
               </div>
             ))
          )}
        </div>

      </div>
    </div>
  );
}
