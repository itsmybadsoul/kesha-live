"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import {
  CheckCircle2, XCircle, ArrowRightLeft, ShieldCheck,
  Send, Image as ImageIcon, Trash2, Settings2, RefreshCw,
  Users, FileText, DollarSign, MessageCircle
} from "lucide-react";

const PAYMENT_METHODS_BY_CURRENCY: Record<string, string[]> = {
  SAR: ["STC Pay", "Al Rajhi Bank", "NCB Bank", "Urpay", "Bank Transfer"],
  EGP: ["InstaPay", "Vodafone Cash", "Fawry", "Orange Cash", "CIB Bank", "NBE Bank"],
  AED: ["Etisalat Cash", "ADCB Bank", "Emirates NBD", "FAB Bank", "Bank Transfer"],
  USD: ["Bank Transfer", "SWIFT", "Wise", "PayPal"],
  EUR: ["SEPA Transfer", "Bank Transfer", "Revolut", "Wise"],
  GBP: ["Bank Transfer", "Wise", "Revolut", "Monzo"],
  TRY: ["Ziraat Bank", "Garanti BBVA", "Papara", "Bank Transfer"]
};

export function P2PAdminTable() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sellerDetails, setSellerDetails] = useState({ name: "", price: "", banks: "", trustRate: "" });
  const [balanceAmount, setBalanceAmount] = useState("");

  // P2P Directory offers state
  const [adminSubTab, setAdminSubTab] = useState<"sessions" | "directory" | "userads" | "settings">("sessions");
  const [directoryType, setDirectoryType] = useState<"BUY" | "SELL">("BUY");
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Price range settings
  const [priceRange, setPriceRange] = useState({ buyMin: "1.005", buyMax: "1.045", sellMin: "0.960", sellMax: "0.998" });
  const [savingRange, setSavingRange] = useState(false);

  // New Admin states
  const [replyAsName, setReplyAsName] = useState("");
  const [adminRulesText, setAdminRulesText] = useState("");
  const [savingRules, setSavingRules] = useState(false);

  // Counterpart trade modal
  const [tradeModalUserOffer, setTradeModalUserOffer] = useState<any | null>(null);
  const [visName, setVisName] = useState("Sarah");
  const [visCountry, setVisCountry] = useState("Saudi Arabia");
  const [visAmount, setVisAmount] = useState("500");
  const [visPrice, setVisPrice] = useState("");
  const [visCurrency, setVisCurrency] = useState("SAR");
  const [visPayments, setVisPayments] = useState<string[]>([]);
  const [visCustomPayment, setVisCustomPayment] = useState("");
  const [submittingVisTrade, setSubmittingVisTrade] = useState(false);
  const [visTargetEmail, setVisTargetEmail] = useState("");

  useEffect(() => {
    setVisPayments([]);
  }, [visCurrency]);

  // Send Invoice Popup
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/p2p");
      const data = await res.json();
      if (data.requests) setRequests(data.requests.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch("/api/p2p/offers");
      const data = await res.json();
      if (data.offers) setOffers(data.offers);
      if (data.priceRange) {
        setPriceRange({
          buyMin: String(data.priceRange.buyMin),
          buyMax: String(data.priceRange.buyMax),
          sellMin: String(data.priceRange.sellMin),
          sellMax: String(data.priceRange.sellMax),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchChat = async (id: string) => {
    try {
      const res = await fetch(`/api/p2p/chat?id=${id}`);
      const data = await res.json();
      if (data.messages) setChatMessages(data.messages);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchOffers();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchChat(activeChat);
      const interval = setInterval(() => fetchChat(activeChat), 10000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [chatMessages]);

  useEffect(() => {
    if (activeChat) {
      const activeObj = requests.find(r => r.id === activeChat);
      if (activeObj) {
        setReplyAsName(activeObj.sellerName || "");
      }
    }
  }, [activeChat, requests]);

  useEffect(() => {
    if (adminSubTab === "settings") {
      fetch("/api/p2p/rules")
        .then(res => res.json())
        .then(data => {
          if (data.rules) setAdminRulesText(data.rules);
        })
        .catch(err => console.error(err));
    }
  }, [adminSubTab]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/admin/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" })
      });
      const data = await res.json();
      if (data.success) { toast("P2P Request Approved", "success"); fetchRequests(); }
    } catch (e) { toast("Action failed", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request and its chat?")) return;
    try {
      const res = await fetch("/api/admin/p2p/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast("P2P Request Deleted", "success");
        if (activeChat === id) setActiveChat(null);
        fetchRequests();
      }
    } catch (e) { toast("Delete failed", "error"); }
  };

  const handleUpdateDetails = async (id: string) => {
    try {
      const res = await fetch("/api/admin/p2p", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          sellerName: sellerDetails.name,
          usdPrice: Number(sellerDetails.price),
          banks: sellerDetails.banks,
          trustRate: sellerDetails.trustRate
        })
      });
      const data = await res.json();
      if (data.success) { toast("Seller details updated & pushed to user", "success"); fetchRequests(); }
    } catch (e) { toast("Update failed", "error"); }
  };

  const handleSaveOffer = async (offerObj: any) => {
    try {
      const res = await fetch("/api/p2p/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", offer: offerObj })
      });
      const data = await res.json();
      if (data.success) {
        toast("Offer updated successfully", "success");
        setEditingOfferId(null);
        fetchOffers();
      } else {
        toast(data.error || "Failed to update offer", "error");
      }
    } catch (e) { toast("Error updating offer", "error"); }
  };

  const handleSavePriceRange = async () => {
    setSavingRange(true);
    try {
      const res = await fetch("/api/p2p/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_price_range",
          priceRange: {
            buyMin: parseFloat(priceRange.buyMin),
            buyMax: parseFloat(priceRange.buyMax),
            sellMin: parseFloat(priceRange.sellMin),
            sellMax: parseFloat(priceRange.sellMax),
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Price range saved & offers regenerated!", "success");
        fetchOffers();
      } else {
        toast("Failed to save price range", "error");
      }
    } catch (e) {
      toast("Error saving price range", "error");
    } finally {
      setSavingRange(false);
    }
  };

  const handleResetOffers = async () => {
    if (!confirm("This will regenerate all P2P offers using the current price range. Continue?")) return;
    try {
      const res = await fetch("/api/p2p/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
      const data = await res.json();
      if (data.success) {
        toast("All P2P offers reset!", "success");
        fetchOffers();
      }
    } catch (e) { toast("Error resetting offers", "error"); }
  };

  const handleSendBalance = async (id: string) => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) { toast("Enter a valid amount to send", "warning"); return; }
    if (!confirm(`Send $${balanceAmount} to this user?`)) return;
    try {
      const res = await fetch("/api/admin/p2p/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount: Number(balanceAmount) })
      });
      const data = await res.json();
      if (data.success) {
        toast("Balance Sent & Transaction Completed", "success");
        setActiveChat(null);
        fetchRequests();
      }
    } catch (e) { toast("Failed to send balance", "error"); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeChat) return;

    const msgText = newMessage;
    const msgImage = selectedImage;
    setNewMessage("");
    setSelectedImage(null);

    const optimisticMsg = { 
      id: "temp_" + Date.now(), 
      sender: "ADMIN", 
      text: msgText, 
      image: msgImage, 
      timestamp: Date.now(),
      senderName: replyAsName 
    };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch("/api/p2p/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: activeChat, 
          sender: "ADMIN", 
          text: msgText, 
          image: msgImage,
          senderName: replyAsName 
        })
      });
      fetchChat(activeChat);
    } catch (e) { toast("Failed to send message", "error"); }
  };

  const handleSaveRules = async () => {
    setSavingRules(true);
    try {
      const res = await fetch("/api/p2p/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: adminRulesText })
      });
      if (res.ok) {
        toast("P2P Rules Disclaimer updated successfully!", "success");
      } else {
        toast("Failed to save rules disclaimer", "error");
      }
    } catch (err) {
      toast("Error communicating with server", "error");
    } finally {
      setSavingRules(false);
    }
  };

  const handleInitiateCounterpartTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeModalUserOffer || !visName.trim()) {
      toast("Please fill in required fields", "warning");
      return;
    }

    const targetEmail = tradeModalUserOffer.userEmail || visTargetEmail;
    if (!targetEmail || !targetEmail.trim()) {
      toast("Please enter a valid target user email", "warning");
      return;
    }

    const finalPayments = [...visPayments];
    if (visCustomPayment.trim()) {
      finalPayments.push(visCustomPayment.trim());
    }
    if (finalPayments.length === 0) {
      toast("Please select/enter at least one payment method", "warning");
      return;
    }

    setSubmittingVisTrade(true);
    try {
      const res = await fetch("/api/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_create_trade",
          userEmail: targetEmail,
          counterpartName: visName,
          country: visCountry,
          amount: parseFloat(visAmount),
          price: parseFloat(visPrice || tradeModalUserOffer.price.toString()),
          currency: visCurrency,
          paymentMethods: finalPayments,
          type: tradeModalUserOffer.type
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.request) {
        toast("Counterpart trade session created!", "success");
        setTradeModalUserOffer(null);
        fetchRequests();
        
        // Direct open this chat workspace
        setActiveChat(data.request.id);
        setSellerDetails({ 
          name: data.request.sellerName || "", 
          price: data.request.usdPrice?.toString() || "", 
          banks: data.request.banks || "", 
          trustRate: data.request.trustRate || "" 
        });
        setBalanceAmount(data.request.amount?.toFixed(4) || data.request.amount?.toString() || "");
      } else {
        toast(data.error || "Failed to initiate counterpart trade", "error");
      }
    } catch (err) {
      toast("Error starting counterpart trade", "error");
    } finally {
      setSubmittingVisTrade(false);
    }
  };

  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceAmount || !activeChat) return;

    try {
      const res = await fetch("/api/p2p/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeChat,
          sender: "ADMIN",
          senderName: replyAsName || "Advertiser",
          text: invoiceNote.trim() || `Invoice payment request for ${invoiceAmount} USDT`,
          isPaymentRequest: true,
          paymentRequestAmount: parseFloat(invoiceAmount),
          paymentRequestCurrency: "USDT",
          paymentRequestStatus: "PENDING"
        })
      });
      if (res.ok) {
        toast("Payment request card sent in chat!", "success");
        setInvoiceAmount("");
        setInvoiceNote("");
        setShowInvoiceModal(false);
        fetchChat(activeChat);
      } else {
        toast("Failed to send payment request card", "error");
      }
    } catch (err) {
      toast("Error sending invoice request card", "error");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast("Image must be smaller than 2MB", "warning"); return; }
    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const activeRequestObj = requests.find(r => r.id === activeChat);
  const filteredOffers = offers.filter(
    (o) => o.type === directoryType && o.advertiserName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mt-16 mb-8 flex justify-between items-center px-4">
        <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase italic">
          P2P <span className="text-emerald-500 not-italic">Network</span> <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
        </h2>
        <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3 shadow-lg">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           {requests.filter(r => r.status === "PENDING").length} Pending · {requests.filter(r => r.status === "APPROVED").length} Active
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-3 mb-6 px-4 flex-wrap">
        {([
          { key: "sessions", label: "Active Sessions & Chats" },
          { key: "directory", label: "Manage Offers" },
          { key: "userads", label: "Client Ads" },
          { key: "settings", label: "⚙ P2P Settings" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setAdminSubTab(key as any)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              adminSubTab === key
                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                : "bg-white dark:bg-gray-900 text-slate-500 hover:text-emerald-500 border-slate-200 dark:border-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SESSIONS ── */}
      {adminSubTab === "sessions" && (
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Request ID / User</th>
                  <th className="px-8 py-5">Type / Amount</th>
                  <th className="px-8 py-5">Offer Details</th>
                  <th className="px-8 py-5">Payment Methods</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-400 animate-pulse font-black uppercase text-[10px] tracking-[0.4em]">Synchronizing...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-400 italic text-xs">No P2P requests found.</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-widest font-black border w-max ${r.type === "BUY" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                            P2P_{r.type}
                          </span>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{r.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono opacity-60">{new Date(r.createdAt).toLocaleString("en-US")}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-2xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white">
                          {r.amount?.toFixed(4)} <span className="text-xs text-slate-400">USDT</span>
                        </div>
                        {r.sellerName && <div className="text-[10px] text-slate-500 mt-1">Partner: {r.sellerName}</div>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-0.5 text-[11px]">
                          <div><span className="text-slate-400">Price/USDT: </span><span className="font-mono font-bold text-indigo-500">${r.usdPrice?.toFixed(4) ?? "—"}</span></div>
                          <div><span className="text-slate-400">Available: </span><span className="font-mono">{r.availableAmount ? r.availableAmount.toLocaleString("en-US") + " USDT" : "—"}</span></div>
                          {(r.minLimit || r.maxLimit) && (
                            <div><span className="text-slate-400">Limits: </span><span className="font-mono">{r.minLimit?.toLocaleString("en-US")} – {r.maxLimit?.toLocaleString("en-US")} {r.currency || "USD"}</span></div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {r.banks ? (
                          <div className="flex flex-wrap gap-1">
                            {r.banks.split(",").map((b: string) => (
                              <span key={b} className="bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-indigo-500/20">{b.trim()}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-8 py-6">
                        <div className={`text-xs font-black uppercase tracking-widest ${r.status === "PENDING" ? "text-amber-500" : r.status === "APPROVED" ? "text-indigo-500" : "text-emerald-500"}`}>
                          {r.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {r.status === "PENDING" && (
                            <button onClick={() => handleApprove(r.id)} className="p-3.5 bg-emerald-500 text-white rounded-2xl hover:scale-110 transition-all shadow-xl active:scale-95 cursor-pointer">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {r.status === "APPROVED" && (
                            <button
                              onClick={() => {
                                setActiveChat(r.id);
                                setSellerDetails({ name: r.sellerName || "", price: r.usdPrice?.toString() || "", banks: r.banks || "", trustRate: r.trustRate || "" });
                                setBalanceAmount(r.amount?.toFixed(4) || r.amount?.toString() || "");
                              }}
                              className="px-5 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 cursor-pointer"
                            >
                              Open Workspace
                            </button>
                          )}
                          <button onClick={() => handleDelete(r.id)} className="p-3.5 bg-white dark:bg-gray-900 text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-200 dark:border-gray-800 transition-all active:scale-95 cursor-pointer">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DIRECTORY ── */}
      {adminSubTab === "directory" && (
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-2xl mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex bg-slate-200/50 dark:bg-gray-950/50 p-1 rounded-xl">
              {(["BUY", "SELL"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDirectoryType(t)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    directoryType === t
                      ? `bg-white dark:bg-gray-800 ${t === "BUY" ? "text-emerald-500" : "text-rose-500"} shadow-sm`
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t} Offers
                </button>
              ))}
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Search advertiser name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs w-full sm:w-56 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={handleResetOffers}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em] border-b border-slate-100 dark:border-gray-800">
                  <th className="px-6 py-4">Advertiser</th>
                  <th className="px-6 py-4">Price (USD / SAR)</th>
                  <th className="px-6 py-4">Available (USDT)</th>
                  <th className="px-6 py-4">Limits (Fiat Range)</th>
                  <th className="px-6 py-4">Payment Methods (Visible Here)</th>
                  <th className="px-6 py-4 text-center">Promoted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-xs">
                {loadingOffers ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 animate-pulse font-black uppercase tracking-[0.2em]">Loading Directory...</td></tr>
                ) : filteredOffers.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 italic">No offers found.</td></tr>
                ) : (
                  filteredOffers.map((o) => {
                    const isEditing = editingOfferId === o.id;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-950/20 transition-colors">
                        <td className="px-6 py-4 font-bold">
                          {isEditing ? (
                            <input type="text" value={editForm.advertiserName} onChange={(e) => setEditForm({ ...editForm, advertiserName: e.target.value })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 font-bold w-full" />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {o.advertiserName}
                              {o.isPromoted && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/20">★ Promo</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-500">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 w-28">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-slate-400 w-7 font-bold">USD:</span>
                                <input 
                                  type="number" 
                                  step="0.0001" 
                                  value={editForm.price} 
                                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} 
                                  className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono text-xs w-full" 
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-emerald-500 font-bold w-7">SAR:</span>
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  value={(editForm.price * 3.75).toFixed(2)} 
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                      setEditForm({ ...editForm, price: val / 3.75 });
                                    }
                                  }} 
                                  className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono text-xs w-full text-emerald-500 font-bold" 
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5 font-mono">
                              <span className="text-slate-900 dark:text-white">${o.price.toFixed(4)}</span>
                              <span className="text-[10px] text-emerald-500 font-bold">{(o.price * 3.75).toFixed(2)} SAR</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {isEditing ? (
                            <input type="number" value={editForm.availableAmount} onChange={(e) => setEditForm({ ...editForm, availableAmount: parseFloat(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 font-mono w-24" />
                          ) : `${o.availableAmount.toLocaleString("en-US")} USDT`}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input type="number" value={editForm.minLimit} onChange={(e) => setEditForm({ ...editForm, minLimit: parseInt(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 w-16" />
                              <span>–</span>
                              <input type="number" value={editForm.maxLimit} onChange={(e) => setEditForm({ ...editForm, maxLimit: parseInt(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 w-20" />
                            </div>
                          ) : `${o.minLimit.toLocaleString("en-US")} – ${o.maxLimit.toLocaleString("en-US")}`}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input type="text" value={editForm.paymentMethods.join(", ")} onChange={(e) => setEditForm({ ...editForm, paymentMethods: e.target.value.split(",").map((x: string) => x.trim()) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 w-full" />
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {o.paymentMethods.map((m: string) => (
                                <span key={m} className="bg-indigo-500/10 text-indigo-500 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-black uppercase">{m}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <input type="checkbox" checked={editForm.isPromoted} onChange={(e) => setEditForm({ ...editForm, isPromoted: e.target.checked })} className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded" />
                          ) : o.isPromoted ? <span className="text-amber-500 font-bold">★ Yes</span> : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleSaveOffer(editForm)} className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-400 font-bold cursor-pointer">Save</button>
                              <button onClick={() => setEditingOfferId(null)} className="px-3 py-1 bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 rounded cursor-pointer">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setTradeModalUserOffer(o);
                                  setVisPrice(o.price.toString());
                                  setVisCurrency(o.userEmail ? "SAR" : "USD");
                                  setVisPayments(o.paymentMethods || []);
                                  setVisTargetEmail(o.userEmail || "");
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer transition-colors"
                              >
                                Trade
                              </button>
                              <button onClick={() => { setEditingOfferId(o.id); setEditForm({ ...o }); }} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold cursor-pointer transition-colors">Edit</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CLIENT ADS (USER POSTED OFFERS) ── */}
      {adminSubTab === "userads" && (
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-2xl mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-black uppercase tracking-tighter">Client Posted Advertisements</h3>
            <span className="bg-indigo-500/10 text-indigo-500 text-[9px] font-black px-2.5 py-1 rounded-xl border border-indigo-500/20 uppercase tracking-wider">
              {offers.filter(o => o.isUserOffer).length} Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
            These are advertisements posted by registered users. You can initiate a counterpart trade session as a visitor — the user will see a regular trader in their chat inbox.
          </p>

          {loadingOffers ? (
            <div className="py-16 text-center text-slate-400 animate-pulse font-black uppercase tracking-[0.2em] text-[10px]">Loading client ads...</div>
          ) : offers.filter(o => o.isUserOffer).length === 0 ? (
            <div className="py-20 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-gray-700" />
              <p className="text-slate-400 dark:text-gray-500 text-sm font-bold">No user-posted advertisements yet.</p>
              <p className="text-slate-400 dark:text-gray-500 text-xs mt-1">When users post their own buy/sell ads, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-gray-950/40 text-slate-400 dark:text-gray-600 text-[9px] font-black uppercase tracking-[0.25em] border-b border-slate-100 dark:border-gray-800">
                    <th className="px-6 py-4">User / Advertiser</th>
                    <th className="px-6 py-4">Trade Type</th>
                    <th className="px-6 py-4">Price / Limits</th>
                    <th className="px-6 py-4">Payment Methods</th>
                    <th className="px-6 py-4">Posted At</th>
                    <th className="px-6 py-4 text-right">Initiate Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-xs">
                  {offers.filter(o => o.isUserOffer).map((o) => (
                    <tr key={o.id} className="hover:bg-indigo-500/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{o.advertiserName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{o.userEmail}</span>
                          <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-indigo-500/20 w-max">Client Ad</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          o.type === "BUY" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>{o.type} USDT</span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">${o.price.toFixed(4)}</div>
                          <div className="text-emerald-500 font-bold">{(o.price * 3.75).toFixed(2)} SAR</div>
                          <div className="text-slate-400">{o.minLimit.toFixed(0)} – {o.maxLimit.toFixed(0)} units</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {o.paymentMethods.map((m: string) => (
                            <span key={m} className="bg-indigo-500/10 text-indigo-500 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-black uppercase">{m}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                        {new Date(Number(o.id.split('_')[2] || Date.now())).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setTradeModalUserOffer(o);
                            setVisPrice(o.price.toString());
                            setVisCurrency("SAR");
                            setVisPayments(o.paymentMethods || []);
                            setVisTargetEmail(o.userEmail || "");
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          Initiate Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PRICE SETTINGS ── */}
      {adminSubTab === "settings" && (
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-slate-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl mb-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Settings2 className="w-6 h-6 text-indigo-500" />
            <h3 className="text-xl font-black uppercase tracking-tighter">P2P Price Range Config</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
            Set the price range (in USD per USDT) for all generated offers. Saving will regenerate all 50 buy and 50 sell offers with natural irregular prices within these ranges.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* BUY */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-500/20 pb-2">BUY Offers</div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex justify-between">
                  <span>Min Price</span>
                  <span className="text-emerald-500 font-bold font-mono">~{(Number(priceRange.buyMin) * 3.75).toFixed(2)} SAR</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 font-mono">USD</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={priceRange.buyMin}
                      onChange={(e) => setPriceRange({ ...priceRange, buyMin: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="USD"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-emerald-500 font-mono">SAR</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(Number(priceRange.buyMin) * 3.75).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setPriceRange({ ...priceRange, buyMin: (val / 3.75).toFixed(4) });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-emerald-500/20 dark:border-emerald-950/20 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors text-emerald-500 font-bold"
                      placeholder="SAR"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex justify-between">
                  <span>Max Price</span>
                  <span className="text-emerald-500 font-bold font-mono">~{(Number(priceRange.buyMax) * 3.75).toFixed(2)} SAR</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 font-mono">USD</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={priceRange.buyMax}
                      onChange={(e) => setPriceRange({ ...priceRange, buyMax: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="USD"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-emerald-500 font-mono">SAR</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(Number(priceRange.buyMax) * 3.75).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setPriceRange({ ...priceRange, buyMax: (val / 3.75).toFixed(4) });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-emerald-500/20 dark:border-emerald-950/20 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors text-emerald-500 font-bold"
                      placeholder="SAR"
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-800 space-y-1">
                <div>USD Range: <span className="font-mono text-emerald-500">${priceRange.buyMin} → ${priceRange.buyMax}</span></div>
                <div>SAR Range: <span className="font-mono text-emerald-500">{(Number(priceRange.buyMin) * 3.75).toFixed(2)} SAR → {(Number(priceRange.buyMax) * 3.75).toFixed(2)} SAR</span></div>
              </div>
            </div>

            {/* SELL */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 border-b border-rose-500/20 pb-2">SELL Offers</div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex justify-between">
                  <span>Min Price</span>
                  <span className="text-rose-500 font-bold font-mono">~{(Number(priceRange.sellMin) * 3.75).toFixed(2)} SAR</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 font-mono">USD</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={priceRange.sellMin}
                      onChange={(e) => setPriceRange({ ...priceRange, sellMin: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors"
                      placeholder="USD"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-rose-500 font-mono">SAR</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(Number(priceRange.sellMin) * 3.75).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setPriceRange({ ...priceRange, sellMin: (val / 3.75).toFixed(4) });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-rose-500/20 dark:border-rose-950/20 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors text-rose-500 font-bold"
                      placeholder="SAR"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex justify-between">
                  <span>Max Price</span>
                  <span className="text-rose-500 font-bold font-mono">~{(Number(priceRange.sellMax) * 3.75).toFixed(2)} SAR</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 font-mono">USD</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={priceRange.sellMax}
                      onChange={(e) => setPriceRange({ ...priceRange, sellMax: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors"
                      placeholder="USD"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-rose-500 font-mono">SAR</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(Number(priceRange.sellMax) * 3.75).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setPriceRange({ ...priceRange, sellMax: (val / 3.75).toFixed(4) });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-gray-900 border border-rose-500/20 dark:border-rose-950/20 rounded-xl pl-12 pr-3 py-3 text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors text-rose-500 font-bold"
                      placeholder="SAR"
                    />
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-800 space-y-1">
                <div>USD Range: <span className="font-mono text-rose-500">${priceRange.sellMin} → ${priceRange.sellMax}</span></div>
                <div>SAR Range: <span className="font-mono text-rose-500">{(Number(priceRange.sellMin) * 3.75).toFixed(2)} SAR → {(Number(priceRange.sellMax) * 3.75).toFixed(2)} SAR</span></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePriceRange}
            disabled={savingRange}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {savingRange ? "Saving & Regenerating..." : "Save Range & Regenerate All Offers"}
          </button>

          {/* Rules Disclaimer Editor */}
          <div className="mt-12 border-t border-slate-200 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-amber-500" />
              <h4 className="text-lg font-black uppercase tracking-tighter">P2P Rules Disclaimer</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
              This text is shown to users when they click "Post My Advertisement". They must accept these rules before creating their ad.
            </p>
            <textarea
              rows={8}
              value={adminRulesText}
              onChange={(e) => setAdminRulesText(e.target.value)}
              placeholder="Enter P2P trading rules here..."
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors dark:text-white text-slate-900 leading-relaxed"
            />
            <button
              onClick={handleSaveRules}
              disabled={savingRules}
              className="mt-4 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {savingRules ? "Saving Rules..." : "Save P2P Rules Disclaimer"}
            </button>
          </div>

          {/* Negotiation Controls */}
          <div className="mt-10 border-t border-slate-200 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h4 className="text-lg font-black uppercase tracking-tighter">Negotiation Controls</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 text-xs">
                <div className="font-black uppercase tracking-wider text-emerald-500 mb-2 text-[10px]">Invoice / Payment Request</div>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
                  In active chat workspace → click the invoice icon to send a <strong>Peer Invoice Request</strong> card directly in the chat. The user sees it as a natural trade step, not as an admin control.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 text-xs">
                <div className="font-black uppercase tracking-wider text-indigo-500 mb-2 text-[10px]">Custom Pseudonym</div>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
                  When opening a client chat workspace, you choose a name (e.g. "Sarah from Riyadh"). All your messages appear under that name — fully natural and indistinguishable from a real trader.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE CHAT WORKSPACE MODAL ── */}
      {activeChat && activeRequestObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">

            {/* Left Side: Details & Actions */}
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-gray-950/50 border-r border-slate-200 dark:border-gray-800 p-6 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Manage <span className="text-indigo-500 not-italic">P2P</span></h3>
                <button onClick={() => setActiveChat(null)} className="p-2 bg-white dark:bg-gray-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-gray-700 transition-colors cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded-2xl mb-4 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">User Details</div>
                <div className="font-bold text-sm mb-1">{activeRequestObj.email}</div>
                <div className="text-xl font-black text-indigo-500 tracking-tighter">{activeRequestObj.type} — {activeRequestObj.amount?.toFixed(4)} USDT</div>
                <div className="mt-2 space-y-0.5 text-[11px]">
                  <div><span className="text-slate-400">Price/USDT: </span><span className="font-mono font-bold">${activeRequestObj.usdPrice?.toFixed(4) ?? "—"}</span></div>
                  <div><span className="text-slate-400">Currency: </span><span className="font-mono">{activeRequestObj.currency || "USD"}</span></div>
                  {activeRequestObj.availableAmount && <div><span className="text-slate-400">Available: </span><span className="font-mono">{activeRequestObj.availableAmount.toLocaleString("en-US")} USDT</span></div>}
                  {(activeRequestObj.minLimit || activeRequestObj.maxLimit) && (
                    <div><span className="text-slate-400">Limits: </span><span className="font-mono">{activeRequestObj.minLimit?.toLocaleString("en-US")} – {activeRequestObj.maxLimit?.toLocaleString("en-US")} {activeRequestObj.currency || "USD"}</span></div>
                  )}
                </div>
              </div>

              {/* Payment methods visible to admin */}
              {activeRequestObj.banks && (
                <div className="bg-indigo-500/5 border border-indigo-500/15 p-3.5 rounded-2xl mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Payment Methods (Admin View)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRequestObj.banks.split(",").map((b: string) => (
                      <span key={b} className="bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-indigo-500/20">{b.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Config */}
              <div className="space-y-3 mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Override Seller Configuration</div>
                <input type="text" placeholder="Seller Name" value={sellerDetails.name} onChange={(e) => setSellerDetails({ ...sellerDetails, name: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="number" placeholder="USD Price Rate" value={sellerDetails.price} onChange={(e) => setSellerDetails({ ...sellerDetails, price: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="text" placeholder="Payment Methods (edit before reveal)" value={sellerDetails.banks} onChange={(e) => setSellerDetails({ ...sellerDetails, banks: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <input type="text" placeholder="Trust Rate (e.g. 99%)" value={sellerDetails.trustRate} onChange={(e) => setSellerDetails({ ...sellerDetails, trustRate: e.target.value })} className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                <button onClick={() => handleUpdateDetails(activeChat)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer">
                  Push Details to User
                </button>
              </div>

              {/* Finalize */}
              <div className="mt-auto space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Finalize Transaction</div>
                <input type="number" placeholder="Exact Balance to Send" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors" />
                <button onClick={() => handleSendBalance(activeChat)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer">
                  Send Balance
                </button>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  💳 Send Peer Invoice Request
                </button>
              </div>
            </div>

            {/* Right Side: Chat */}
            <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-900">
              <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-950/30">
                <div className="flex flex-col">
                  <div className="font-bold text-sm">P2P Secure Chat</div>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                    Replying as: <span className="font-black text-emerald-500">{activeRequestObj.sellerName || "UEA_EXCHANGE"}</span>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No messages yet. Send a message to start.</div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isAdmin = msg.sender === "ADMIN";
                    return (
                      <div key={i} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          {isAdmin ? `You (${activeRequestObj.sellerName || "Advertiser"})` : "User"} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-lg ${isAdmin ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-gray-700"}`}>
                          {msg.image && <img src={msg.image} alt="attachment" className="max-w-full h-auto rounded-xl mb-3 border border-black/10 shadow-sm" />}
                          {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                {selectedImage && (
                  <div className="mb-3 relative inline-block">
                    <img src={selectedImage} alt="preview" className="h-24 rounded-xl border-2 border-indigo-500 shadow-md" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer">
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message the user as ${activeRequestObj.sellerName || "Advertiser"}...`}
                    className="flex-1 bg-slate-50 dark:bg-gray-900 border-2 border-slate-200 dark:border-gray-800 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                  <button type="submit" disabled={!newMessage.trim() && !selectedImage} className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95 cursor-pointer">
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COUNTERPART TRADE INITIATION MODAL ── */}
      {tradeModalUserOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 rounded-[2rem] max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-indigo-500">Initiate Counterpart Trade</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Enter your visitor profile to appear as a regular user to <strong className="text-slate-700 dark:text-white">{tradeModalUserOffer.advertiserName}</strong></p>
              </div>
              <button
                onClick={() => setTradeModalUserOffer(null)}
                className="p-1.5 bg-slate-50 dark:bg-gray-800 text-slate-400 hover:text-rose-500 rounded-full cursor-pointer border border-slate-200 dark:border-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateCounterpartTrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Target Client User Email</label>
                {tradeModalUserOffer.userEmail ? (
                  <div className="bg-slate-100 dark:bg-gray-800 px-4 py-3 rounded-xl font-mono text-slate-600 dark:text-gray-300 font-bold border border-slate-200 dark:border-gray-700">
                    {tradeModalUserOffer.userEmail}
                  </div>
                ) : (
                  <input
                    type="email"
                    required
                    value={visTargetEmail}
                    onChange={(e) => setVisTargetEmail(e.target.value)}
                    placeholder="Enter target client registered email (e.g. client@example.com)"
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Your Visitor Name</label>
                  <input
                    type="text"
                    required
                    value={visName}
                    onChange={(e) => setVisName(e.target.value)}
                    placeholder="e.g. Sarah Al-Rashidi"
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Country</label>
                  <input
                    type="text"
                    value={visCountry}
                    onChange={(e) => setVisCountry(e.target.value)}
                    placeholder="e.g. Saudi Arabia"
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Amount (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={visAmount}
                    onChange={(e) => setVisAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Price Rate (USD)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={visPrice}
                    onChange={(e) => setVisPrice(e.target.value)}
                    placeholder={tradeModalUserOffer.price?.toFixed(4)}
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Currency</label>
                  <select
                    value={visCurrency}
                    onChange={(e) => setVisCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EGP">EGP</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Payment Methods</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-gray-950 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
                  {(PAYMENT_METHODS_BY_CURRENCY[visCurrency] || ["Bank Transfer", "Wise", "PayPal"]).map((m) => {
                    const sel = visPayments.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => sel ? setVisPayments(visPayments.filter(x => x !== m)) : setVisPayments([...visPayments, m])}
                        className={`px-3 py-2 text-[10px] font-black rounded-lg uppercase tracking-wider text-center transition-all cursor-pointer border ${
                          sel ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/25" : "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-500"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Custom Payment / Bank Details (Optional)</label>
                <input
                  type="text"
                  value={visCustomPayment}
                  onChange={(e) => setVisCustomPayment(e.target.value)}
                  placeholder="e.g. Al Rajhi Bank, IBAN SA0328900000..."
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed">
                <strong className="text-indigo-500">Privacy Note:</strong> The user will only see your visitor name (<strong>{visName}</strong>) — they will not know this is initiated by platform admin.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTradeModalUserOffer(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 font-bold rounded-xl cursor-pointer text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVisTrade}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-60"
                >
                  {submittingVisTrade ? "Creating Session..." : "Initiate Counterpart Trade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {showInvoiceModal && activeChat && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 rounded-[2rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-black text-sm uppercase tracking-wider text-amber-500">Send Peer Invoice</h4>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1.5 bg-slate-100 dark:bg-gray-800 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer border border-slate-200 dark:border-gray-700">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Invoice Amount (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="e.g. 250.00"
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500 dark:text-white text-slate-900"
                />
                {invoiceAmount && !isNaN(Number(invoiceAmount)) && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1 font-mono">~{(Number(invoiceAmount) * 3.75).toFixed(2)} SAR equivalent</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Invoice Note (Optional)</label>
                <input
                  type="text"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="e.g. Updated amount per negotiation"
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 dark:text-white text-slate-900"
                />
              </div>
              <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer">
                Send Peer Invoice Card
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
