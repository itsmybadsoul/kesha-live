import { NextResponse } from "next/server";
import { getGlobalOptionsHistory } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const history = await getGlobalOptionsHistory();
    return NextResponse.json({ success: true, history });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

