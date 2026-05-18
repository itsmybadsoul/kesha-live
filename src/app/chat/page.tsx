"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Image as ImageIcon, XCircle, ArrowLeft, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";

function ChatContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "User";
  const isP2P = searchParams.get("type") === "p2p";
  const p2pAction = searchParams.get("action");
  const p2pAmount = searchParams.get("amount");
  
  const { user, refreshUser } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for messages
  const fetchMessages = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/abu-fares/chat?email=${user.email}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Failed to fetch chat", e);
    }
  };

  const fetchFrozenBalance = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/abu-fares/frozen-balance?email=${user.email}`);
      const data = await res.json();
      setFrozenBalance(data.frozenBalance || null);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMessages();
    fetchFrozenBalance();
    const interval = setInterval(() => {
      fetchMessages();
      fetchFrozenBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Timer logic for P2P
  useEffect(() => {
    if (isP2P && messages.length > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isP2P, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!newMessage.trim() && !selectedImage) return;

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
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch("/api/abu-fares/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          sender: "USER",
          text: msgText,
          image: msgImage,
          p2pAction,
          p2pAmount
        })
      });
      fetchMessages();
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!user?.email || confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/abu-fares/frozen-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userConfirm: true })
      });
      await fetchMessages();
      await fetchFrozenBalance();
      await refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <div className="sticky top-0 z-50 w-full flex flex-col">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => window.history.back()} className="p-3 bg-white dark:bg-gray-900/50 rounded-2xl border border-slate-200 dark:border-gray-800 hover:text-indigo-500 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              {userName} <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">End-to-End Encrypted</p>
          </div>
        </div>

        {/* P2P Banner */}
        {isP2P && (
          <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-2xl p-5 mb-4 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">P2P Escrow</div>
              <div className="text-xl font-black text-slate-900 dark:text-white uppercase">
                {p2pAction} <span className="text-blue-500">${p2pAmount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl shadow-inner border border-slate-100 dark:border-gray-800">
              <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{formatTime(timer)}</span>
            </div>
          </div>
        )}

        {/* Frozen Balance Banner */}
        {frozenBalance && (
          <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <span>❄️</span> Frozen Transfer Pending
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white tracking-tighter">
                ${frozenBalance.amount.toLocaleString()} USDT
              </div>
              <div className="flex gap-3 mt-1 text-[10px] font-bold">
                <span className={frozenBalance.adminConfirmed ? "text-emerald-500" : "text-slate-400"}>
                  {frozenBalance.adminConfirmed ? "✅ Admin confirmed" : "⏳ Waiting for admin"}
                </span>
                <span className={frozenBalance.userConfirmed ? "text-emerald-500" : "text-slate-400"}>
                  {frozenBalance.userConfirmed ? "✅ You confirmed" : "⏳ Waiting for you"}
                </span>
              </div>
            </div>
            {!frozenBalance.userConfirmed ? (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {confirming ? "Confirming..." : "Confirm Receipt"}
              </button>
            ) : (
              <div className="text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Confirmed
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-900/50 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                {isP2P ? "Chat started. Send a message to initiate the timer." : "Say hi..."}
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser = msg.sender === "USER";
                return (
                  <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 px-1">
                      {isUser ? "You" : userName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl p-4 text-sm shadow-md ${
                      isUser 
                        ? "bg-indigo-600 text-white rounded-br-sm" 
                        : "bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-gray-700"
                    }`}>
                      {msg.image && (
                        <img src={msg.image} alt="attachment" className="max-w-full h-auto rounded-xl mb-3 border border-black/10 shadow-sm" />
                      )}
                      {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed font-medium">{msg.text}</p>}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            {selectedImage && (
              <div className="mb-4 relative inline-block">
                <img src={selectedImage} alt="preview" className="h-24 rounded-2xl border-2 border-indigo-500 shadow-lg object-cover" />
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
                className="p-4 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-medium"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white">Loading chat...</div>}>
      <ChatContent />
    </React.Suspense>
  );
}
