import { NextRequest, NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

// Generates a random nonce string
function generateNonce(): string {
  return Array.from({ length: 48 }, () =>
    Math.random().toString(36)[2] || "0"
  ).join("");
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set.");
      return NextResponse.json({ success: false, error: "Server misconfiguration." }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: "Invalid password." }, { status: 401 });
    }

    // Get or create the current valid nonce from KV
    let nonce = await getKV("admin_session_nonce");
    if (!nonce) {
      nonce = generateNonce();
      await putKV("admin_session_nonce", nonce);
    }

    const res = NextResponse.json({ success: true });

    // Set HttpOnly cookie — never readable by browser JS
    res.cookies.set("admin_session", nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });
  }
}

// DELETE — logout: clears the session cookie
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}

