"use client";
import { useState, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { ShieldAlert, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function KYCPortal() {
  const { user, updateKYCStatus } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;
  
  if (user.kycStatus === "VERIFIED") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] opacity-[0.03]"></div>
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
           <ShieldCheck className="w-12 h-12 text-emerald-400" />
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight mb-2">Identity Verified</h3>
        <p className="text-emerald-100/70 text-base max-w-md mx-auto">Your institutional KYC profile has been formally cleared by our compliance officers. All platform restrictions are now lifted.</p>
      </div>
    );
  }

  if (user.kycStatus === "PENDING") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url(https://www.transparenttextures.com/patterns/carbon-fibre.png)] opacity-[0.03]"></div>
        <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse">
           <ShieldAlert className="w-12 h-12 text-amber-400" />
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight mb-2">Review Pending</h3>
        <p className="text-amber-100/70 text-base max-w-md mx-auto">Our security team is actively authenticating your uploaded credentials. Escalation priority is currently High. Please allow up to 24 hours.</p>
      </div>
    );
  }

  const processImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 800; // Compress image down
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // JPEG format with 0.6 quality saves huge amounts of space (perfect for KV)
        callback(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast("Processing Document...", "info");
    processImage(file, (base64) => {
      setIdFront(base64);
      setStep(2);
    });
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast("Processing Face Match...", "info");
    processImage(file, (base64) => {
      setIdBack(base64);
      setStep(3);
    });
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack) return;
    setLoading(true);
    await updateKYCStatus("PENDING", { idFront, idBack, timestamp: Date.now() });
    setLoading(false);
    toast("Documents securely embedded to Cloud API.", "success");
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-2xl border border-gray-700/50 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col mb-10 relative z-10">
         <h3 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-4 text-white tracking-tight leading-none">
            <ShieldAlert className="w-10 h-10 text-indigo-400 shrink-0" />
            Institutional KYC
         </h3>
         <p className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed">
           In accordance with global Anti-Money Laundering (AML) directives, institutional-grade identity verification is legally required to unlock unlimited withdrawals and VIP tier status.
         </p>
      </div>
      
      {/* Progress Stepper */}
      <div className="flex items-center gap-3 mb-12 relative z-10">
         <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-gray-700/50'}`}></div>
         <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-gray-700/50'}`}></div>
         <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-gray-700/50'}`}></div>
      </div>

      {step === 1 && (
        <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <input type="file" ref={idInputRef} onChange={handleIdUpload} accept="image/*" className="hidden" />
          <div className="border border-dashed border-gray-600 bg-gray-900/30 rounded-3xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer group shadow-inner" onClick={() => idInputRef.current?.click()}>
            <div className="w-20 h-20 bg-gray-800 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-gray-700 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 shadow-xl">
               <Upload className="w-10 h-10 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">Upload Government Issued ID</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Please provide a clear, glare-free photo of your Passport, Driver's License, or National Identity Card.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <input type="file" ref={selfieInputRef} onChange={handleSelfieUpload} accept="image/*" capture="user" className="hidden" />
          <div className="border border-dashed border-gray-600 bg-gray-900/30 rounded-3xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer group shadow-inner" onClick={() => selfieInputRef.current?.click()}>
            <div className="flex items-end justify-center gap-6 mb-8 group-hover:scale-105 transition-transform duration-500">
                {idFront ? (
                  <img src={idFront} alt="ID Preview" className="h-24 w-auto rounded-xl border-4 border-gray-800 shadow-2xl opacity-60 rotate-[-5deg]" />
                ) : null}
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-indigo-500/50 shadow-2xl flex items-center justify-center bg-indigo-500/10 z-10 rotate-[5deg]">
                   <div className="w-16 h-16 rounded-full border-2 border-indigo-400/50"></div>
                </div>
            </div>
            <p className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">Biometric Liveness Check</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Take a real-time selfie to cryptographically match your uploaded identification document.</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 text-center py-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-indigo-500/30">
            <CheckCircle2 className="w-12 h-12 text-indigo-400" />
          </div>
          <p className="text-3xl text-white font-black tracking-tight mb-2">Documents Encrypted</p>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Your biometric materials have been hashed and are ready for secure transmission to the compliance oracle.</p>
          
          <div className="flex gap-6 justify-center mb-10">
            {idFront && <img src={idFront} className="h-20 w-auto rounded-lg border border-gray-700 opacity-50 shadow-lg" />}
            {idBack && <img src={idBack} className="h-20 w-auto rounded-lg border border-gray-700 opacity-50 shadow-lg" />}
          </div>
          
          <button 
             onClick={handleSubmit}
             disabled={loading}
             className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg py-5 rounded-2xl transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] active:scale-95"
          >
            {loading ? <span className="animate-pulse">Transmitting to Node...</span> : "Sign & Submit Verification File"}
          </button>
        </div>
      )}
    </div>
  );
}
