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
  userEmail?: string;
  isUserOffer?: boolean;
}

interface PriceRange {
  buyMin: number;
  buyMax: number;
  sellMin: number;
  sellMax: number;
}

const DEFAULT_PRICE_RANGE: PriceRange = {
  buyMin: 1.005,
  buyMax: 1.045,
  sellMin: 0.960,
  sellMax: 0.998,
};

const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EGP: 50.0,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  TRY: 32.5
};

/** Generates a natural-looking fractional price within [min, max] */
function naturalPrice(min: number, max: number, seed: number): number {
  // Use a deterministic-ish variation spread across the range
  const t = (Math.sin(seed * 127.1 + 311.7) * 0.5 + 0.5); // pseudo-random 0..1
  const raw = min + t * (max - min);
  // Round to 2 decimal places with occasional 3rd decimal
  const decimals = seed % 3 === 0 ? 3 : 2;
  return parseFloat(raw.toFixed(decimals));
}

function generateDefaultOffers(range: PriceRange): P2POffer[] {
  const names = [
    "UEA_EXCHANGE", "P2P0100", "Pepo_Trader", "M9-CRYPTO-KING", "Abu_Fares_Markets",
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
    ["InstaPay", "Vodafone Cash", "Alex Bank"],
    ["Bank Transfer"],
    ["InstaPay"],
    ["Vodafone Cash", "InstaPay"],
    ["Bank Transfer", "CIB Bank"],
    ["Fawry", "Vodafone Cash"],
    ["Orange Cash", "InstaPay"],
    ["Etisalat Cash", "Fawry"],
    ["National Bank of Egypt", "InstaPay"],
    ["QNB", "Bank Transfer"]
  ];

  const offers: P2POffer[] = [];

  // Generate 50 BUY offers — prices distributed naturally across buyMin..buyMax
  for (let i = 0; i < 50; i++) {
    const name = names[i % names.length];
    const ordersCount = Math.floor(Math.sin(i * 31.4) * 450 + 500);
    const completionRate = parseFloat((90 + (Math.sin(i * 7.3) * 0.5 + 0.5) * 10).toFixed(1));
    const likeRate = parseFloat((85 + (Math.sin(i * 13.7) * 0.5 + 0.5) * 15).toFixed(1));
    const price = naturalPrice(range.buyMin, range.buyMax, i + 1);
    const availableAmount = parseFloat((500 + (Math.sin(i * 19.1) * 0.5 + 0.5) * 9500).toFixed(0));
    const minLimit = Math.floor((Math.sin(i * 41.0) * 0.5 + 0.5) * 50) + 10;
    const maxLimit = Math.floor(availableAmount * 0.8) + 100;
    const paymentMethods = paymentMethodsPool[i % paymentMethodsPool.length];

    offers.push({
      id: `offer_buy_${i}`,
      type: "BUY",
      advertiserName: i === 0 ? `${name}_EX` : `${name}_${i}`,
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

  // Generate 50 SELL offers — prices distributed naturally across sellMin..sellMax
  for (let i = 0; i < 50; i++) {
    const name = names[(i + 25) % names.length];
    const ordersCount = Math.floor(Math.sin(i * 29.3) * 450 + 500);
    const completionRate = parseFloat((90 + (Math.sin(i * 11.1) * 0.5 + 0.5) * 10).toFixed(1));
    const likeRate = parseFloat((85 + (Math.sin(i * 17.9) * 0.5 + 0.5) * 15).toFixed(1));
    const price = naturalPrice(range.sellMin, range.sellMax, i + 51);
    const availableAmount = parseFloat((500 + (Math.sin(i * 23.7) * 0.5 + 0.5) * 9500).toFixed(0));
    const minLimit = Math.floor((Math.sin(i * 37.3) * 0.5 + 0.5) * 50) + 10;
    const maxLimit = Math.floor(availableAmount * 0.8) + 100;
    const paymentMethods = paymentMethodsPool[(i + 5) % paymentMethodsPool.length];

    offers.push({
      id: `offer_sell_${i}`,
      type: "SELL",
      advertiserName: i === 0 ? `${name}_PRO` : `${name}_${i}`,
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
    // Always load the price range from KV so admin changes apply immediately
    const rangeRaw = await getKV("p2p_price_range");
    const range: PriceRange = rangeRaw ? JSON.parse(rangeRaw) : DEFAULT_PRICE_RANGE;

    const raw = await getKV("p2p_offers_v2");
    let offers: P2POffer[] = raw ? JSON.parse(raw) : [];

    if (offers.length === 0) {
      offers = generateDefaultOffers(range);
      await putKV("p2p_offers_v2", JSON.stringify(offers));
    }

    return NextResponse.json({ offers, priceRange: range });
  } catch (err) {
    console.error("GET P2P offers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, offer, priceRange } = body;

    // Admin: update price range and regenerate offers
    if (action === "set_price_range") {
      const range: PriceRange = {
        buyMin: Number(priceRange.buyMin),
        buyMax: Number(priceRange.buyMax),
        sellMin: Number(priceRange.sellMin),
        sellMax: Number(priceRange.sellMax),
      };
      await putKV("p2p_price_range", JSON.stringify(range));
      const newOffers = generateDefaultOffers(range);
      await putKV("p2p_offers_v2", JSON.stringify(newOffers));
      return NextResponse.json({ success: true, priceRange: range });
    }

    const rangeRaw = await getKV("p2p_price_range");
    const range: PriceRange = rangeRaw ? JSON.parse(rangeRaw) : DEFAULT_PRICE_RANGE;

    const raw = await getKV("p2p_offers_v2");
    let offers: P2POffer[] = raw ? JSON.parse(raw) : generateDefaultOffers(range);

    if (action === "create_user_offer") {
      const { advertiserName, type, price, availableAmount, minLimit, maxLimit, paymentMethods, currency, userEmail } = body;
      if (!advertiserName || !type || !price || !availableAmount || !userEmail) {
        return NextResponse.json({ error: "Missing required fields for user advertisement" }, { status: 400 });
      }

      const rate = CURRENCY_RATES[currency || "USD"] || 1.0;
      const usdPrice = Number(price) / rate;

      const newOffer: P2POffer = {
        id: `user_offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        advertiserName,
        ordersCount: 0,
        completionRate: 0,
        likeRate: 0,
        timeLimit: 15,
        price: parseFloat(usdPrice.toFixed(4)),
        availableAmount: Number(availableAmount),
        minLimit: Number(minLimit) / rate,
        maxLimit: Number(maxLimit) / rate,
        paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods],
        isPromoted: false,
        userEmail,
        isUserOffer: true
      };

      offers.unshift(newOffer);
      await putKV("p2p_offers_v2", JSON.stringify(offers));
      return NextResponse.json({ success: true, offer: newOffer });
    }

    if (action === "update") {
      const idx = offers.findIndex(o => o.id === offer.id);
      if (idx !== -1) {
        offers[idx] = { ...offers[idx], ...offer };
        await putKV("p2p_offers_v2", JSON.stringify(offers));
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (action === "reset") {
      offers = generateDefaultOffers(range);
      await putKV("p2p_offers_v2", JSON.stringify(offers));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST P2P offers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
