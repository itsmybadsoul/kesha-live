import { NextResponse } from "next/server";
import { getActiveOptionsUsers, OptionsTrade } from "@/lib/db";

export async function GET() {
  try {
    const users = await getActiveOptionsUsers();

    const activeTrades = users.flatMap(user => {
      if (!user.options) return [];
      return user.options
        .filter((trade: OptionsTrade) => trade.status === "ACTIVE")
        .map((trade: OptionsTrade) => ({
          ...trade,
          userEmail: user.email,
          userAvatar: user.avatar
        }));
    });

    activeTrades.sort((a, b) => b.startTime - a.startTime);

    return NextResponse.json({ success: true, activeTrades });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
