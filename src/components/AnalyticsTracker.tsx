"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("_sid");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", sid);
  }
  return sid;
}

function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ys_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email ?? null;
  } catch {
    return null;
  }
}

async function sendEvent(payload: object) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Silently ignore – analytics should never break the app
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  // Track page views on route change
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    sendEvent({
      type: "pageview",
      path: pathname,
      sessionId: getSessionId(),
      email: getStoredEmail(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  }, [pathname]);

  // Track clicks globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Identify the most meaningful element (climb up to find button/a/input)
      let el: HTMLElement | null = target;
      for (let i = 0; i < 4; i++) {
        if (!el) break;
        const tag = el.tagName?.toLowerCase();
        if (["button", "a", "input", "select", "textarea"].includes(tag)) break;
        el = el.parentElement;
      }
      if (!el) el = target;

      const label =
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.textContent?.trim().substring(0, 60) ||
        el.tagName?.toLowerCase();

      sendEvent({
        type: "click",
        path: window.location.pathname,
        element: el.tagName?.toLowerCase(),
        label,
        sessionId: getSessionId(),
        email: getStoredEmail(),
        timestamp: Date.now(),
      });
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
