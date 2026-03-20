"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Copy, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const WORD_LIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access",
  "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor",
  "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice",
  "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport",
  "aisle", "alarm", "album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha",
  "already", "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor",
  "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna",
  "antique", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
  "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow",
  "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma",
  "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit", "august", "aunt", "author",
  "auto", "autumn", "average", "avocado", "avoid", "awake", "aware", "away", "awesome", "awful", "awkward",
  "axis", "baby", "bachelor", "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner",
  "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because",
  "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best",
  "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology", "bird", "birth", "bitter",
  "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "blue"
];

const generatePhrase = () => {
  const phrase = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    phrase.push(WORD_LIST[randomIndex]);
  }
  return phrase;
};

export function SeedPhraseOnboarding() {
  const { user, setSeedPhrase } = useUser();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<"GENERATE" | "VERIFY" | "DONE">("GENERATE");
  const [phrase, setPhrase] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);
  const [verifyAnswers, setVerifyAnswers] = useState<string[]>(["", "", ""]);
  
  // Show if user is logged in but hasn't received a seed phrase yet
  const needsSeedPhrase = user && !user.seedPhrase;

  useEffect(() => {
    if (needsSeedPhrase && phrase.length === 0) {
      setPhrase(generatePhrase());
    }
  }, [needsSeedPhrase, phrase.length]);

  if (!needsSeedPhrase) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.join(" "));
    setCopied(true);
    toast("Seed phrase copied to clipboard!", "success");
    
    // Pick 3 random words to verify
    const indices: number[] = [];
    while(indices.length < 3) {
      const r = Math.floor(Math.random() * 12);
      if(indices.indexOf(r) === -1) indices.push(r);
    }
    setVerifyIndices(indices.sort((a,b) => a - b));
  };

  const handleContinue = () => {
    if (!copied) {
      toast("Please copy your seed phrase first.", "warning");
      return;
    }
    setPhase("VERIFY");
  };

  const handleVerify = async () => {
    const isCorrect = verifyIndices.every((index, i) => verifyAnswers[i].toLowerCase().trim() === phrase[index].toLowerCase());
    
    if (isCorrect) {
      setPhase("DONE");
      toast("Security phrase verified! Account secured.", "success");
      await setSeedPhrase(phrase); // Save to cloud
    } else {
      toast("Incorrect words. Please check your backup and try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-xl">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Institutional Security</h2>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            As a decentralized platform, we do not store your recovery keys. You are the sole custodian of your funds.
          </p>
        </div>

        {phase === "GENERATE" && (
           <div className="relative z-10">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-red-400 font-medium">
                    Write down these 12 words in exact order and store them in a secure, offline location. Anyone with these words can access your funds.
                 </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {phrase.map((word, i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-2">
                     <span className="text-gray-500 text-xs font-mono">{i + 1}.</span>
                     <span className="text-white font-bold tracking-wide">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-700 text-white p-3 rounded-xl transition-all font-bold"
                 >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    {copied ? "Copied" : "Copy to Clipboard"}
                 </button>
                 <button 
                  onClick={handleContinue}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all font-bold ${copied ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                 >
                    I Saved It <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        )}

        {phase === "VERIFY" && (
           <div className="relative z-10">
              <h3 className="text-white font-bold mb-4">Verify your Backup</h3>
              <p className="text-sm text-gray-400 mb-6">Please enter the corresponding words from your saved seed phrase to verify you have backed it up correctly.</p>

              <div className="space-y-4 mb-8">
                {verifyIndices.map((index, i) => (
                  <div key={index} className="flex items-center gap-4">
                     <div className="w-16 text-right">
                       <span className="text-gray-500 font-bold">Word #{index + 1}</span>
                     </div>
                     <input
                       type="text"
                       value={verifyAnswers[i]}
                       onChange={(e) => {
                         const newAnswers = [...verifyAnswers];
                         newAnswers[i] = e.target.value;
                         setVerifyAnswers(newAnswers);
                       }}
                       className="flex-1 bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-xl p-3 text-white outline-none transition-colors"
                       placeholder="Enter word..."
                     />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={() => setPhase("GENERATE")}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                 >
                    Back
                 </button>
                 <button 
                  onClick={handleVerify}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-bold flex items-center justify-center gap-2"
                 >
                    Verify & Continue <CheckCircle2 className="w-5 h-5" />
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
