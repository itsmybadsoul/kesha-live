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
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <a href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Blockchain</a>
        </a>

        <div className="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/60 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to your account to continue trading.</p>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-900/50 p-1.5 rounded-xl border border-gray-700/50">
            <button
              type="button"
              onClick={() => setLoginType("PASSWORD")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === "PASSWORD" ? "bg-indigo-600 shadow-md text-white" : "text-gray-400 hover:text-white"}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginType("RECOVERY")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === "RECOVERY" ? "bg-amber-600 shadow-md text-white" : "text-gray-400 hover:text-white"}`}
            >
              Recovery Phrase
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            {loginType === "PASSWORD" ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <button type="button" onClick={() => {
                      toast("Please use your 12-Word Recovery Phrase to sign in, or contact support.", "warning");
                      setLoginType("RECOVERY");
                  }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            ) : (
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">12-Word Seed Phrase</label>
                  </div>
                  <textarea
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    placeholder="word1 word2 word3..."
                    rows={3}
                    className="w-full bg-gray-900/60 border border-amber-900/50 hover:border-amber-600 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-amber-500 mt-2 font-medium">Use spaces to separate your recovery words.</p>
               </div>
            )}

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-center text-gray-400 text-sm">
              Don't have an account? <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium tracking-wide">Register here</a>
            </p>
            <p className="text-center text-gray-500 text-xs mt-3">
              Locked out? <a href="/support" className="text-indigo-400 hover:text-indigo-300 font-medium">Contact Support</a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-indigo-400 transition-colors">Terms of Service</a> and{" "}
          <a href="/privacy" className="underline hover:text-indigo-400 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
