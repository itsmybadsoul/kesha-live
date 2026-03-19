"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
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
  welcomeExpiry?: number;
  referralStats?: {
    totalInvites: number;
    milestoneProgress: number;
    nextMilestone: number;
    reward: string;
  };
  balance: number;
  holdings: Record<string, number>;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
}

export interface Trade {
  id: number;
  trader: string;
  pair: string;
  type: "LONG" | "SHORT";
  leverage: string;
  entry: number;
  current: number;
  pnl: string;
  time: string;
  isProfit: boolean;
  allocation: number;
  startDate?: number;
  endDate?: number;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "TRADE" | "REWARD";
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  description: string;
  timestamp: number;
}

interface UserContextType {
  user: User | null;
  balance: number;
  quests: Quest[];
  activeTrades: Trade[];
  transactions: Transaction[];
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (amount: number, description?: string) => Promise<void>;
  completeQuest: (id: number) => Promise<void>;
  addTrade: (trade: any) => Promise<void>;
  removeTrade: (id: number) => Promise<void>;
  requestDeposit: (amount: string, txid: string) => Promise<void>;
  requestWithdraw: (amount: string, method: "CRYPTO" | "BANK", details: string) => Promise<void>;
  manualTradeCount: number;
  incrementManualTrades: () => Promise<void>;
  tradeAsset: (from: string, to: string, amount: number, price: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const INITIAL_QUESTS: Quest[] = [
  { id: 1, title: "Daily Check-in", description: "Log in to the dashboard.", reward: "$5.00", completed: true },
  { id: 2, title: "Social Butterfly", description: "Allocate funds to a new Copy Trader.", reward: "$50.00", completed: false },
  { id: 3, title: "Market Maker", description: "Open 3 manual investment positions.", reward: "$15.00", completed: false },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [manualTradeCount, setManualTradeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/user?email=${user.email}`);
      const data = await res.json();
      if (data.email) {
        setUser(data);
        setBalance(data.balance);
        if (data.quests?.length) setQuests(data.quests);
        if (data.trades?.length) {
          const repairedTrades = data.trades.map((t: any) => {
             const now = Date.now();
             const start = t.startDate || now;
             const end = t.endDate || (start + 30 * 24 * 60 * 60 * 1000);
             return { ...t, startDate: start, endDate: end };
          });
          setActiveTrades(repairedTrades);
        }
        if (data.transactions?.length) setTransactions(data.transactions);
        if (data.manualTradeCount) setManualTradeCount(data.manualTradeCount);
      }
    } catch (e) {
      console.error("Failed to sync with cloud", e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("ys_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ys_user", JSON.stringify(user));
      refreshUser();
    } else {
      localStorage.removeItem("ys_user");
    }
  }, [user?.email]);

  const login = (userData: User) => {
    // Set 24h welcome bonus expiry on first ever appearance
    if (!userData.welcomeExpiry) {
      userData.welcomeExpiry = Date.now() + 24 * 60 * 60 * 1000;
      syncUpdates({ welcomeExpiry: userData.welcomeExpiry });
    }
    setUser(userData);
  };
  const logout = () => {
    setUser(null);
    setQuests(INITIAL_QUESTS);
    setBalance(0);
    setActiveTrades([]);
    setTransactions([]);
  };

  const syncUpdates = async (updates: any) => {
    if (!user?.email) return;
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...updates })
    });
  };

  const updateBalance = async (amount: number, description: string = "Manual adjustment") => {
    const newBalance = balance + amount;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: amount > 0 ? "DEPOSIT" : "WITHDRAW",
      amount: Math.abs(amount),
      status: "COMPLETED",
      description,
      timestamp: Date.now()
    };
    const updatedTxs = [newTx, ...transactions];
    setBalance(newBalance);
    setTransactions(updatedTxs);
    await syncUpdates({ balance: newBalance, transactions: updatedTxs });
  };

  const completeQuest = async (id: number) => {
    let earned = 0;
    const updatedQuests = quests.map((q) => {
      if (q.id === id && !q.completed) {
        const rewardValue = parseFloat(q.reward.replace("$", ""));
        if (!isNaN(rewardValue)) earned = rewardValue;
        return { ...q, completed: true };
      }
      return q;
    });

    if (earned > 0) {
      const newBalance = balance + earned;
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: "REWARD",
        amount: earned,
        status: "COMPLETED",
        description: `Quest: ${quests.find(q => q.id === id)?.title}`,
        timestamp: Date.now()
      };
      const updatedTxs = [newTx, ...transactions];
      setBalance(newBalance);
      setQuests(updatedQuests);
      setTransactions(updatedTxs);
      await syncUpdates({ balance: newBalance, quests: updatedQuests, transactions: updatedTxs });
    }
  };

  const addTrade = async (trade: any) => {
    const now = Date.now();
    const tradeWithDates = {
      ...trade,
      startDate: now,
      endDate: now + 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    const newTrades = [tradeWithDates, ...activeTrades];

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "TRADE",
      amount: trade.allocation,
      status: "COMPLETED",
      description: `Copy Trade: ${trade.trader} (${trade.pair})`,
      timestamp: now
    };
    const updatedTxs = [newTx, ...transactions];

    setActiveTrades(newTrades);
    setTransactions(updatedTxs);
    await syncUpdates({ trades: newTrades, transactions: updatedTxs });
  };

  const removeTrade = async (id: number) => {
    const newTrades = activeTrades.filter((t) => t.id !== id);
    setActiveTrades(newTrades);
    await syncUpdates({ trades: newTrades });
  };

  const incrementManualTrades = async () => {
    const nextCount = manualTradeCount + 1;
    setManualTradeCount(nextCount);
    if (nextCount === 3) {
      await completeQuest(3); // Complete "Market Maker"
    }
  };

  const requestDeposit = async (amount: string, txid: string) => {
    if (!user?.email) return;
    const res = await fetch("/api/deposit/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount, txid })
    });
    const data = await res.json();
    if (data.success) {
      await refreshUser();
    }
  };

  const requestWithdraw = async (amount: string, method: "CRYPTO" | "BANK", details: string) => {
    if (!user?.email) return;
    const res = await fetch("/api/withdraw/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount, method, details })
    });
    const data = await res.json();
    if (data.success) {
      await refreshUser();
    }
  };
  const tradeAsset = async (from: string, to: string, amount: number, price: number) => {
    if (!user) return;
    
    const currentHoldings = { ...(user.holdings || {}) };
    let newBalance = balance;
    
    // 1. Validate & Deduct Source
    if (from === "USD") {
       if (balance < amount) throw new Error("Insufficient USD balance");
       newBalance -= amount;
    } else {
       if ((currentHoldings[from] || 0) < amount) throw new Error(`Insufficient ${from} holdings`);
       currentHoldings[from] -= amount;
    }

    // 2. Add Destination
    const received = from === "USD" ? amount / price : (to === "USD" ? amount * price : (amount * price)); 
    // Simplified: For Swap it's more complex, but for Buy/Sell this works.
    // If Swap: from (crypto) -> USD -> to (crypto)
    
    if (to === "USD") {
      newBalance += received;
    } else {
      currentHoldings[to] = (currentHoldings[to] || 0) + (from === "USD" ? amount / price : amount);
      // Note: Swap logic will be handled by the component calculating the correct 'amount' to add
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "TRADE",
      amount: amount,
      status: "COMPLETED",
      description: `${from} to ${to} Exchange`,
      timestamp: Date.now()
    };

    const updatedTxs = [newTx, ...transactions];
    setBalance(newBalance);
    setTransactions(updatedTxs);
    setUser({ ...user, balance: newBalance, holdings: currentHoldings });
    
    await syncUpdates({ 
      balance: newBalance, 
      holdings: currentHoldings, 
      transactions: updatedTxs 
    });
    
    if (from === "USD") await incrementManualTrades();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        quests,
        activeTrades,
        transactions,
        isLoading,
        login,
        logout,
        refreshUser,
        updateBalance,
        completeQuest,
        addTrade,
        removeTrade,
        requestDeposit,
        requestWithdraw,
        manualTradeCount,
        incrementManualTrades,
        tradeAsset,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
