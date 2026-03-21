"use client";

import { Bell, X, CheckCheck, Coins, ArrowDownLeft, ArrowUpRight, Activity, Gift, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser, Notification } from "@/context/UserContext";

function NotifIcon({ type }: { type: Notification["type"] }) {
  const map = {
    deposit:  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />,
    withdraw: <ArrowUpRight  className="w-4 h-4 text-rose-400"    />,
    trade:    <Activity      className="w-4 h-4 text-indigo-400"  />,
    kyc:      <Coins         className="w-4 h-4 text-amber-400"   />,
    reward:   <Gift          className="w-4 h-4 text-fuchsia-400" />,
    system:   <Info          className="w-4 h-4 text-gray-400"    />,
  };
  return (
    <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
      {map[type]}
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell() {
  const { notifications, markAllRead, clearNotification } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && unread > 0) markAllRead();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-[#0F1117] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-black text-white uppercase tracking-widest">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-white font-bold uppercase tracking-widest">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-800/50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-xs text-gray-600 font-bold">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${!n.read ? "bg-indigo-500/5" : ""}`}>
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-white truncate">{n.title}</p>
                      <span className="text-[9px] text-gray-600 font-bold shrink-0">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-snug">{n.body}</p>
                  </div>
                  <button onClick={() => clearNotification(n.id)} className="text-gray-700 hover:text-gray-400 transition-colors shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800">
              <a href="/transactions" className="text-[10px] text-indigo-400 hover:text-white font-black uppercase tracking-widest transition-colors">
                View full transaction history →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
