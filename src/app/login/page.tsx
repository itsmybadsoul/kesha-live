"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [loginType, setLoginType] = useState<"PASSWORD" | "RECOVERY">("PASSWORD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const endpoint = loginType === "PASSWORD" ? "/api/auth/login" : "/api/auth/recover";
      const body = loginType === "PASSWORD" ? { email, password } : { email, seedPhrase: seedPhrase.trim() };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        router.push("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (e) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <a href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900 dark:text-white"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 dark:from-white to-slate-500 dark:to-gray-500 bg-clip-text text-transparent">Stocks Indicators</span>
        </a>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-2xl border border-slate-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 font-medium">Sign in to your account to continue trading.</p>
          </div>

          <div className="flex gap-2 mb-8 bg-slate-50 dark:bg-gray-950/50 p-1.5 rounded-2xl border border-slate-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setLoginType("PASSWORD")}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginType === "PASSWORD" ? "bg-indigo-600 shadow-lg text-white" : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginType("RECOVERY")}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${loginType === "RECOVERY" ? "bg-amber-600 shadow-lg text-white" : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Recovery
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {loginType === "PASSWORD" ? (
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => {
                      toast("Please use your 12-Word Recovery Phrase to sign in, or contact support.", "warning");
                      setLoginType("RECOVERY");
                  }} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors">Forgot password?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-gray-700 focus:outline-none transition-all shadow-sm"
                />
              </div>
            ) : (
               <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">12-Word Seed Phrase</label>
                  </div>
                  <textarea
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    placeholder="word1 word2 word3..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-gray-900/60 border border-amber-900/30 focus:border-amber-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none transition-all font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-amber-500 mt-2 font-bold tracking-tight">Use spaces to separate your recovery words.</p>
               </div>
            )}

            {error && (
              <p className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-xl px-4 py-3 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {loading ? <span className="animate-pulse">Authenticating...</span> : "Sign In to Terminal"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-gray-800 text-center">
            <p className="text-center text-slate-400 dark:text-gray-500 text-xs font-medium">
              Don't have an account? <a href="/register" className="text-indigo-500 hover:text-indigo-400 font-black tracking-widest uppercase ml-1">Register</a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 pb-8">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-indigo-400 transition-colors">Terms of Service</a> and{" "}
          <a href="/privacy" className="underline hover:text-indigo-400 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
