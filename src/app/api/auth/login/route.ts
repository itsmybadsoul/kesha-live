import { NextResponse } from "next/server";
import { getUser, trackUserRegistration } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    const user = await getUser(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Don't return the password to the client!
    const { password: _, ...safeUser } = user;

    // Fast tracking catch for legacy users who haven't hit the new register route
    await trackUserRegistration(email);

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
