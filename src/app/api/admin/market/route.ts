import { NextResponse } from "next/server";
import { getCustomMarkets, saveCustomMarkets, DEFAULT_CUSTOM_STOCKS } from "@/lib/db";

export async function GET() {
  let markets = await getCustomMarkets();
  
  // Migration: Ensure all default stocks/cryptos exist in the KV store
  let changed = false;
  DEFAULT_CUSTOM_STOCKS.forEach(def => {
    const exists = markets.find(m => m.sym === def.sym);
    if (!exists) {
      markets.push(def);
      changed = true;
    } else if (!exists.category) {
      // Add category if missing on existing items
      exists.category = def.category;
      changed = true;
    }
  });

  if (changed) {
    await saveCustomMarkets(markets);
  }

  return NextResponse.json({ success: true, markets });
}

export async function POST(req: Request) {
  try {
    const { action, sym, price, durationMinutes, currentPrice } = await req.json();
    if (!action || !sym || (price === undefined && action !== "clear")) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const markets = await getCustomMarkets();
    const stockIndex = markets.findIndex(m => m.sym === sym);
    if (stockIndex === -1) {
      return NextResponse.json({ success: false, error: "Market not found" }, { status: 404 });
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
      
      // We use the current live price from the admin panel if provided, 
      // otherwise fallback to internal calculation
      let startPrice = currentPrice || stock.basePrice;
      const now = Date.now();
      
      // If we already have an active target and no currentPrice was provided, 
      // calculate where it should be now.
      if (!currentPrice && stock.targetPrice && stock.targetEndTime && stock.targetStartTime && stock.targetStartPrice) {
        if (now < stock.targetEndTime) {
           const progress = (now - stock.targetStartTime) / (stock.targetEndTime - stock.targetStartTime);
           startPrice = stock.targetStartPrice + (stock.targetPrice - stock.targetStartPrice) * progress;
        } else {
           startPrice = stock.targetPrice;
        }
      }

      stock.basePrice = startPrice; 
      stock.targetPrice = price;
      stock.targetStartTime = now;
      stock.targetEndTime = now + durationMinutes * 60 * 1000;
      stock.targetStartPrice = startPrice;
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
