import { NextResponse } from "next/server";
import { getKV } from "@/lib/db";

export async function GET() {
  const sessionsList = await getKV("abufares_sessions");
  const sessions: string[] = sessionsList ? JSON.parse(sessionsList) : [];
  return NextResponse.json({ sessions });
}
