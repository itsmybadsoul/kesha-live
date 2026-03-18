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
}

interface UserContextType {
  user: User | null;
  balance: number;
  quests: Quest[];
  activeTrades: Trade[];
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  completeQuest: (id: number) => Promise<void>;
  addTrade: (trade: Trade) => Promise<void>;
  removeTrade: (id: number) => Promise<void>;
  requestDeposit: (amount: string, txid: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const INITIAL_QUESTS: Quest[] = [
  { id: 1, title: "Daily Check-in", description: "Log in to the dashboard.", reward: "$5.00", completed: true },
  { id: 2, title: "Social Butterfly", description: "Allocate funds to a new Copy Trader.", reward: "$50.00", completed: false },
  { id: 3, title: "Market Maker", description: "Open 3 simulated manual trades.", reward: "$15.00", completed: false },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
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
        if (data.trades?.length) setActiveTrades(data.trades);
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

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    setUser(null);
    setQuests(INITIAL_QUESTS);
    setBalance(0);
    setActiveTrades([]);
  };

  const syncUpdates = async (updates: any) => {
    if (!user?.email) return;
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...updates })
    });
  };

  const updateBalance = async (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    await syncUpdates({ balance: newBalance });
  };

  const completeQuest = async (id: number) => {
    const updatedQuests = quests.map((q) => {
      if (q.id === id && !q.completed) {
        const rewardValue = parseFloat(q.reward.replace("$", ""));
        if (!isNaN(rewardValue)) setBalance(prev => prev + rewardValue);
        return { ...q, completed: true };
      }
      return q;
    });
    setQuests(updatedQuests);
    await syncUpdates({ quests: updatedQuests, balance: balance + (quests.find(q=>q.id===id)?.completed ? 0 : parseFloat(quests.find(q=>q.id===id)!.reward.replace("$",""))) });
  };

  const addTrade = async (trade: Trade) => {
    const newTrades = [trade, ...activeTrades];
    setActiveTrades(newTrades);
    await syncUpdates({ trades: newTrades });
  };

  const removeTrade = async (id: number) => {
    const newTrades = activeTrades.filter((t) => t.id !== id);
    setActiveTrades(newTrades);
    await syncUpdates({ trades: newTrades });
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

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        quests,
        activeTrades,
        isLoading,
        login,
        logout,
        refreshUser,
        updateBalance,
        completeQuest,
        addTrade,
        removeTrade,
        requestDeposit,
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
