import { NextRequest, NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

export interface AnalyticsEvent {
  id: string;
  type: "pageview" | "click";
  path: string;
  sessionId: string;
  email: string | null;
  element?: string;
  label?: string;
  referrer?: string | null;
  userAgent?: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  timestamp: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Cloudflare injects these headers automatically in production
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const country = req.headers.get("cf-ipcountry") || "unknown";
    const city = req.headers.get("cf-ipcity") || "unknown";
    const region = req.headers.get("cf-region") || "unknown";

    const event: AnalyticsEvent = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      type: body.type ?? "pageview",
      path: body.path ?? "/",
      sessionId: body.sessionId ?? "unknown",
      email: body.email ?? null,
      element: body.element,
      label: body.label,
      referrer: body.referrer,
      userAgent: body.userAgent,
      ip,
      country,
      city,
      region,
      timestamp: body.timestamp ?? Date.now(),
    };

    // Load existing events (capped to 2000 most recent)
    const raw = await getKV("analytics_events");
    let events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift(event);
    if (events.length > 2000) events = events.slice(0, 2000);

    await putKV("analytics_events", JSON.stringify(events));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
