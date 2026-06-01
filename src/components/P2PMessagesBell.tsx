"use client";

import { MessageSquare, X, ShieldAlert, LifeBuoy, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

export function P2PMessagesBell() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [subject, setSubject] = useState("P2P Dispute");
  const [message, setMessage] = useState("");
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/p2p?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.requests) {
        // Sort active requests first, then by date
        const sorted = data.requests.sort((a: any, b: any) => {
          if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
          if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
          return b.createdAt - a.createdAt;
        });
        setRequests(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchChats();
    }
  }, [open, user?.email]);

  // Poll for messages in background every 10 seconds if user logged in
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/p2p?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.requests) {
          setRequests(data.requests);
        }
      } catch (e) {
        console.error(e);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCount = requests.filter(r => r.status !== "COMPLETED").length;

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.email) return;
    setSubmittingSupport(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          subject: `[P2P Desk] ${subject}`,
          message
        })
      });
      if (res.ok) {
        toast("Support request submitted successfully!", "success");
        setMessage("");
        setShowSupportModal(false);
      } else {
        toast("Failed to submit support ticket", "error");
      }
    } catch (err) {
      toast("Error submitting support request", "error");
    } finally {
      setSubmittingSupport(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-white/5 cursor-pointer"
        title="P2P Trading Chats"
      >
        <MessageSquare className="w-5 h-5" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-500 text-slate-900 dark:text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0F1117] border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-950 dark:text-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/20">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">P2P Trade Inbox</span>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800/50">
            {loading && requests.length === 0 ? (
              <div className="py-10 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-indigo-400 animate-spin" />
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Loading active trades...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-350 dark:text-gray-700" />
                <p className="text-xs text-slate-400 dark:text-gray-500 font-bold">No active trade chats</p>
              </div>
            ) : (
              requests.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/p2p?chatId=${r.id}`);
                  }}
                  className={`px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left ${r.status !== "COMPLETED" ? "bg-emerald-500/5" : "opacity-75"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${r.type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {r.type}
                        </span>
                        {r.isVisitorChat && (
                          <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase px-1 rounded">Visitor</span>
                        )}
                        <span className="text-xs font-bold truncate max-w-[120px] dark:text-white text-slate-900">{r.sellerName || "Trader"}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold font-mono">
                        {r.amount?.toFixed(2)} USDT • {r.currency || "USD"}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${r.status === "COMPLETED" ? "bg-slate-200 dark:bg-gray-800 text-slate-550 dark:text-slate-400" : "bg-amber-500/10 text-amber-500 animate-pulse"}`}>
                        {r.status === "COMPLETED" ? "Closed" : "Active"}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-gray-500 font-medium mt-1">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/20 flex justify-between items-center">
            <button
              onClick={() => {
                setOpen(false);
                setShowSupportModal(true);
              }}
              className="text-[10px] text-indigo-500 hover:text-indigo-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500" /> Contact Support Portal
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-gray-800 text-slate-950 dark:text-white">
            <div className="p-5 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-gray-950/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                <span className="font-black text-xs uppercase tracking-wider">Contact support portal</span>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-800 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSupportSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Subject / Department</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 dark:text-white text-slate-900"
                >
                  <option value="P2P Dispute">P2P Negotiation Dispute</option>
                  <option value="Payment Issue">Payment Not Received</option>
                  <option value="ID Verification">Identity & Fraud Hold</option>
                  <option value="Other">General Technical Support</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Explain your issue in detail</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide transaction ID, bank details, or description of counterpart behavior..."
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 dark:text-white text-slate-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingSupport}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {submittingSupport ? "Submitting Request..." : "Submit Support Request Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
