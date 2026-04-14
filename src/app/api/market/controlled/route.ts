import { NextResponse } from "next/server";
import { getCustomMarkets } from "@/lib/db";

export const revalidate = 0; // Dynamic route

export async function GET() {
  try {
    const markets = await getCustomMarkets();
    return NextResponse.json({ success: true, data: markets });
  } catch (error) {
    console.error("Error fetching controlled market data:", error);
    return NextResponse.json({ success: false, error: "Failed to load custom market data" }, { status: 500 });
  }
}
