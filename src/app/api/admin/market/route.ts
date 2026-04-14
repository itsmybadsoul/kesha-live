import { NextResponse } from "next/server";
import { getCustomMarkets, saveCustomMarkets } from "@/lib/db";

export async function GET() {
  const markets = await getCustomMarkets();
  return NextResponse.json({ success: true, markets });
}

export async function POST(req: Request) {
  try {
    const { action, sym, price, durationMinutes } = await req.json();
    if (!action || !sym || price === undefined) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const markets = await getCustomMarkets();
    const stockIndex = markets.findIndex(m => m.sym === sym);
    if (stockIndex === -1) {
      return NextResponse.json({ success: false, error: "Stock not found" }, { status: 404 });
    }

    const stock = markets[stockIndex];

    if (action === "jump") {
      // Instantly change the base price and clear any targets
      stock.basePrice = price;
      stock.targetPrice = undefined;
      stock.targetStartTime = undefined;
      stock.targetEndTime = undefined;
      stock.targetStartPrice = undefined;
    } else if (action === "target") {
      // Set a target to be interpolated
      if (!durationMinutes) {
         return NextResponse.json({ success: false, error: "Missing duration" }, { status: 400 });
      }
      
      // We need to know what the latest price was roughly to start from.
      // But the server doesn't know the exact random jitter the client is showing.
      // It DOES know the current basePrice, or if a previous target was running, where it roughly is.
      // For simplicity, let's calculate where it should be right now based on old targets, or default to base price.
      let currentPrice = stock.basePrice;
      const now = Date.now();
      if (stock.targetPrice && stock.targetEndTime && stock.targetStartTime && stock.targetStartPrice) {
        if (now < stock.targetEndTime) {
           const progress = (now - stock.targetStartTime) / (stock.targetEndTime - stock.targetStartTime);
           currentPrice = stock.targetStartPrice + (stock.targetPrice - stock.targetStartPrice) * progress;
        } else {
           currentPrice = stock.targetPrice;
        }
      }

      stock.basePrice = currentPrice; // Set base to current so it starts correctly
      stock.targetPrice = price;
      stock.targetStartTime = now;
      stock.targetEndTime = now + durationMinutes * 60 * 1000;
      stock.targetStartPrice = currentPrice;
    } else if (action === "clear") {
       // Just clear the target
       stock.targetPrice = undefined;
       stock.targetStartTime = undefined;
       stock.targetEndTime = undefined;
       stock.targetStartPrice = undefined;
    } else {
      return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }

    markets[stockIndex] = stock;
    await saveCustomMarkets(markets);

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    console.error("Admin Market control error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
