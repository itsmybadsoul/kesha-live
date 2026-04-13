"use client";

import { Wallet } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Stocks Indicators</span>
          </a>
          <a href="/" className="text-sm text-indigo-400 hover:text-white font-bold transition-colors">← Back to Dashboard</a>
        </div>
      </nav>
 
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-3">Terms of Use</h1>
          <p className="text-gray-500 text-sm">Last updated: March 21, 2026</p>
        </div>
 
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">
 
          <section>
            <h2 className="text-lg font-black text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Stocks Indicators Platform ("Platform"), you agree to be bound by these Terms of Use. If you do not agree, you may not access the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years of age to use this Platform. By using this Platform, you represent and warrant that you meet this requirement and that your use complies with all applicable laws in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">3. Account Registration</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your sole responsibility. You agree to notify us immediately of any unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">4. Investment Risk Disclosure</h2>
            <p>All investments involve risk. Cryptocurrency markets are highly volatile. The Platform does not guarantee returns or profits. Past performance is not indicative of future results. You should only invest funds you can afford to lose entirely.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">5. Prohibited Activities</h2>
            <p>You agree not to use the Platform to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Engage in money laundering, fraud, or other illegal activities</li>
              <li>Manipulate market prices or exploit platform vulnerabilities</li>
              <li>Create multiple accounts to circumvent restrictions</li>
              <li>Use automated bots without prior written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">6. Deposits & Withdrawals</h2>
            <p>Deposits are processed upon blockchain confirmation and administrative review. Withdrawals are subject to KYC verification and may be subject to processing times of 1–5 business days. The Platform reserves the right to hold or reverse transactions if suspicious activity is detected.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">7. KYC / AML Policy</h2>
            <p>To comply with global Anti-Money Laundering (AML) regulations, we require identity verification before processing withdrawals. You agree to provide accurate and genuine documentation upon request.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Stocks Indicators Infrastructure Limited shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including lost profits or data.</p>
          </section>
 
          <section>
            <h2 className="text-lg font-black text-white mb-3">9. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes your acceptance of the revised Terms.</p>
          </section>
 
          <section>
            <h2 className="text-lg font-black text-white mb-3">10. Contact</h2>
            <p>For any questions regarding these Terms, please contact us via our <a href="/support" className="text-indigo-400 hover:text-white transition-colors font-semibold">Support Portal</a>.</p>
          </section>
        </div>
      </main>
 
      <footer className="border-t border-gray-800 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-600 font-bold uppercase tracking-widest">
          <span>© 2026 Stocks Indicators Infrastructure Limited</span>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="/support" className="hover:text-indigo-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
