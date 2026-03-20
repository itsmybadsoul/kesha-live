import { NextResponse } from "next/server";
import { getUser } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, seedPhrase } = await req.json();
    
    const user = await getUser(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials or phrase" }, { status: 401 });
    }

    if (!user.seedPhrase || user.seedPhrase.join(" ").toLowerCase().trim() !== seedPhrase.toLowerCase().trim()) {
       return NextResponse.json({ error: "Invalid recovery phrase" }, { status: 401 });
    }

    // Don't return the password to the client!
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
