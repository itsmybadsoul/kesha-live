import { NextResponse } from "next/server";
import { getPendingDeposits } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const deposits = await getPendingDeposits();
    return NextResponse.json({ success: true, deposits });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
