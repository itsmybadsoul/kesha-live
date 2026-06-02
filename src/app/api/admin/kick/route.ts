import { NextRequest, NextResponse } from "next/server";
import { putKV } from "@/lib/db";

// Generates a new random nonce
function generateNonce(): string {
  return Array.from({ length: 48 }, () =>
    Math.random().toString(36)[2] || "0"
  ).join("");
}

// POST — rotate nonce, instantly invalidates ALL active admin sessions
export async function POST(req: NextRequest) {
  try {
    // Verify the caller is authenticated first
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // Rotate the nonce — this invalidates every existing cookie
    const newNonce = generateNonce();
    await putKV("admin_session_nonce", newNonce);

    // Clear the caller's own cookie too (they get logged out as well)
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Failed to kick sessions." }, { status: 500 });
  }
}
