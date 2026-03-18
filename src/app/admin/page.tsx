"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Mail, Database } from "lucide-react";

export default function AdminPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
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

  useEffect(() => {
    fetchDeposits();
  }, []);

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
          <button onClick={fetchDeposits} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 transition-colors">
            Refresh Data
          </button>
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
