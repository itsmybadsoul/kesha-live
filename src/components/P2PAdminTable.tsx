"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, XCircle, ArrowRightLeft, Clock, ShieldCheck, Send, Image as ImageIcon, Trash2 } from "lucide-react";

export function P2PAdminTable() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sellerDetails, setSellerDetails] = useState({ name: "", price: "", banks: "", trustRate: "" });
  const [balanceAmount, setBalanceAmount] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/p2p");
      const data = await res.json();
      if (data.requests) setRequests(data.requests.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async (id: string) => {
    try {
      const res = await fetch(`/api/p2p/chat?id=${id}`);
      const data = await res.json();
      if (data.messages) {
        setChatMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchChat(activeChat);
      const interval = setInterval(() => fetchChat(activeChat), 10000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatMessages]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/admin/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" })
      });
      const data = await res.json();
      if (data.success) {
        toast("P2P Request Approved", "success");
        fetchRequests();
      }
    } catch (e) {
      toast("Action failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request and its chat?")) return;
    try {
      const res = await fetch("/api/admin/p2p/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast("P2P Request Deleted", "success");
        if (activeChat === id) setActiveChat(null);
        fetchRequests();
      }
    } catch (e) {
      toast("Delete failed", "error");
    }
  };

  const handleUpdateDetails = async (id: string) => {
    try {
      const res = await fetch("/api/admin/p2p", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          sellerName: sellerDetails.name,
          usdPrice: Number(sellerDetails.price),
          banks: sellerDetails.banks,
          trustRate: sellerDetails.trustRate
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Seller details updated", "success");
        fetchRequests();
      }
    } catch (e) {
      toast("Update failed", "error");
    }
  };

  const handleSendBalance = async (id: string) => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      toast("Enter a valid amount to send", "warning");
      return;
    }
    if (!confirm(`Send $${balanceAmount} to this user?`)) return;

    try {
      const res = await fetch("/api/admin/p2p/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount: Number(balanceAmount) })
      });
      const data = await res.json();
      if (data.success) {
        toast("Balance Sent & Transaction Completed", "success");
        setActiveChat(null);
        fetchRequests();
      }
    } catch (e) {
      toast("Failed to send balance", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeChat) return;

    const msgText = newMessage;
    const msgImage = selectedImage;
    setNewMessage("");
    setSelectedImage(null);

    const optimisticMsg = {
      id: "temp_" + Date.now(),
      sender: "ADMIN",
      text: msgText,
      image: msgImage,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch("/api/p2p/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeChat,
          sender: "ADMIN",
          text: msgText,
          image: msgImage
        })
      });
      fetchChat(activeChat);
    } catch (e) {
      toast("Failed to send message", "error");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be smaller than 2MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const activeRequestObj = requests.find(r => r.id === activeChat);

  return (
    <>
      <div className="mt-16 mb-8 flex justify-between items-center px-4">
        <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
          P2P <span className="text-emerald-500 not-italic">Network</span> <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
        </h2>
        <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3 shadow-lg">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           {requests.filter(r => r.status === "PENDING").length} Pending
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Request ID / User</th>
                <th className="px-8 py-5">Type / Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-32 text-center text-slate-400 dark:text-gray-600 italic text-xs font-medium tracking-widest">No P2P requests found.</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border w-max ${
                          r.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>P2P_{r.type}</span>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{r.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono opacity-60">{new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="text-2xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">${r.amount}</div>
                    </td>
                    <td className="px-8 py-8">
                      <div className={`text-xs font-black uppercase tracking-widest ${
                        r.status === 'PENDING' ? 'text-amber-500' : r.status === 'APPROVED' ? 'text-indigo-500' : 'text-emerald-500'
                      }`}>
                        {r.status}
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        {r.status === 'PENDING' && (
                          <button onClick={() => handleApprove(r.id)} className="p-4 bg-emerald-500 text-white rounded-2xl hover:scale-110 hover:rotate-3 transition-all shadow-xl active:scale-95">
                            <CheckCircle2 className="w-6 h-6" />
                          </button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button onClick={() => {
                            setActiveChat(r.id);
                            setSellerDetails({ name: r.sellerName || "", price: r.usdPrice?.toString() || "", banks: r.banks || "", trustRate: r.trustRate || "" });
                            setBalanceAmount(r.amount.toString());
                          }} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95">
                            Open Workspace
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="p-4 bg-white dark:bg-gray-900 text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-200 dark:border-gray-800 transition-all active:scale-95">
                          <Trash2 className="w-6 h-6" />
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

      {activeChat && activeRequestObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
            
            {/* Left Side: Details & Actions */}
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-gray-950/50 border-r border-slate-200 dark:border-gray-800 p-6 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Manage <span className="text-indigo-500 not-italic">P2P</span></h3>
                <button onClick={() => setActiveChat(null)} className="p-2 bg-white dark:bg-gray-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-gray-700 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 rounded-2xl mb-6 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">User Details</div>
                <div className="font-bold text-sm mb-1">{activeRequestObj.email}</div>
                <div className="text-2xl font-black text-indigo-500 tracking-tighter">{activeRequestObj.type} ${activeRequestObj.amount}</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seller Configuration</div>
                <input type="text" placeholder="Seller Name" value={sellerDetails.name} onChange={(e) => setSellerDetails({...sellerDetails, name: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="number" placeholder="USD Price Rate" value={sellerDetails.price} onChange={(e) => setSellerDetails({...sellerDetails, price: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="text" placeholder="Available Banks" value={sellerDetails.banks} onChange={(e) => setSellerDetails({...sellerDetails, banks: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="text" placeholder="Trust Rate (e.g. 99%)" value={sellerDetails.trustRate} onChange={(e) => setSellerDetails({...sellerDetails, trustRate: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <button onClick={() => handleUpdateDetails(activeChat)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-colors">
                  Push Details to User
                </button>
              </div>

              <div className="mt-auto space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Finalize Transaction</div>
                <input type="number" placeholder="Exact Balance to Send" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors" />
                <button onClick={() => handleSendBalance(activeChat)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                  Send Balance
                </button>
              </div>
            </div>

            {/* Right Side: Chat */}
            <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-900">
              <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-950/30">
                <div className="font-bold text-sm">P2P Secure Chat</div>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] dark:bg-[none] bg-slate-50/50">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                    No messages yet. Send a message to start.
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isAdmin = msg.sender === "ADMIN";
                    return (
                      <div key={i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          {isAdmin ? "Admin" : "User"} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-lg ${
                          isAdmin 
                            ? "bg-indigo-600 text-white rounded-br-none" 
                            : "bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-gray-700"
                        }`}>
                          {msg.image && (
                            <img src={msg.image} alt="attachment" className="max-w-full h-auto rounded-xl mb-3 border border-black/10 shadow-sm" />
                          )}
                          {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                {selectedImage && (
                  <div className="mb-3 relative inline-block">
                    <img src={selectedImage} alt="preview" className="h-24 rounded-xl border-2 border-indigo-500 shadow-md" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message the user..."
                    className="flex-1 bg-slate-50 dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-800 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
