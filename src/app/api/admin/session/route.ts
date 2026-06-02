import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/db";

// GET — check if the current session cookie is valid
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const validNonce = await getKV("admin_session_nonce");

    if (!validNonce || sessionCookie !== validNonce) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
