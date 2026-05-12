import { NextResponse } from "next/server";
import { getPrivateAssets, savePrivateAssets } from "@/lib/db";

export async function GET() {
  const assets = await getPrivateAssets();
  return NextResponse.json({ success: true, assets });
}

export async function POST(req: Request) {
  try {
    const { assets } = await req.json();
    if (!assets || !Array.isArray(assets)) {
      return NextResponse.json({ success: false, error: "Invalid assets data" }, { status: 400 });
    }
    
    // Safety check: only allow 5 assets
    const finalAssets = assets.slice(0, 5);
    await savePrivateAssets(finalAssets);
    
    return NextResponse.json({ success: true, assets: finalAssets });
  } catch (error) {
    console.error("Private Assets API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
