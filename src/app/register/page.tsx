"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUser();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        router.push("/");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (e) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <a href="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <span className="font-bold text-2xl tracking-tight">Yield<span className="text-indigo-400">Sphere</span></span>
        </a>

        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl text-center">
          <p className="text-sm font-semibold text-indigo-400">🎁 New users get <span className="text-white font-bold">$50 welcome bonus</span>!</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/60 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-400 text-sm mt-2">Join thousands of traders on Blockchain.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="John"
                  className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Doe"
                  className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a strong password"
                className="w-full bg-gray-900/60 border border-gray-700 hover:border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors" />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-indigo-500" />
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
                I agree to the <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>. I understand this is a high-performance trading platform.
              </label>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating account...
                </>
              ) : "Create Free Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
