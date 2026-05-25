import { NextRequest, NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

// GET  – fetch all analytics events
// DELETE – clear all analytics events

export async function GET(_req: NextRequest) {
  try {
    const raw = await getKV("analytics_events");
    const events = raw ? JSON.parse(raw) : [];
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    await putKV("analytics_events", JSON.stringify([]));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics DELETE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
