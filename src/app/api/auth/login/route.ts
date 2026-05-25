import { NextResponse } from "next/server";
import { getUser, trackUserRegistration, logUserAction } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log("LOGIN ATTEMPT:", email, password);

    const user = await getUser(email);
    console.log("USER FOUND:", user);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    await trackUserRegistration(email);
    await logUserAction(email, "LOGIN", "User securely authenticated and established node link.");

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
