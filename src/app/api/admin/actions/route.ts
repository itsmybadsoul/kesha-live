import { NextResponse } from "next/server";
import { getUserActions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await getUserActions();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch action logs" }, { status: 500 });
  }
}
