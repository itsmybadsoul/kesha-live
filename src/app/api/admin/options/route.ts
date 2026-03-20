import { NextResponse } from "next/server";
import { getActiveOptionsUsers, OptionsTrade } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    // Collect all active options trades from all tracked users
    const users = await getActiveOptionsUsers();
    
    // Flatten into a single array for the Admin table
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

    // Sort by latest started
    activeTrades.sort((a, b) => b.startTime - a.startTime);

    return NextResponse.json({ success: true, activeTrades });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
