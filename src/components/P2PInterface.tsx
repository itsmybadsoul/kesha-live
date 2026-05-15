"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { ArrowRightLeft, Clock, CheckCircle2, MessageSquare, Image as ImageIcon, Send, ShieldCheck, XCircle } from "lucide-react";

export function P2PInterface() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/p2p?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
        const active = data.requests.find((r: any) => r.status !== "COMPLETED");
        if (active) setActiveRequest(active);
        else setActiveRequest(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChat = async () => {
    if (!activeRequest || activeRequest.status === "PENDING") return;
    try {
      const res = await fetch(`/api/p2p/chat?id=${activeRequest.id}`);
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
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (activeRequest?.status === "APPROVED") {
      fetchChat();
      const interval = setInterval(fetchChat, 10000);
      return () => clearInterval(interval);
    }
  }, [activeRequest]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast("Please enter a valid amount.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, type: activeTab, amount })
      });
      const data = await res.json();
      if (data.success) {
        toast(`P2P ${activeTab} request submitted successfully!`, "success");
        setAmount("");
        fetchRequests();
      } else {
        toast(data.error || "Failed to submit request", "error");
      }
    } catch (e) {
      toast("Error submitting request", "error");
    } finally {
      setLoading(false);
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
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeRequest) return;

    const msgText = newMessage;
    const msgImage = selectedImage;
    setNewMessage("");
    setSelectedImage(null);

    const optimisticMsg = {
      id: "temp_" + Date.now(),
      sender: "USER",
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
          id: activeRequest.id,
          sender: "USER",
          text: msgText,
          image: msgImage
        })
      });
      fetchChat();
    } catch (e) {
      toast("Failed to send message", "error");
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (activeRequest?.status === "APPROVED") {
      const updateElapsed = () => setElapsed(Date.now() - activeRequest.createdAt);
      updateElapsed();
      const int = setInterval(updateElapsed, 1000);
      return () => clearInterval(int);
    }
  }, [activeRequest]);

  if (activeRequest) {
    if (activeRequest.status === "PENDING") {
      return (
        <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-3xl p-8 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-black mb-2">Request Pending</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            Your request to {activeRequest.type} ${activeRequest.amount} is waiting for admin approval.
          </p>
          <div className="inline-block px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-500/20">
            Waiting in queue...
          </div>
        </div>
      );
    }

    if (activeRequest.status === "APPROVED") {
      return (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-gray-950/50 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center shrink-0">
            <div>
              <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Secure P2P Session
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {activeRequest.type} ${activeRequest.amount}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session Timer</div>
              <div className="text-lg font-mono font-black text-amber-500 tabular-nums">
                {formatTime(elapsed)}
              </div>
            </div>
          </div>

          {/* Seller Details */}
          {activeRequest.sellerName && (
            <div className="p-4 bg-indigo-500/5 border-b border-indigo-500/10 shrink-0">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-slate-400">Counterparty:</span> <span className="font-bold">{activeRequest.sellerName}</span></div>
                <div><span className="text-slate-400">Rate/Price:</span> <span className="font-bold">${activeRequest.usdPrice}</span></div>
                <div><span className="text-slate-400">Banks:</span> <span className="font-bold">{activeRequest.banks}</span></div>
                <div><span className="text-slate-400">Trust Score:</span> <span className="font-bold text-emerald-500">{activeRequest.trustRate}</span></div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                Send a message to begin the chat...
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const isUser = msg.sender === "USER";
                return (
                  <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      {isUser ? "You" : "Admin"} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-md ${
                      isUser 
                        ? "bg-indigo-600 text-white rounded-br-none" 
                        : "bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-gray-700"
                    }`}>
                      {msg.image && (
                        <img src={msg.image} alt="attachment" className="max-w-full h-auto rounded-xl mb-2 border border-black/10" />
                      )}
                      {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800 shrink-0">
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img src={selectedImage} alt="preview" className="h-20 rounded-lg border border-slate-200" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  // Request Form
  return (
    <div className="bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 md:p-8">
      <div className="flex bg-slate-200/50 dark:bg-gray-950/50 p-1 rounded-2xl mb-8">
        <button
          onClick={() => setActiveTab("BUY")}
          className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "BUY" ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-md" : "text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300"
          }`}
        >
          Buy USD
        </button>
        <button
          onClick={() => setActiveTab("SELL")}
          className={`flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
            activeTab === "SELL" ? "bg-white dark:bg-gray-800 text-rose-500 shadow-md" : "text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300"
          }`}
        >
          Sell USD
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3 ml-1">
            Amount (USD)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-black text-lg py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${
            activeTab === "BUY" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30" : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
          }`}
        >
          {loading ? "Processing..." : `Submit ${activeTab} Request`}
        </button>
      </form>

      {/* History */}
      {requests.filter(r => r.status === "COMPLETED").length > 0 && (
        <div className="mt-12">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Past Transactions</h4>
          <div className="space-y-3">
            {requests.filter(r => r.status === "COMPLETED").map((r, i) => (
              <div key={i} className="p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-700/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${r.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{r.type} ${r.amount}</div>
                    <div className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
