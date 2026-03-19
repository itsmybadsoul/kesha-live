// This mimics the Cloudflare KV binding for local development.
// When deployed to Cloudflare, the REAL 'DATABASE' binding will be used.

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
    details: string; // Address or IBAN
    timestamp: number;
  } | null;
  holdings: Record<string, number>;
}

// Global variable for local simulation (cleared on server restart)
const mockDB: Record<string, string> = {};

export async function getKV(key: string, env?: any): Promise<string | null> {
  // 1. Try passed env
  if (env?.DATABASE) return await env.DATABASE.get(key);
  // 2. Try process.env (Next.js polyfill)
  if ((process.env as any).DATABASE) return await (process.env as any).DATABASE.get(key);
  // 3. Try global (Cloudflare native)
  if ((globalThis as any).DATABASE) return await (globalThis as any).DATABASE.get(key);
  
  // Local fallback
  return mockDB[key] || null;
}

export async function putKV(key: string, value: string, env?: any): Promise<void> {
  // 1. Try passed env
  if (env?.DATABASE) {
    await env.DATABASE.put(key, value);
    return;
  }
  // 2. Try process.env (Next.js polyfill)
  if ((process.env as any).DATABASE) {
    await (process.env as any).DATABASE.put(key, value);
    return;
  }
  // 3. Try global (Cloudflare native)
  if ((globalThis as any).DATABASE) {
    await (globalThis as any).DATABASE.put(key, value);
    return;
  }
  
  // Local fallback
  mockDB[key] = value;
}

export async function getUser(email: string, env?: any): Promise<UserData | null> {
  const data = await getKV(`user:${email}`, env);
  return data ? JSON.parse(data) : null;
}

export async function saveUser(user: UserData, env?: any): Promise<void> {
  await putKV(`user:${user.email}`, JSON.stringify(user), env);
}

export async function getPendingDeposits(env?: any): Promise<UserData[]> {
  // Normally we'd use a separate KV key or a list operation
  // For this demo, we'll store a list of emails with pending status
  const list = await getKV("pending_deposits_list", env);
  if (!list) return [];
  
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e, env)));
  return users.filter((u): u is UserData => !!u && !!u.pendingDeposit);
}

export async function trackPendingDeposit(email: string, env?: any): Promise<void> {
  const list = await getKV("pending_deposits_list", env);
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("pending_deposits_list", JSON.stringify(emails), env);
  }
}

export async function untrackPendingDeposit(email: string, env?: any): Promise<void> {
  const list = await getKV("pending_deposits_list", env);
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("pending_deposits_list", JSON.stringify(emails), env);
}

export async function getPendingWithdrawals(env?: any): Promise<UserData[]> {
  const list = await getKV("pending_withdrawals_list", env);
  if (!list) return [];
  const emails: string[] = JSON.parse(list);
  const users = await Promise.all(emails.map(e => getUser(e, env)));
  return users.filter((u): u is UserData => !!u && !!u.pendingWithdrawal);
}

export async function trackPendingWithdrawal(email: string, env?: any): Promise<void> {
  const list = await getKV("pending_withdrawals_list", env);
  let emails: string[] = list ? JSON.parse(list) : [];
  if (!emails.includes(email)) {
    emails.push(email);
    await putKV("pending_withdrawals_list", JSON.stringify(emails), env);
  }
}

export async function untrackPendingWithdrawal(email: string, env?: any): Promise<void> {
  const list = await getKV("pending_withdrawals_list", env);
  if (!list) return;
  let emails: string[] = JSON.parse(list);
  emails = emails.filter(e => e !== email);
  await putKV("pending_withdrawals_list", JSON.stringify(emails), env);
}
