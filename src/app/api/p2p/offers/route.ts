import { NextRequest, NextResponse } from "next/server";
import { getKV, putKV } from "@/lib/db";

export interface P2POffer {
  id: string;
  type: "BUY" | "SELL";
  advertiserName: string;
  ordersCount: number;
  completionRate: number;
  likeRate: number;
  timeLimit: number;
  price: number; // Price in USD
  availableAmount: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  isPromoted: boolean;
}

function generateDefaultOffers(): P2POffer[] {
  const names = [
    "UEA_EXCHANGE", "P2P0100", "Pepo Trader 0", "M9-CRYPTO-KING", "Abu_Fares_Markets",
    "ApexOTC", "BullishRun", "CoinCrusader", "DeltaSwap", "EclipseOTC",
    "FalconP2P", "GoldenGateCrypto", "HorizonP2P", "InfinityOTC", "Jupiter_Swap",
    "KryptonSecure", "LunarCrypto", "MercuryExchange", "NovaP2P", "OrionOTC",
    "PhoenixSwap", "QuasarCrypto", "RedStarP2P", "SiriusOTC", "TitanExchange",
    "UnicornSwap", "VegaP2P", "WolfPackOTC", "XenonCrypto", "ZenithExchange",
    "AlphaSecure", "BetaTraders", "GammaSwap", "OmegaOTC", "SigmaP2P",
    "ZetaCrypto", "ThetaExchange", "KappaOTC", "LambdaSwap", "SigmaTraders",
    "VertexOTC", "NexusSwap", "HelixP2P", "FluxExchange", "VortexOTC",
    "MatrixP2P", "QuantumSwap", "VectorOTC", "StratusExchange", "CirrusP2P"
  ];

  const paymentMethodsPool = [
    ["InstaPay", "Vodafone cash", "Alex Bank"],
    ["Bank Transfer"],
    ["InstaPay"],
    ["Vodafone cash", "InstaPay"],
    ["Bank Transfer", "CIB Bank"],
    ["Fawry", "Vodafone cash"],
    ["Orange Cash", "InstaPay"],
    ["Etisalat Cash", "Fawry"],
    ["National Bank of Egypt", "InstaPay"],
    ["QNB", "Bank Transfer"]
  ];

  const offers: P2POffer[] = [];

  // Generate 50 BUY offers
  for (let i = 0; i < 50; i++) {
    const name = names[i % names.length];
    const ordersCount = Math.floor(Math.random() * 950) + 50;
    const completionRate = parseFloat((90 + Math.random() * 10).toFixed(2));
    const likeRate = parseFloat((85 + Math.random() * 15).toFixed(2));
    const price = parseFloat((1.01 + (i * 0.002)).toFixed(3));
    const availableAmount = parseFloat((500 + Math.random() * 9500).toFixed(2));
    const minLimit = Math.floor(Math.random() * 50) + 10;
    const maxLimit = Math.floor(availableAmount * 0.8) + 100;
    const paymentMethods = paymentMethodsPool[i % paymentMethodsPool.length];
    
    offers.push({
      id: `offer_buy_${i}`,
      type: "BUY",
      advertiserName: `${name}_${i === 0 ? "EX" : i}`,
      ordersCount,
      completionRate,
      likeRate,
      timeLimit: 15,
      price,
      availableAmount,
      minLimit,
      maxLimit,
      paymentMethods,
      isPromoted: i === 0
    });
  }

  // Generate 50 SELL offers
  for (let i = 0; i < 50; i++) {
    const name = names[(i + 25) % names.length];
    const ordersCount = Math.floor(Math.random() * 950) + 50;
    const completionRate = parseFloat((90 + Math.random() * 10).toFixed(2));
    const likeRate = parseFloat((85 + Math.random() * 15).toFixed(2));
    const price = parseFloat((0.99 - (i * 0.002)).toFixed(3));
    const availableAmount = parseFloat((500 + Math.random() * 9500).toFixed(2));
    const minLimit = Math.floor(Math.random() * 50) + 10;
    const maxLimit = Math.floor(availableAmount * 0.8) + 100;
    const paymentMethods = paymentMethodsPool[(i + 5) % paymentMethodsPool.length];

    offers.push({
      id: `offer_sell_${i}`,
      type: "SELL",
      advertiserName: `${name}_${i === 0 ? "PRO" : i}`,
      ordersCount,
      completionRate,
      likeRate,
      timeLimit: 15,
      price,
      availableAmount,
      minLimit,
      maxLimit,
      paymentMethods,
      isPromoted: i === 0
    });
  }

  return offers;
}

export async function GET() {
  try {
    const raw = await getKV("p2p_offers");
    let offers: P2POffer[] = raw ? JSON.parse(raw) : [];
    
    if (offers.length === 0) {
      offers = generateDefaultOffers();
      await putKV("p2p_offers", JSON.stringify(offers));
    }
    
    return NextResponse.json({ offers });
  } catch (err) {
    console.error("GET P2P offers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, offer } = body;
    
    const raw = await getKV("p2p_offers");
    let offers: P2POffer[] = raw ? JSON.parse(raw) : [];
    if (offers.length === 0) {
      offers = generateDefaultOffers();
    }

    if (action === "update") {
      const idx = offers.findIndex(o => o.id === offer.id);
      if (idx !== -1) {
        offers[idx] = { ...offers[idx], ...offer };
        await putKV("p2p_offers", JSON.stringify(offers));
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST P2P offers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
