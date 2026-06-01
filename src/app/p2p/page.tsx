"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { 
  ArrowLeft, Wallet, Globe, Lock, Info, CheckCircle2, Copy, 
  Building2, ShieldCheck, XCircle, Search, HelpCircle, 
  ArrowRightLeft, Send, Image as ImageIcon, ChevronDown, Check, Clock 
} from "lucide-react";

interface P2POffer {
  id: string;
  type: "BUY" | "SELL";
  advertiserName: string;
  ordersCount: number;
  completionRate: number;
  likeRate: number;
  timeLimit: number;
  price: number; // Price in USD
  availableAmount: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  isPromoted: boolean;
}

const CURRENCY_RATES: Record<string, { rate: number; symbol: string; flag: string; name: string }> = {
  USD: { rate: 1.0, symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  EGP: { rate: 50.0, symbol: "E£", flag: "🇪🇬", name: "Egyptian Pound" },
  EUR: { rate: 0.92, symbol: "€", flag: "🇪🇺", name: "Euro" },
  GBP: { rate: 0.79, symbol: "£", flag: "🇬🇧", name: "British Pound" },
  AED: { rate: 3.67, symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham" },
  SAR: { rate: 3.75, symbol: "ر.س", flag: "🇸🇦", name: "Saudi Riyal" },
  TRY: { rate: 32.5, symbol: "₺", flag: "🇹🇷", name: "Turkish Lira" }
};

const COIN_LIST = [
  "USDT", "BTC", "USDC", "FDUSD", "BNB", "ETH", "ADA", "SHIB", "DOGE", "TRX", "SOL", "PEPE", "TRUMP", "DOLO", "XPL", "ASTER"
];

export default function P2PPage() {
  const router = useRouter();
  const { user, balance, refreshUser, isLoading } = useUser();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [searchAmount, setSearchAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [sortBy, setSortBy] = useState("price");

  // API states
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Trade dialog state
  const [tradeModalOffer, setTradeModalOffer] = useState<P2POffer | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [submittingTrade, setSubmittingTrade] = useState(false);

  // Block states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(0);

  // Chat timers & refs
  const [elapsed, setElapsed] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect currency via location
  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch("/api/location");
        if (res.ok) {
          const data = await res.json();
          if (data.countryCode === "EG") setSelectedCurrency("EGP");
          else if (data.countryCode === "GB") setSelectedCurrency("GBP");
          else if (data.countryCode === "AE") setSelectedCurrency("AED");
          else if (data.countryCode === "SA") setSelectedCurrency("SAR");
          else if (data.countryCode === "TR") setSelectedCurrency("TRY");
          else if (["FR", "DE", "IT", "ES", "NL", "BE", "GR", "PT", "FI", "IE", "AT"].includes(data.countryCode)) {
            setSelectedCurrency("EUR");
          }
        }
      } catch (e) {
        console.error("Location detection failed", e);
      } finally {
        setLocationLoaded(true);
      }
    }
    detectLocation();
  }, []);

  // Fetch offers and check active trades
  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch("/api/p2p/offers");
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (e) {
      console.error("Error fetching offers:", e);
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchActiveRequest = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/p2p?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          const active = data.requests.find((r: any) => r.status !== "COMPLETED");
          if (active) {
            setActiveRequest(active);
          } else {
            setActiveRequest(null);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChat = async () => {
    if (!activeRequest) return;
    try {
      const res = await fetch(`/api/p2p/chat?id=${activeRequest.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (user) {
      fetchActiveRequest();
      const interval = setInterval(fetchActiveRequest, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (activeRequest) {
      fetchChat();
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [activeRequest]);

  useEffect(() => {
    if (activeRequest) {
      const updateElapsed = () => setElapsed(Date.now() - activeRequest.createdAt);
      updateElapsed();
      const int = setInterval(updateElapsed, 1000);
      return () => clearInterval(int);
    }
  }, [activeRequest]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatMessages]);

  const handleStartTrade = async (offer: P2POffer) => {
    if (!user) {
      toast("Please login to trade", "warning");
      return;
    }
    
    // Check if user is blocked or has too many active trades (no trade is created here)
    try {
      const checkRes = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "check_block" })
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok && checkData.error === "BLOCKED") {
        setBlockedUntil(checkData.blockedUntil);
        setShowBlockModal(true);
        return;
      }
    } catch (err) {
      console.error("Block check failed", err);
    }

    setTradeModalOffer(offer);
    setTradeAmount("");
  };

  const handleConfirmTrade = async () => {
    if (!tradeModalOffer || !tradeAmount || isNaN(Number(tradeAmount)) || Number(tradeAmount) <= 0) {
      toast("Please enter a valid amount.", "warning");
      return;
    }

    const fiatAmount = Number(tradeAmount);
    const rateInfo = CURRENCY_RATES[selectedCurrency];
    const usdEquivalent = fiatAmount / (tradeModalOffer.price * rateInfo.rate);

    setSubmittingTrade(true);
    try {
      const res = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          type: activeTab,
          amount: parseFloat(usdEquivalent.toFixed(4)),
          advertiserName: tradeModalOffer.advertiserName,
          price: tradeModalOffer.price,
          paymentMethods: tradeModalOffer.paymentMethods,
          minLimit: tradeModalOffer.minLimit,
          maxLimit: tradeModalOffer.maxLimit,
          availableAmount: tradeModalOffer.availableAmount,
          currency: selectedCurrency
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast("P2P Secure Session Initiated", "success");
        setTradeModalOffer(null);
        fetchActiveRequest();
      } else if (data.error === "BLOCKED") {
        setBlockedUntil(data.blockedUntil);
        setTradeModalOffer(null);
        setShowBlockModal(true);
      } else {
        toast(data.error || "Failed to start trade", "error");
      }
    } catch (e) {
      toast("Network error. Please try again.", "error");
    } finally {
      setSubmittingTrade(false);
    }
  };

  const handleConfirmBlock = async () => {
    try {
      await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, action: "confirm_block" })
      });
      setShowBlockModal(false);
      refreshUser();
    } catch (e) {
      console.error("Error acknowledging block", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeRequest) return;

    const msgText = newMessage;
    const msgImage = selectedImage;
    setNewMessage("");
    setSelectedImage(null);

    const optimisticMsg = {
      id: "temp_" + Date.now(),
      sender: "USER",
      text: msgText,
      image: msgImage,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch("/api/p2p/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeRequest.id,
          sender: "USER",
          text: msgText,
          image: msgImage
        })
      });
      fetchChat();
    } catch (e) {
      toast("Failed to send message", "error");
    }
  };

  const handleCompleteTrade = async () => {
    if (!activeRequest) return;
    if (!confirm("Are you sure you want to finalize this trade? This will release funds and update your account balance.")) return;

    try {
      const res = await fetch("/api/p2p", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeRequest.id, action: "complete" })
      });
      if (res.ok) {
        toast("Trade Completed Successfully!", "success");
        setActiveRequest(null);
        setChatMessages([]);
        refreshUser();
      } else {
        toast("Failed to complete transaction", "error");
      }
    } catch (e) {
      toast("Error completing transaction", "error");
    }
  };

  const handleCancelTrade = async () => {
    if (!activeRequest) return;
    if (!confirm("Are you sure you want to cancel this trade? Any incomplete trades contribute to regional limits.")) return;

    try {
      const res = await fetch("/api/p2p", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeRequest.id, action: "cancel" })
      });
      if (res.ok) {
        toast("Trade Cancelled", "warning");
        setActiveRequest(null);
        setChatMessages([]);
        refreshUser();
      } else {
        toast("Failed to cancel trade", "error");
      }
    } catch (e) {
      toast("Error canceling transaction", "error");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be smaller than 2MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Convert USD price dynamically to target currency
  const getOfferPrice = (usdPrice: number) => {
    const rateInfo = CURRENCY_RATES[selectedCurrency];
    return (usdPrice * rateInfo.rate).toFixed(2);
  };

  // Filter offers based on user preferences
  const rateInfo = CURRENCY_RATES[selectedCurrency];
  const matchingOffers = offers
    .filter((o) => o.type === activeTab)
    .filter((o) => {
      // Filter by payment method
      if (selectedPaymentMethod === "all") return true;
      return o.paymentMethods.some(m => m.toLowerCase().includes(selectedPaymentMethod.toLowerCase()));
    })
    .filter((o) => {
      // Filter by fiat amount if searched
      if (!searchAmount) return true;
      const searchVal = parseFloat(searchAmount);
      if (isNaN(searchVal)) return true;
      const offerMin = o.minLimit * rateInfo.rate;
      const offerMax = o.maxLimit * rateInfo.rate;
      return searchVal >= offerMin && searchVal <= offerMax;
    });

  // Sort offers
  const sortedOffers = [...matchingOffers].sort((a, b) => {
    if (sortBy === "price") {
      return activeTab === "BUY" ? a.price - b.price : b.price - a.price;
    } else if (sortBy === "orders") {
      return b.ordersCount - a.ordersCount;
    } else if (sortBy === "completion") {
      return b.completionRate - a.completionRate;
    }
    return 0;
  });

  // Keep promoted ads pinned at the top
  const promotedAd = offers.find(o => o.type === activeTab && o.isPromoted);
  const normalAds = sortedOffers.filter(o => o.id !== promotedAd?.id);
  const finalOffersList = promotedAd ? [promotedAd, ...normalAds] : sortedOffers;

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="text-center bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-slate-300 dark:border-gray-700/50 p-10 rounded-3xl shadow-2xl max-w-sm w-full">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Session Required</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Please login to your secure trading account to trade in the P2P market.</p>
          <Link href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <Link href="/" className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors w-fit text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {activeRequest ? (
          /* ACTIVE SECURE TRADE WORKSPACE */
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[78vh] relative">
            
            {/* Left Column: Trade Info */}
            <div className="w-full lg:w-80 bg-slate-50 dark:bg-gray-950/40 border-r border-slate-200 dark:border-gray-800 p-6 flex flex-col overflow-y-auto">
              <div className="mb-6">
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Escrow Locked Session
                </div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  {activeRequest.type === "BUY" ? "Buy USDT" : "Sell USDT"}
                </h2>
              </div>

              <div className="space-y-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800/80 p-4 rounded-2xl mb-6 shadow-sm">
                <div className="grid grid-cols-2 gap-y-3.5 text-xs font-semibold">
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Trading Partner</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeRequest.sellerName}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 my-1"></div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Price / USDT</span>
                    <span className="font-mono font-bold text-indigo-500">${activeRequest.usdPrice?.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Currency</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeRequest.currency || "USD"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Your Amount</span>
                    <span className="font-mono font-bold text-emerald-500">{activeRequest.amount?.toFixed(4)} USDT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Available</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeRequest.availableAmount ? activeRequest.availableAmount.toLocaleString() + " USDT" : "—"}</span>
                  </div>
                  {(activeRequest.minLimit || activeRequest.maxLimit) && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Order Limits</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        {activeRequest.minLimit?.toLocaleString()} – {activeRequest.maxLimit?.toLocaleString()} {activeRequest.currency || "USD"}
                      </span>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 my-1"></div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Payment Method</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{activeRequest.banks}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Elapsed</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-mono font-black text-amber-500 tabular-nums">
                  {formatTime(elapsed)}
                </div>
              </div>

              {/* Guide/Instruction */}
              <div className="text-[11px] text-slate-400 leading-relaxed mb-6 space-y-2 bg-slate-100/50 dark:bg-gray-900/30 p-3.5 rounded-2xl border border-slate-200/50 dark:border-gray-800/50">
                <p className="font-bold text-slate-600 dark:text-slate-300">⚠️ Secure Escrow Steps:</p>
                {activeRequest.type === "BUY" ? (
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Send the payment using details provided in chat.</li>
                    <li>Wait for partner to confirm receipt.</li>
                    <li>Or click <strong>"I Have Paid"</strong> below to claim completion.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Wait to receive the payment from the buyer.</li>
                    <li>Verify payment in your personal bank account.</li>
                    <li>Click <strong>"Release USDT"</strong> below to transfer escrow.</li>
                  </ol>
                )}
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={handleCompleteTrade}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer text-xs uppercase tracking-widest"
                >
                  {activeRequest.type === "BUY" ? "I Have Paid / Confirm Transfer" : "Confirm Receipt & Release USDT"}
                </button>
                <button
                  onClick={handleCancelTrade}
                  className="w-full bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 font-bold py-3.5 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500"
                >
                  Cancel Trade Session
                </button>
              </div>
            </div>

            {/* Right Column: Chat Workspace */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Chat with {activeRequest.sellerName}</span>
                    <span className="text-[10px] text-slate-400 block">Average Response: ~2 min</span>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-300 dark:text-gray-700" />
                    <span className="italic">Trade started. Send a hello or ask for details to begin...</span>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isUser = msg.sender === "USER";
                    return (
                      <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
                          {isUser ? "You" : activeRequest.sellerName} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-md ${
                          isUser 
                            ? "bg-indigo-600 text-white rounded-br-none" 
                            : "bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-gray-700/80"
                        }`}>
                          {msg.image && (
                            <img src={msg.image} alt="attachment" className="max-w-full h-auto rounded-xl mb-3 border border-black/10 shadow-sm" />
                          )}
                          {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
                {selectedImage && (
                  <div className="mb-3 relative inline-block">
                    <img src={selectedImage} alt="preview" className="h-20 rounded-xl border-2 border-indigo-500 shadow-md" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-5.5 h-5.5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask for details or write a message..."
                    className="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-5.5 h-5.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* P2P OFFERS DIRECTORY BOARD */
          <div className="space-y-6">
            
            {/* Header section with description */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic flex items-center gap-3">
                  P2P <span className="text-indigo-500 not-italic">Escrow Desk</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xl leading-relaxed">
                  Peer-to-Peer trading board. Buy or sell USDT directly with regional payment channels. Security is assured via lockbox smart contracts.
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-gray-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-gray-800/80 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab("BUY")}
                  className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeTab === "BUY"
                      ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-md scale-[1.02] border border-slate-200/50 dark:border-gray-700/30"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab("SELL")}
                  className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeTab === "SELL"
                      ? "bg-white dark:bg-gray-800 text-rose-500 shadow-md scale-[1.02] border border-slate-200/50 dark:border-gray-700/30"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Coin selector horizontal bar */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-850 select-none border-b border-slate-200 dark:border-gray-850/80 px-2">
              {COIN_LIST.map((coin) => {
                const isSelected = coin === selectedCoin;
                const isUSDT = coin === "USDT";
                return (
                  <button
                    key={coin}
                    disabled={!isUSDT}
                    onClick={() => isUSDT && setSelectedCoin(coin)}
                    className={`whitespace-nowrap px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                      isSelected 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10 cursor-pointer" 
                        : isUSDT 
                          ? "bg-white dark:bg-gray-900/60 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200 dark:border-gray-800 cursor-pointer"
                          : "bg-slate-100 dark:bg-gray-950/30 text-slate-350 dark:text-gray-700 border-transparent opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {coin} {isUSDT && <span className="text-[9px] text-emerald-400 ml-1">1.77% APR</span>}
                  </button>
                );
              })}
            </div>

            {/* Filters dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-gray-900/20 p-5 rounded-[2rem] border border-slate-200 dark:border-gray-800/80">
              
              {/* Amount filter input */}
              <div className="relative">
                <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1.5 ml-1">Transaction Amount</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-black text-slate-450 dark:text-gray-500">{rateInfo.symbol}</span>
                  <input
                    type="number"
                    placeholder="Enter amount..."
                    value={searchAmount}
                    onChange={(e) => setSearchAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Currency selector custom dropdown */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1.5 ml-1">Fiat Currency</label>
                <div className="relative">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors appearance-none font-bold cursor-pointer"
                  >
                    {Object.keys(CURRENCY_RATES).map((cur) => (
                      <option key={cur} value={cur} className="dark:bg-gray-900">
                        {CURRENCY_RATES[cur].flag} {cur} ({CURRENCY_RATES[cur].name})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4.5 pointer-events-none" />
                </div>
              </div>

              {/* Payment Method filter */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1.5 ml-1">Payment Method</label>
                <div className="relative">
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors appearance-none font-bold cursor-pointer"
                  >
                    <option value="all" className="dark:bg-gray-900">All payment methods</option>
                    <option value="instapay" className="dark:bg-gray-900">InstaPay</option>
                    <option value="vodafone" className="dark:bg-gray-900">Vodafone Cash</option>
                    <option value="bank" className="dark:bg-gray-900">Bank Transfer</option>
                    <option value="fawry" className="dark:bg-gray-900">Fawry</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4.5 pointer-events-none" />
                </div>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1.5 ml-1">Sort Orders</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors appearance-none font-bold cursor-pointer"
                  >
                    <option value="price" className="dark:bg-gray-900">Sort By: Price</option>
                    <option value="orders" className="dark:bg-gray-900">Sort By: Orders Count</option>
                    <option value="completion" className="dark:bg-gray-900">Sort By: Completion Rate</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4.5 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Offers directory list table */}
            <div className="bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em] border-b border-slate-200/50 dark:border-gray-800">
                      <th className="px-8 py-5">Advertisers</th>
                      <th className="px-8 py-5">Price per USDT</th>
                      <th className="px-8 py-5">Available / Order Limits</th>
                      <th className="px-8 py-5">Payment Channels</th>
                      <th className="px-8 py-5 text-right">Trade Desk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {loadingOffers ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-slate-400 animate-pulse font-black uppercase text-[10px] tracking-[0.3em]">
                          Synchronizing exchange data...
                        </td>
                      </tr>
                    ) : finalOffersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-slate-400 italic">
                          No advertisers match your current filters.
                        </td>
                      </tr>
                    ) : (
                      finalOffersList.map((offer) => {
                        const offerFPrice = getOfferPrice(offer.price);
                        const limitsText = `${(offer.minLimit * rateInfo.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${selectedCurrency} - ${(offer.maxLimit * rateInfo.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${selectedCurrency}`;
                        
                        return (
                          <tr 
                            key={offer.id} 
                            className={`transition-all duration-300 relative group/row ${
                              offer.isPromoted 
                                ? "bg-amber-500/[0.02] border-y-2 border-amber-500/20" 
                                : "hover:bg-indigo-500/[0.01]"
                            }`}
                          >
                            {/* Advertisers */}
                            <td className="px-8 py-6.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-250 dark:border-gray-700 flex items-center justify-center font-bold text-indigo-500 text-xs">
                                  {offer.advertiserName.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm tracking-tight">
                                    {offer.advertiserName}
                                    {offer.isPromoted && (
                                      <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/20">
                                        ★ Promoted Ad
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-450 dark:text-gray-500 font-semibold tracking-wide">
                                    {offer.ordersCount} orders <span className="text-slate-300 dark:text-gray-800">|</span> {offer.completionRate}% completion
                                    <br />
                                    👍 {offer.likeRate}% thumbs up <span className="text-slate-300 dark:text-gray-800">|</span> ⏳ {offer.timeLimit} min limit
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-8 py-6.5">
                              <div className="flex flex-col">
                                <span className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                                  {rateInfo.symbol} {offerFPrice}
                                </span>
                                <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-black">
                                  1 USDT
                                </span>
                              </div>
                            </td>

                            {/* Limits */}
                            <td className="px-8 py-6.5">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 dark:text-gray-500 font-semibold w-16">Available:</span>
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                                    {offer.availableAmount.toLocaleString()} USDT
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 dark:text-gray-500 font-semibold w-16">Limits:</span>
                                  <span className="font-mono font-semibold text-slate-600 dark:text-slate-450 truncate block max-w-[200px]" title={limitsText}>
                                    {limitsText}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Payment Methods — permanently blurred, only admin sees them */}
                            <td className="px-8 py-6.5">
                              <div className="relative w-fit select-none">
                                <div className="flex flex-wrap gap-1.5 filter blur-md pointer-events-none" aria-hidden="true">
                                  {offer.paymentMethods.map((m) => (
                                    <span
                                      key={m}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                    >
                                      <Building2 className="w-3 h-3" />
                                      {m}
                                    </span>
                                  ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 bg-white/80 dark:bg-gray-900/90 px-2 py-1 rounded border border-slate-200 dark:border-gray-800 shadow-sm flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Privacy Protected
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-8 py-6.5 text-right">
                              <button
                                onClick={() => handleStartTrade(offer)}
                                className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 cursor-pointer text-white ${
                                  activeTab === "BUY" 
                                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10" 
                                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/10"
                                }`}
                              >
                                {activeTab === "BUY" ? "Buy USDT" : "Sell USDT"}
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* TRADE CONFIRMATION DIALOG MODAL */}
      {tradeModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-slate-250 dark:border-gray-850 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setTradeModalOffer(null)} 
              className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-gray-800 rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm cursor-pointer border border-slate-200 dark:border-gray-700"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2">
              Configure Order Detail
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 mb-6">
              You are initiating a trade session with <strong className="text-indigo-500">{tradeModalOffer.advertiserName}</strong>. Escrow locked box handles transfer.
            </p>

            <div className="space-y-4 bg-slate-50 dark:bg-gray-950/40 p-4 rounded-2xl border border-slate-200 dark:border-gray-800/80 mb-6">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Offer Rate:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                  {rateInfo.symbol} {getOfferPrice(tradeModalOffer.price)} / USDT
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {tradeModalOffer.paymentMethods.join(", ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Limits Allowed:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                  {(tradeModalOffer.minLimit * rateInfo.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} - {(tradeModalOffer.maxLimit * rateInfo.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} {selectedCurrency}
                </span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleConfirmTrade(); }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  How much do you want to {activeTab === "BUY" ? "pay" : "receive"}? ({selectedCurrency})
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-mono font-black text-indigo-500">{rateInfo.symbol}</span>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-850 rounded-2xl pl-10 pr-16 py-4 text-sm focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                  <span className="absolute right-4 text-[10px] font-black uppercase text-indigo-400 border border-indigo-400/20 px-2 py-1 rounded bg-indigo-500/5">
                    {selectedCurrency}
                  </span>
                </div>
                {tradeAmount && !isNaN(Number(tradeAmount)) && (
                  <div className="text-[10px] text-emerald-500 font-bold mt-2.5 flex items-center gap-1 px-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    You will {activeTab === "BUY" ? "receive" : "sell"} ≈ {(Number(tradeAmount) / (tradeModalOffer.price * rateInfo.rate)).toFixed(2)} USDT
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTradeModalOffer(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-slate-200 cursor-pointer text-center text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTrade}
                  className={`flex-1 py-4 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider ${
                    activeTab === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {submittingTrade ? "Locking Escrow..." : "Initiate Secure Trade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPENSION MODAL (12-hour block) */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-red-600"></div>
            
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>

            <h3 className="text-2xl font-black text-rose-500 mb-4 tracking-tight uppercase italic">P2P Account Restricted</h3>
            
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
              Our secure trade protocol has detected that you initiated <strong className="text-slate-900 dark:text-white">3 active P2P trade sessions</strong> without confirming/completing the payments to completion.
              <br /><br />
              To maintain system integrity, direct P2P access is restricted for <strong className="text-rose-500 font-bold">12 hours</strong>.
            </p>

            <div className="bg-slate-100 dark:bg-gray-950 p-4.5 rounded-2xl mb-6 font-mono text-xs text-indigo-500 font-bold border border-slate-200 dark:border-gray-800 shadow-inner">
              RESTRICTION EXPIRES: <br />
              <span className="text-slate-800 dark:text-slate-350 text-[11px] block mt-1.5">{new Date(blockedUntil).toLocaleString()}</span>
            </div>

            <button
              onClick={handleConfirmBlock}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4.5 rounded-xl shadow-lg shadow-indigo-650/20 transition-transform active:scale-95 cursor-pointer text-xs uppercase tracking-widest"
            >
              I Confirm & Acknowledge
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
