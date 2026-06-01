"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import {
  CheckCircle2, XCircle, ArrowRightLeft, ShieldCheck,
  Send, Image as ImageIcon, Trash2, Settings2, RefreshCw
} from "lucide-react";

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
  const [adminSubTab, setAdminSubTab] = useState<"sessions" | "directory" | "settings">("sessions");
  const [directoryType, setDirectoryType] = useState<"BUY" | "SELL">("BUY");
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Price range settings
  const [priceRange, setPriceRange] = useState({ buyMin: "1.005", buyMax: "1.045", sellMin: "0.960", sellMax: "0.998" });
  const [savingRange, setSavingRange] = useState(false);

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

    const optimisticMsg = { id: "temp_" + Date.now(), sender: "ADMIN", text: msgText, image: msgImage, timestamp: Date.now() };
    setChatMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch("/api/p2p/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeChat, sender: "ADMIN", text: msgText, image: msgImage })
      });
      fetchChat(activeChat);
    } catch (e) { toast("Failed to send message", "error"); }
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
        {(["sessions", "directory", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAdminSubTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              adminSubTab === tab
                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                : "bg-white dark:bg-gray-900 text-slate-500 hover:text-emerald-500 border-slate-200 dark:border-gray-800"
            }`}
          >
            {tab === "sessions" ? "Active Sessions & Chats" : tab === "directory" ? "Manage P2P Offers" : "⚙ Price Settings"}
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
                          <div className="text-[10px] text-slate-400 font-mono opacity-60">{new Date(r.createdAt).toLocaleString()}</div>
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
                          <div><span className="text-slate-400">Available: </span><span className="font-mono">{r.availableAmount ? r.availableAmount.toLocaleString() + " USDT" : "—"}</span></div>
                          {(r.minLimit || r.maxLimit) && (
                            <div><span className="text-slate-400">Limits: </span><span className="font-mono">{r.minLimit?.toLocaleString()} – {r.maxLimit?.toLocaleString()} {r.currency || "USD"}</span></div>
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
                      ? `bg-white dark:bg-gray-855 ${t === "BUY" ? "text-emerald-500" : "text-rose-500"} shadow-sm`
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
                  <th className="px-6 py-4">Price (USD/USDT)</th>
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
                            <input type="number" step="0.001" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 font-mono w-24" />
                          ) : `$${o.price.toFixed(4)}`}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {isEditing ? (
                            <input type="number" value={editForm.availableAmount} onChange={(e) => setEditForm({ ...editForm, availableAmount: parseFloat(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-2 py-1 font-mono w-24" />
                          ) : `${o.availableAmount.toLocaleString()} USDT`}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input type="number" value={editForm.minLimit} onChange={(e) => setEditForm({ ...editForm, minLimit: parseInt(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 w-16" />
                              <span>–</span>
                              <input type="number" value={editForm.maxLimit} onChange={(e) => setEditForm({ ...editForm, maxLimit: parseInt(e.target.value) })} className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded px-1.5 py-0.5 w-20" />
                            </div>
                          ) : `${o.minLimit.toLocaleString()} – ${o.maxLimit.toLocaleString()}`}
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
                            <button onClick={() => { setEditingOfferId(o.id); setEditForm({ ...o }); }} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold cursor-pointer">Edit</button>
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
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Min Price (USD/USDT)</label>
                <input
                  type="number"
                  step="0.001"
                  value={priceRange.buyMin}
                  onChange={(e) => setPriceRange({ ...priceRange, buyMin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Max Price (USD/USDT)</label>
                <input
                  type="number"
                  step="0.001"
                  value={priceRange.buyMax}
                  onChange={(e) => setPriceRange({ ...priceRange, buyMax: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
                Example prices: <span className="font-mono text-emerald-500">${priceRange.buyMin} → ${priceRange.buyMax}</span>
              </div>
            </div>

            {/* SELL */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 border-b border-rose-500/20 pb-2">SELL Offers</div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Min Price (USD/USDT)</label>
                <input
                  type="number"
                  step="0.001"
                  value={priceRange.sellMin}
                  onChange={(e) => setPriceRange({ ...priceRange, sellMin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Max Price (USD/USDT)</label>
                <input
                  type="number"
                  step="0.001"
                  value={priceRange.sellMax}
                  onChange={(e) => setPriceRange({ ...priceRange, sellMax: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
                Example prices: <span className="font-mono text-rose-500">${priceRange.sellMin} → ${priceRange.sellMax}</span>
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
                <button onClick={() => setActiveChat(null)} className="p-2 bg-white dark:bg-gray-855 rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200 dark:border-gray-700 transition-colors cursor-pointer">
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
                  {activeRequestObj.availableAmount && <div><span className="text-slate-400">Available: </span><span className="font-mono">{activeRequestObj.availableAmount.toLocaleString()} USDT</span></div>}
                  {(activeRequestObj.minLimit || activeRequestObj.maxLimit) && (
                    <div><span className="text-slate-400">Limits: </span><span className="font-mono">{activeRequestObj.minLimit?.toLocaleString()} – {activeRequestObj.maxLimit?.toLocaleString()} {activeRequestObj.currency || "USD"}</span></div>
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
    </>
  );
}
