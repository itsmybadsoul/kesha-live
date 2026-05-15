// KV Database layer for Cloudflare Pages + OpenNext
// Uses getCloudflareContext() as the primary method to access bindings — this is
// the ONLY reliable way to get env in OpenNext/Cloudflare Pages deployments.

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface OptionsTrade {
  id: string;
  asset: string;
  amount: number;
  direction: "UP" | "DOWN";
  strikePrice: number;
  startTime: number;
  durationMinutes: number;
  status: "ACTIVE" | "COMPLETED";
  adminResult: "WIN" | "LOSE" | null;
  payout: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "deposit" | "withdraw" | "trade" | "kyc" | "reward" | "system";
  read: boolean;
  timestamp: number;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  balance: number;
  avatar: string;
  quests: any[];
  trades: any[];
  pendingDeposit?: {
    amount: number;
    txid: string;
    timestamp: number;
  } | null;
  pendingWithdrawal?: {
    amount: number;
    method: "CRYPTO" | "BANK";
    details: string;
    timestamp: number;
  } | null;
  holdings: Record<string, number>;
  options: OptionsTrade[];
  hasDepositBonus?: boolean;
  kycStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  seedPhrase?: string[];
  kycDocuments?: {
    idFront: string;
    idBack: string;
    timestamp: number;
  };
  notifications?: Notification[];
}

export interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  timestamp: number;
}

// Local in-memory fallback for development
const mockDB: Record<string, string> = {};

/**
 * Get the Cloudflare KV binding from context.
 * This is the CORRECT way for OpenNext + Cloudflare Pages.
 * Falls back to mockDB for local development.
 */
async function getDB(): Promise<KVNamespace | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DATABASE) {
      return ctx.env.DATABASE as KVNamespace;
    }
  } catch (_) {
    // Not in a Cloudflare runtime (e.g., local next dev)
  }
  return null;
}

export async function getKV(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    if (db) return await db.get(key);
  } catch (err) {
    console.error(`KV Get Error for ${key}:`, err);
  }
  return mockDB[key] ?? null;
}

export async function putKV(key: string, value: string): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.put(key, value);
      return;
    }
  } catch (err) {
    console.error(`KV Put Error for ${key}:`, err);
  }
  mockDB[key] = value;
}

// ── User helpers ────────────────────────────────────────────────────────────

export async function getUser(email: string, _env?: any): Promise<UserData | null> {
  const data = await getKV(`user:${email}`);
  return data ? JSON.parse(data) : null;
}

export async function saveUser(user: UserData, _env?: any): Promise<void> {
  await putKV(`user:${user.email}`, JSON.stringify(user));
}

// ── Pending Deposits ─────────────────────────────────────────────────────────

export async function getPendingDeposits(_env?: any): Promise<UserData[]> {
  const list = await getKV("pending_deposits_list");
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e)));
  return users.filter((u): u is UserData => !!u && !!u.pendingDeposit);
}

export async function trackPendingDeposit(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_deposits_list");
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("pending_deposits_list", JSON.stringify(emails));
  }
}

export async function untrackPendingDeposit(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_deposits_list");
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("pending_deposits_list", JSON.stringify(emails));
}

// ── Pending Withdrawals ───────────────────────────────────────────────────────

export async function getPendingWithdrawals(_env?: any): Promise<UserData[]> {
  const list = await getKV("pending_withdrawals_list");
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e)));
  return users.filter((u): u is UserData => !!u && !!u.pendingWithdrawal);
}

export async function trackPendingWithdrawal(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_withdrawals_list");
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("pending_withdrawals_list", JSON.stringify(emails));
  }
}

export async function untrackPendingWithdrawal(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_withdrawals_list");
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("pending_withdrawals_list", JSON.stringify(emails));
}

// ── KYC ───────────────────────────────────────────────────────────────────────

export async function getPendingKYCs(_env?: any): Promise<UserData[]> {
  const list = await getKV("pending_kyc_list");
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e)));
  return users.filter((u): u is UserData => !!u && u.kycStatus === 'PENDING');
}

export async function trackPendingKYC(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_kyc_list");
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("pending_kyc_list", JSON.stringify(emails));
  }
}

export async function untrackPendingKYC(email: string, _env?: any): Promise<void> {
  const list = await getKV("pending_kyc_list");
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("pending_kyc_list", JSON.stringify(emails));
}

// ── All Users ─────────────────────────────────────────────────────────────────

export async function getAllUsers(_env?: any): Promise<UserData[]> {
  const list = await getKV("all_users_list");
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e)));
  return users.filter((u): u is UserData => !!u);
}

export async function trackUserRegistration(email: string, _env?: any): Promise<void> {
  const list = await getKV("all_users_list");
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("all_users_list", JSON.stringify(emails));
  }
}

// ── Support Tickets ───────────────────────────────────────────────────────────

export async function getSupportTickets(_env?: any): Promise<SupportTicket[]> {
  const list = await getKV("support_tickets");
  if (!list) return [];
  return JSON.parse(list);
}

export async function addSupportTicket(ticket: SupportTicket, _env?: any): Promise<void> {
  const list = await getKV("support_tickets");
  let tickets: SupportTicket[] = list ? JSON.parse(list) : [];
  tickets.unshift(ticket);
  await putKV("support_tickets", JSON.stringify(tickets));
}

export async function clearSupportTicket(id: string, _env?: any): Promise<void> {
  const list = await getKV("support_tickets");
  if (!list) return;
  let tickets: SupportTicket[] = JSON.parse(list);
  tickets = tickets.filter(t => t.id !== id);
  await putKV("support_tickets", JSON.stringify(tickets));
}

// ── Options Tracking ──────────────────────────────────────────────────────────

export async function getActiveOptionsUsers(_env?: any): Promise<UserData[]> {
  const list = await getKV("active_options_users");
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e)));
  return users.filter((u): u is UserData => !!u && u.options?.some(o => o.status === "ACTIVE"));
}

export async function trackActiveOptionsUser(email: string, _env?: any): Promise<void> {
  const list = await getKV("active_options_users");
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("active_options_users", JSON.stringify(emails));
  }
}

export async function untrackActiveOptionsUser(email: string, _env?: any): Promise<void> {
  const user = await getUser(email);
  if (user && user.options?.some(o => o.status === "ACTIVE")) return;
  const list = await getKV("active_options_users");
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("active_options_users", JSON.stringify(emails));
}

export async function getGlobalOptionsHistory(_env?: any): Promise<(OptionsTrade & { email: string; resolvedAt: number })[]> {
  const list = await getKV("global_options_history");
  if (!list) return [];
  return JSON.parse(list);
}

export async function addGlobalOptionsHistory(trade: OptionsTrade, email: string, _env?: any): Promise<void> {
  const list = await getKV("global_options_history");
  let history: (OptionsTrade & { email: string; resolvedAt: number })[] = list ? JSON.parse(list) : [];
  history.unshift({ ...trade, email, resolvedAt: Date.now() });
  if (history.length > 300) history = history.slice(0, 300);
  await putKV("global_options_history", JSON.stringify(history));
}

// ── Custom Managed Markets ──────────────────────────────────────────────────

export interface CustomStock {
  sym: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
  category: "STOCK" | "CRYPTO";
  targetPrice?: number;
  targetStartTime?: number;
  targetEndTime?: number;
  targetStartPrice?: number;
}

export const DEFAULT_CUSTOM_STOCKS: CustomStock[] = [
  // Stocks
  { sym: "NXT", name: "NextGen Tech", sector: "Tech", basePrice: 150.00, volatility: 2.5, category: "STOCK" },
  { sym: "QNTM", name: "Quantum Computing Solutions", sector: "Tech", basePrice: 45.20, volatility: 4.0, category: "STOCK" },
  { sym: "EVM", name: "EcoVehicle Motors", sector: "Automotive", basePrice: 210.50, volatility: 3.5, category: "STOCK" },
  { sym: "AIG", name: "AI Global Systems", sector: "Tech", basePrice: 89.30, volatility: 2.8, category: "STOCK" },
  { sym: "SLR", name: "Solaris Energy", sector: "Energy", basePrice: 34.10, volatility: 1.5, category: "STOCK" },
  { sym: "BIOX", name: "BioX Pharma", sector: "Pharma", basePrice: 120.40, volatility: 2.1, category: "STOCK" },
  { sym: "CRPT", name: "Cryptographic Holdings", sector: "Finance", basePrice: 500.00, volatility: 5.0, category: "STOCK" },
  { sym: "AERO", name: "AeroDynamics Inc", sector: "Industrial", basePrice: 245.80, volatility: 1.2, category: "STOCK" },
  { sym: "VRTX", name: "Vertex Meta Platforms", sector: "Media", basePrice: 65.00, volatility: 3.2, category: "STOCK" },
  { sym: "AUR", name: "Aura Gold Mining", sector: "Industrial", basePrice: 18.50, volatility: 1.8, category: "STOCK" },
  // Cryptocurrencies
  { sym: "BTC", name: "Bitcoin", sector: "Currency", basePrice: 0, volatility: 4.5, category: "CRYPTO" },
  { sym: "ETH", name: "Ethereum", sector: "Currency", basePrice: 0, volatility: 5.2, category: "CRYPTO" },
  { sym: "SOL", name: "Solana", sector: "Currency", basePrice: 0, volatility: 8.5, category: "CRYPTO" },
  { sym: "BNB", name: "Binance Coin", sector: "Currency", basePrice: 0, volatility: 3.5, category: "CRYPTO" },
  { sym: "XRP", name: "Ripple", sector: "Currency", basePrice: 0, volatility: 6.0, category: "CRYPTO" },
  { sym: "ADA", name: "Cardano", sector: "Currency", basePrice: 0, volatility: 5.5, category: "CRYPTO" },
  { sym: "DOGE", name: "Dogecoin", sector: "Currency", basePrice: 0, volatility: 12.0, category: "CRYPTO" },
  { sym: "LINK", name: "Chainlink", sector: "Currency", basePrice: 0, volatility: 7.0, category: "CRYPTO" },
  { sym: "AVAX", name: "Avalanche", sector: "Currency", basePrice: 0, volatility: 7.5, category: "CRYPTO" },
  { sym: "TON", name: "Toncoin", sector: "Currency", basePrice: 0, volatility: 6.5, category: "CRYPTO" }
];

export async function getCustomMarkets(_env?: any): Promise<CustomStock[]> {
  const list = await getKV("custom_markets");
  if (!list) {
    // If none exist, save and return default ones
    await saveCustomMarkets(DEFAULT_CUSTOM_STOCKS);
    return DEFAULT_CUSTOM_STOCKS;
  }
  return JSON.parse(list);
}

export async function saveCustomMarkets(stocks: CustomStock[], _env?: any): Promise<void> {
  await putKV("custom_markets", JSON.stringify(stocks));
}

// ── Private Institutional Assets ──────────────────────────────────────────────

export interface PrivateAsset {
  id: string;
  sym: string;
  name: string;
  price: number;
  change: number;
  volatility: number;
  description: string;
  targetPrice?: number;
  targetStartTime?: number;
  targetEndTime?: number;
  targetStartPrice?: number;
}

export const INITIAL_PRIVATE_ASSETS: PrivateAsset[] = [
  { id: "p1", sym: "STOCKS", name: "Stocks Protocol Alpha", price: 1250.00, change: 5.2, volatility: 2.1, description: "Proprietary high-yield institutional asset." },
  { id: "p2", sym: "ORB", name: "Orbit Synthetic", price: 85.40, change: -1.2, volatility: 3.5, description: "Synthetic derivation of global liquidity flows." },
  { id: "p3", sym: "VOID", name: "Void Liquidity", price: 0.45, change: 12.8, volatility: 8.0, description: "High-volatility institutional dark pool asset." },
  { id: "p4", sym: "NEO", name: "NeoSynthetic", price: 4500.00, change: 0.8, volatility: 1.2, description: "Low-risk institutional treasury bond token." },
  { id: "p5", sym: "QUBIT", name: "Qubit Ledger", price: 12.30, change: -4.5, volatility: 5.5, description: "Quantum-secured decentralized ledger asset." }
];

export async function getPrivateAssets(): Promise<PrivateAsset[]> {
  const data = await getKV("private_assets");
  if (!data) {
    await savePrivateAssets(INITIAL_PRIVATE_ASSETS);
    return INITIAL_PRIVATE_ASSETS;
  }
  return JSON.parse(data);
}

export async function savePrivateAssets(assets: PrivateAsset[]): Promise<void> {
  await putKV("private_assets", JSON.stringify(assets));
}

// ── P2P System ──────────────────────────────────────────────────────────────

export interface P2PRequest {
  id: string;
  email: string;
  type: "BUY" | "SELL";
  amount: number; // USD amount
  status: "PENDING" | "APPROVED" | "COMPLETED";
  createdAt: number;
  sellerName?: string;
  usdPrice?: number;
  banks?: string;
  trustRate?: string;
}

export interface ChatMessage {
  id: string;
  sender: "USER" | "ADMIN";
  text: string;
  image?: string; // base64
  timestamp: number;
}

export async function getP2PRequests(_env?: any): Promise<P2PRequest[]> {
  const list = await getKV("p2p_requests");
  if (!list) return [];
  return JSON.parse(list);
}

export async function saveP2PRequests(requests: P2PRequest[], _env?: any): Promise<void> {
  await putKV("p2p_requests", JSON.stringify(requests));
}

export async function getP2PChat(requestId: string, _env?: any): Promise<ChatMessage[]> {
  const list = await getKV(`p2p_chat:${requestId}`);
  if (!list) return [];
  return JSON.parse(list);
}

export async function saveP2PChat(requestId: string, messages: ChatMessage[], _env?: any): Promise<void> {
  await putKV(`p2p_chat:${requestId}`, JSON.stringify(messages));
}

export async function deleteP2PChat(requestId: string, _env?: any): Promise<void> {
  await putKV(`p2p_chat:${requestId}`, JSON.stringify([]));
}

