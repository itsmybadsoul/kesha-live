"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, ShieldAlert, Lock, Users, ChevronRight } from "lucide-react";

export function AbuFaresAdmin() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeEmail, setActiveEmail] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [frozenAmount, setFrozenAmount] = useState("");
  const [frozenStatus, setFrozenStatus] = useState<any>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [greetingEditing, setGreetingEditing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load all active sessions on mount
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/abu-fares/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchGreeting();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGreeting = async () => {
    try {
      const res = await fetch("/api/abu-fares/greeting");
      const data = await res.json();
      if (data.greeting) setGreeting(data.greeting);
    } catch (e) {}
  };

  const handleSaveGreeting = async () => {
    try {
      await fetch("/api/abu-fares/greeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ greeting })
      });
      setGreetingEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (email: string) => {
    try {
      const res = await fetch(`/api/abu-fares/chat?email=${email}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFrozenStatus = async (email: string) => {
    try {
      const res = await fetch(`/api/abu-fares/frozen-balance?email=${email}`);
      const data = await res.json();
      setFrozenStatus(data.frozenBalance || null);
    } catch (e) {}
  };

  useEffect(() => {
    if (!activeEmail) return;
    fetchMessages(activeEmail);
    fetchFrozenStatus(activeEmail);
    const interval = setInterval(() => {
      fetchMessages(activeEmail);
      fetchFrozenStatus(activeEmail);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeEmail]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages.length]);

  const handleConnect = (email: string) => {
    setActiveEmail(email);
    setMessages([]);
    setFrozenStatus(null);
  };

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
        body: JSON.stringify({ email: activeEmail, amount: frozenAmount })
      });
      setFrozenAmount("");
      fetchMessages(activeEmail);
      fetchFrozenStatus(activeEmail);
    } catch (e) {
      console.error(e);
      alert("Failed to initiate frozen balance");
    }
  };

  const handleAdminRelease = async () => {
    if (!activeEmail) return;
    try {
      const res = await fetch("/api/abu-fares/frozen-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, adminRelease: true })
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      fetchMessages(activeEmail);
      fetchFrozenStatus(activeEmail);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Direct Node Routing <span className="text-xs text-slate-400 font-normal">(Abu_Fares)</span>
          </h2>
        </div>
        {/* Greeting Editor */}
        <div className="bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Welcome Message</span>
            {!greetingEditing ? (
              <button onClick={() => setGreetingEditing(true)} className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveGreeting} className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400">Save</button>
                <button onClick={() => setGreetingEditing(false)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
            )}
          </div>
          {greetingEditing ? (
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              rows={3}
            />
          ) : (
            <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed truncate">{greeting}</p>
          )}
        </div>
      </div>

      <div className="flex h-[580px]">
        {/* Sessions Sidebar */}
        <div className="w-64 shrink-0 border-r border-slate-100 dark:border-gray-800 flex flex-col">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100 dark:border-gray-800">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Sessions</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="p-4 text-xs text-slate-400 animate-pulse text-center mt-6">Scanning...</div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 italic text-center mt-6">No active sessions</div>
            ) : (
              sessions.map((email) => (
                <button
                  key={email}
                  onClick={() => handleConnect(email)}
                  className={`w-full text-left px-4 py-4 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors border-b border-slate-50 dark:border-gray-800/50 ${
                    activeEmail === email ? "bg-amber-500/10 dark:bg-amber-500/10 border-l-2 border-l-amber-500" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {email.split("@")[0]}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate font-mono">{email}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              ))
            )}
          </div>

          {/* Manual connect */}
          <div className="p-3 border-t border-slate-100 dark:border-gray-800 space-y-2">
            <input
              type="email"
              placeholder="Manual email..."
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => { if (manualEmail) handleConnect(manualEmail); }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Connect
            </button>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeEmail ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
              <Users className="w-8 h-8 opacity-30" />
              <p>Select a session to view messages</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-slate-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">{activeEmail}</div>
                    <div className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Connected as Abu_Fares</div>
                  </div>
                  {/* Freeze initiate */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Amount..."
                      value={frozenAmount}
                      onChange={(e) => setFrozenAmount(e.target.value)}
                      className="w-24 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleInitiateFrozenBalance}
                      className="bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-3 h-3" /> Freeze
                    </button>
                  </div>
                </div>
                {/* Frozen balance status — 3-step flow */}
                {frozenStatus && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] font-black uppercase tracking-widest text-cyan-500">❄️ Frozen: ${frozenStatus.amount.toLocaleString()}</div>
                      {/* Show Release button ONLY after user confirmed */}
                      {frozenStatus.userConfirmed && !frozenStatus.adminConfirmed && (
                        <button
                          onClick={handleAdminRelease}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors shrink-0 animate-pulse"
                        >
                          🚀 Release Funds
                        </button>
                      )}
                      {frozenStatus.adminConfirmed && (
                        <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">✅ Released</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-[9px] font-bold">
                      <span className="text-slate-400">Step 1 (Freeze): <span className="text-emerald-500">✅ Done</span></span>
                      <span className={frozenStatus.userConfirmed ? "text-slate-400" : "text-slate-400"}>
                        Step 2 (User): <span className={frozenStatus.userConfirmed ? "text-emerald-500" : "text-amber-400"}>
                          {frozenStatus.userConfirmed ? "✅ Confirmed" : "⏳ Waiting"}
                        </span>
                      </span>
                      <span className="text-slate-400">Step 3 (Release): <span className={frozenStatus.adminConfirmed ? "text-emerald-500" : "text-slate-500"}>{
                        frozenStatus.adminConfirmed ? "✅ Done" : "Pending"
                      }</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-gray-950/20">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs mt-10 italic">No messages yet.</div>
                ) : (
                  messages.map((msg, i) => {
                    const isAdmin = msg.sender === "ADMIN";
                    return (
                      <div key={i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-1 px-1">
                          {isAdmin ? "Abu_Fares (You)" : "User"} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                          isAdmin
                            ? "bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white"
                            : "bg-indigo-600 text-white"
                        }`}>
                          {msg.image && <img src={msg.image} className="max-w-[220px] rounded-lg mb-2" alt="img" />}
                          {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t border-slate-100 dark:border-gray-800">
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
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-xl disabled:opacity-40 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
