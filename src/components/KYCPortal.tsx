"use client";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { ShieldAlert, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";

export function KYCPortal() {
  const { user, updateKYCStatus } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  
  if (user.kycStatus === "VERIFIED") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white">Identity Verified</h3>
        <p className="text-gray-400 text-sm mt-1">Your institutional KYC is complete. All features unlocked.</p>
      </div>
    );
  }

  if (user.kycStatus === "PENDING") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white">Verification Pending</h3>
        <p className="text-gray-400 text-sm mt-1">Our compliance team is currently reviewing your documents. Please allow up to 24 hours.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(async () => {
      await updateKYCStatus("PENDING");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 relative overflow-hidden">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-indigo-400" /> Institutional KYC
      </h3>
      <p className="text-sm text-gray-400 mb-6">In accordance with global AML regulations, identity verification is required to unlock withdrawals and higher limits.</p>
      
      {step === 1 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setStep(2)}>
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Upload Government ID</p>
            <p className="text-xs text-gray-500 mt-1">Passport, Driver's License, or National ID</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => setStep(3)}>
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 mx-auto mb-2 flex items-center justify-center">
               <div className="w-8 h-8 rounded-full border border-gray-600"></div>
            </div>
            <p className="text-sm font-bold text-white">Face Match Verification</p>
            <p className="text-xs text-gray-500 mt-1">Take a selfie to match your uploaded document</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-4">Documents Ready for Submission</p>
          <button 
             onClick={handleSubmit}
             disabled={loading}
             className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Encrypting & Submitting..." : "Submit for Verification"}
          </button>
        </div>
      )}
    </div>
  );
}
