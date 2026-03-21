"use client";

import { Wallet } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <nav className="border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Blockchain</span>
          </a>
          <a href="/" className="text-sm text-indigo-400 hover:text-white font-bold transition-colors">← Back to Dashboard</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: March 21, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-black text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide during registration (name, email, password), identity documents for KYC verification, transaction data, and technical data such as IP addresses and browser fingerprints for fraud prevention.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>To verify your identity and comply with AML / KYC regulations</li>
              <li>To process deposits, withdrawals, and trades</li>
              <li>To send important account notifications</li>
              <li>To detect and prevent fraudulent activity</li>
              <li>To improve our services and platform experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored in encrypted Cloudflare KV storage with access controls. We employ industry-standard encryption for data in transit and at rest. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">4. KYC Document Retention</h2>
            <p>Identity documents submitted for KYC verification are retained for a minimum of 5 years in accordance with global AML regulations. You may request deletion of non-regulatory data by contacting support.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">5. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
              <li>Regulatory authorities when required by law</li>
              <li>Fraud prevention and identity verification partners</li>
              <li>Infrastructure providers (e.g., Cloudflare) for hosting and security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">6. Cookies & Tracking</h2>
            <p>We use essential session cookies to maintain your authentication state. We do not use third-party advertising trackers. Analytics data may be collected in aggregate, anonymized form to improve the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data, or to restrict how we process it. To exercise these rights, please contact us via the <a href="/support" className="text-indigo-400 hover:text-white transition-colors font-semibold">Support Portal</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the Platform. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-3">9. Contact Us</h2>
            <p>For any privacy-related inquiries, please reach out through our <a href="/support" className="text-indigo-400 hover:text-white transition-colors font-semibold">Support Portal</a> and our compliance team will respond within 72 hours.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-600 font-bold uppercase tracking-widest">
          <span>© 2026 Blockchain Infrastructure Limited</span>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Use</a>
            <a href="/support" className="hover:text-indigo-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
