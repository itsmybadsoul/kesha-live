"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Image as ImageIcon, ShieldAlert, XCircle, DollarSign, Lock } from "lucide-react";

export function AbuFaresAdmin() {
  const [targetEmail, setTargetEmail] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [frozenAmount, setFrozenAmount] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (email: string) => {
    try {
      const res = await fetch(`/api/abu-fares/chat?email=${email}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!activeEmail) return;
    fetchMessages(activeEmail);
    const interval = setInterval(() => fetchMessages(activeEmail), 5000);
    return () => clearInterval(interval);
  }, [activeEmail]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmail || !newMessage.trim()) return;

    const msg = newMessage;
    setNewMessage("");

    setMessages((prev) => [...prev, { id: "tmp", sender: "ADMIN", text: msg, timestamp: Date.now() }]);

    try {
      await fetch("/api/abu-fares/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, sender: "ADMIN", text: msg })
      });
      fetchMessages(activeEmail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitiateFrozenBalance = async () => {
    if (!activeEmail || !frozenAmount) return;
    
    try {
      await fetch("/api/abu-fares/frozen-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, amount: frozenAmount, adminConfirmed: true })
      });
      alert(`Frozen balance of $${frozenAmount} initiated for ${activeEmail}`);
      setFrozenAmount("");
      
      // Send a system message too
      await fetch("/api/abu-fares/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: activeEmail, 
          sender: "ADMIN", 
          text: `[SYSTEM] Admin has initiated a frozen transfer of $${frozenAmount}. Please send your screenshot and click Confirm.`
        })
      });
      fetchMessages(activeEmail);
      
    } catch (e) {
      console.error(e);
      alert("Failed to initiate frozen balance");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col h-[600px]">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-gray-800 pb-4">
        <ShieldAlert className="w-6 h-6 text-amber-500" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Direct Node Routing <span className="text-xs text-slate-400 font-normal">(Abu_Fares)</span></h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="email"
          placeholder="Target User Email..."
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button 
          onClick={() => setActiveEmail(targetEmail)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-bold transition-colors"
        >
          Connect
        </button>
      </div>

      {!activeEmail ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm">Connect to a user to route messages.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto mb-4 bg-slate-50 dark:bg-gray-950/50 rounded-xl p-4 space-y-4 border border-slate-100 dark:border-gray-800">
             {messages.length === 0 ? (
               <div className="text-center text-slate-400 text-xs mt-10">No messages yet.</div>
             ) : (
               messages.map((msg, i) => {
                 const isAdmin = msg.sender === "ADMIN";
                 return (
                   <div key={i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mb-1 px-1">
                        {isAdmin ? "You (Abu_Fares)" : "User"}
                      </div>
                      <div className={`max-w-[80%] rounded-xl p-3 text-sm ${isAdmin ? "bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white" : "bg-indigo-600 text-white"}`}>
                         {msg.image && <img src={msg.image} className="max-w-[200px] rounded-lg mb-2" alt="img" />}
                         {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                   </div>
                 )
               })
             )}
             <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2 mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
             <input 
               type="number"
               placeholder="Amount to freeze..."
               value={frozenAmount}
               onChange={(e) => setFrozenAmount(e.target.value)}
               className="flex-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
             />
             <button 
               onClick={handleInitiateFrozenBalance}
               className="bg-amber-500 hover:bg-amber-400 text-white px-4 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
             >
               <Lock className="w-3 h-3" /> Freeze Balance
             </button>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text"
              placeholder="Message as Abu_Fares..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
