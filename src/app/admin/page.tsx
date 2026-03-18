"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Mail, Database } from "lucide-react";

export default function AdminPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const ADMIN_PWD = "8751721901:AAFgZ-XxGhxUa7W7jDY8BDQoCVhjkJzOUvQ";

  const fetchDeposits = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deposits");
      const data = await res.json();
      if (data.deposits) setDeposits(data.deposits);
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
        alert(`Deposit ${action === "approve" ? "Approved" : "Rejected"} successfully!`);
        fetchDeposits();
      }
    } catch (e) {
      alert("Action failed.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PWD) {
      setIsAuthorized(true);
    } else {
      alert("Invalid Admin Password");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchDeposits();
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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Admin Control Panel <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </h1>
            <p className="text-gray-400 mt-1">Manage pending transactions and user deposits.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsAuthorized(false)} className="bg-gray-800/50 hover:bg-rose-500/10 hover:text-rose-400 px-4 py-2 rounded-lg border border-gray-700 transition-all text-sm font-bold flex items-center gap-2">
               Sign Out
            </button>
            <button onClick={fetchDeposits} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors text-sm font-bold">
              Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Clock className="w-5 h-5" /> <span className="font-bold">Pending</span>
            </div>
            <p className="text-2xl font-black">{deposits.length}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl opacity-50">
             <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" /> <span className="font-bold">Total Processed</span>
            </div>
            <p className="text-2xl font-black">1,240</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
             <div className="flex items-center gap-3 text-gray-400 mb-2">
              <Database className="w-5 h-5" /> <span className="font-bold">System Status</span>
            </div>
            <p className="text-base font-bold text-emerald-400">Edge Runtime Syncing</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">TXID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 animate-pulse">Loading pending deposits...</td></tr>
              ) : deposits.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic text-sm">No pending deposits currently.</td></tr>
              ) : deposits.map((d) => (
                <tr key={d.email} className="hover:bg-gray-700/20 transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <img src={d.avatar} className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700" alt="" />
                      <div>
                        <p className="font-bold text-sm text-white">{d.firstName} {d.lastName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-emerald-400 font-black text-lg">${d.pendingDeposit?.amount.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-500 font-medium">USDT TRC20</p>
                  </td>
                  <td className="px-6 py-6">
                    <code className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded-md border border-gray-700 break-all max-w-[200px] inline-block">
                      {d.pendingDeposit?.txid}
                    </code>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleAction(d.email, "approve")}
                        className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                        title="Approve Deposit"
                       >
                          <CheckCircle2 className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={() => handleAction(d.email, "reject")}
                         className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5"
                         title="Reject Deposit"
                       >
                          <XCircle className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
