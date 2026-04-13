"use client";

import { useState } from "react";
import { MessageSquare, ShieldCheck, Mail, Send, ChevronLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function SupportPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast("Please fill all fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message })
      });
      const data = await res.json();
      if (data.success) {
        toast("Message securely transmitted to support node.", "success");
        setSubject("");
        setMessage("");
      } else {
        throw new Error(data.error);
      }
    } catch(e) {
      toast("Transmission intercept failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)]">
      <a href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold">
         <ChevronLeft className="w-4 h-4" /> Back to Login
      </a>
      
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-2xl border border-gray-700/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-50"></div>
        
        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
           <MessageSquare className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h1 className="text-3xl font-black text-center mb-2 text-white">Secure Support Node</h1>
        <p className="text-gray-400 text-center text-sm mb-8 font-medium">Transmit an encrypted message directly to our institutional administration desk.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Account Email"
                disabled={loading}
                className="block w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm text-white"
                required
              />
           </div>
           <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject Request"
                disabled={loading}
                className="block w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm text-white"
                required
              />
           </div>
           
           <div className="relative group/input border border-gray-700 rounded-2xl bg-gray-900/50 focus-within:border-indigo-500 overflow-hidden">
               <textarea
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Detail your request here. If you lost your recovery phrase, please include account verification details."
                 disabled={loading}
                 className="block w-full p-4 min-h-[120px] bg-transparent outline-none transition-all placeholder:text-gray-600 text-sm text-white resize-none"
                 required
               />
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
           >
             {loading ? <span className="animate-pulse">Transmitting...</span> : <>Transmit <Send className="w-4 h-4" /></>}
           </button>
        </form>
      </div>
    </div>
  );
}
