import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Hide password
  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

// For updating quests, trades, etc.
export async function PATCH(req: Request) {
  try {
    const { email, ...updates } = await req.json();
    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
