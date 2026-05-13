import { NextResponse } from "next/server";
import { getPrivateAssets, savePrivateAssets } from "@/lib/db";

export async function GET() {
  const assets = await getPrivateAssets();
  return NextResponse.json({ success: true, assets });
}

export async function POST(req: Request) {
  try {
    const { action, id, price, durationMinutes, currentPrice, assets: fullAssetsUpdate } = await req.json();
    
    // If we are just updating the whole list (from the admin panel inputs)
    if (fullAssetsUpdate && Array.isArray(fullAssetsUpdate)) {
      const finalAssets = fullAssetsUpdate.slice(0, 5);
      await savePrivateAssets(finalAssets);
      return NextResponse.json({ success: true, assets: finalAssets });
    }

    // Otherwise, handle specific manipulation actions
    if (!action || !id) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const assets = await getPrivateAssets();
    const assetIndex = assets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    }

    const asset = assets[assetIndex];

    if (action === "jump") {
      asset.price = price;
      asset.targetPrice = undefined;
      asset.targetStartTime = undefined;
      asset.targetEndTime = undefined;
      asset.targetStartPrice = undefined;
    } else if (action === "target") {
      if (!durationMinutes) {
         return NextResponse.json({ success: false, error: "Missing duration" }, { status: 400 });
      }
      const startPrice = currentPrice || asset.price;
      const now = Date.now();
      asset.price = startPrice;
      asset.targetPrice = price;
      asset.targetStartTime = now;
      asset.targetEndTime = now + durationMinutes * 60 * 1000;
      asset.targetStartPrice = startPrice;
    } else if (action === "clear") {
      asset.targetPrice = undefined;
      asset.targetStartTime = undefined;
      asset.targetEndTime = undefined;
      asset.targetStartPrice = undefined;
    }

    assets[assetIndex] = asset;
    await savePrivateAssets(assets);

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error("Private Assets API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
