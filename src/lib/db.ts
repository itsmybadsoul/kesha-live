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
