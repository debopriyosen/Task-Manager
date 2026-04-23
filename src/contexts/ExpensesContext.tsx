"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";

export type ExpenseCategory =
    | "Groceries"
    | "Food"
    | "Entertainment"
    | "Travel"
    | "Investment"
    | "Bills"
    | "Shopping"
    | "Others";

export interface Expense {
    id: string;
    amount: number;
    category: ExpenseCategory;
    date: string; // ISO date string (YYYY-MM-DD)
    notes?: string;
    created_at: string;
}

export interface SavingsGoal {
    id: string;
    name: string;
    emoji: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string; // ISO date string (YYYY-MM-DD)
    color: string; // tailwind color name like "emerald", "violet", etc.
    created_at: string;
}

export interface InvestmentHolding {
    id: string;
    assetId: string; // "sensex", "nifty", "gold", "silver"
    name: string;
    quantity: number;
    buyPrice: number;
    date: string;
    created_at: string;
}

export interface SIP {
    id: string;
    name: string;
    amount: number;
    startDate: string;
    frequency: "monthly";
    category: string;
    expectedReturn: number; // Annual %
    created_at: string;
}

interface ExpensesContextType {
    expenses: Expense[];
    monthlyBudget: number;
    monthlyIncome: number;
    savingsGoals: SavingsGoal[];
    addExpense: (expense: Omit<Expense, "id" | "created_at">) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    setMonthlyBudget: (budget: number) => void;
    setMonthlyIncome: (income: number) => void;
    addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "created_at">) => void;
    updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
    deleteSavingsGoal: (id: string) => void;
    addToSavings: (goalId: string, amount: number) => void;
    holdings: InvestmentHolding[];
    addHolding: (holding: Omit<InvestmentHolding, "id" | "created_at">) => void;
    updateHolding: (id: string, updates: Partial<InvestmentHolding>) => void;
    deleteHolding: (id: string) => void;
    sips: SIP[];
    addSIP: (sip: Omit<SIP, "id" | "created_at">) => void;
    updateSIP: (id: string, updates: Partial<SIP>) => void;
    deleteSIP: (id: string) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
    const [sips, setSips] = useState<SIP[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedExpenses = localStorage.getItem("planora_expenses");
        if (savedExpenses) {
            try {
                setExpenses(JSON.parse(savedExpenses));
            } catch (e) {
                console.error("Failed to parse expenses");
            }
        }
        const savedBudget = localStorage.getItem("planora_budget");
        if (savedBudget) {
            setMonthlyBudget(Number(savedBudget));
        }
        const savedGoals = localStorage.getItem("planora_savings_goals");
        if (savedGoals) {
            try {
                setSavingsGoals(JSON.parse(savedGoals));
            } catch (e) {
                console.error("Failed to parse savings goals");
            }
        }
        const savedIncome = localStorage.getItem("planora_income");
        if (savedIncome) {
            setMonthlyIncome(Number(savedIncome));
        }
        const savedHoldings = localStorage.getItem("planora_holdings");
        if (savedHoldings) {
            try {
                setHoldings(JSON.parse(savedHoldings));
            } catch (e) {
                console.error("Failed to parse holdings");
            }
        }
        const savedSips = localStorage.getItem("planora_sips");
        if (savedSips) {
            try {
                setSips(JSON.parse(savedSips));
            } catch (e) {
                console.error("Failed to parse sips");
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("planora_expenses", JSON.stringify(expenses));
            localStorage.setItem("planora_budget", String(monthlyBudget));
            localStorage.setItem("planora_income", String(monthlyIncome));
            localStorage.setItem("planora_savings_goals", JSON.stringify(savingsGoals));
            localStorage.setItem("planora_holdings", JSON.stringify(holdings));
            localStorage.setItem("planora_sips", JSON.stringify(sips));
        }
    }, [expenses, monthlyBudget, monthlyIncome, savingsGoals, holdings, sips, isLoaded]);

    const triggerConfetti = () => {
        if (typeof window !== "undefined") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#10b981", "#34d399", "#059669"],
            });
        }
    };

    const addExpense = (expenseData: Omit<Expense, "id" | "created_at">) => {
        const newExpense: Expense = {
            ...expenseData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setExpenses((prev) => [...prev, newExpense]);
        triggerConfetti();
    };

    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setExpenses((prev) =>
            prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
        );
    };

    const deleteExpense = (id: string) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    const addSavingsGoal = (goalData: Omit<SavingsGoal, "id" | "created_at">) => {
        const newGoal: SavingsGoal = {
            ...goalData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setSavingsGoals((prev) => [...prev, newGoal]);
        triggerConfetti();
    };

    const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
        setSavingsGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
        );
    };

    const deleteSavingsGoal = (id: string) => {
        setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    };

    const addToSavings = (goalId: string, amount: number) => {
        setSavingsGoals((prev) =>
            prev.map((g) => {
                if (g.id === goalId) {
                    const newSaved = g.savedAmount + amount;
                    if (newSaved >= g.targetAmount) {
                        triggerConfetti();
                    }
                    return { ...g, savedAmount: Math.min(newSaved, g.targetAmount) };
                }
                return g;
            })
        );
    };

    const addHolding = (holdingData: Omit<InvestmentHolding, "id" | "created_at">) => {
        const newHolding: InvestmentHolding = {
            ...holdingData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setHoldings((prev) => [...prev, newHolding]);
        triggerConfetti();
    };

    const updateHolding = (id: string, updates: Partial<InvestmentHolding>) => {
        setHoldings((prev) =>
            prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
        );
    };

    const deleteHolding = (id: string) => {
        setHoldings((prev) => prev.filter((h) => h.id !== id));
    };

    const addSIP = (sipData: Omit<SIP, "id" | "created_at">) => {
        const newSIP: SIP = {
            ...sipData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setSips((prev) => [...prev, newSIP]);
        triggerConfetti();
    };

    const updateSIP = (id: string, updates: Partial<SIP>) => {
        setSips((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    };

    const deleteSIP = (id: string) => {
        setSips((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <ExpensesContext.Provider
            value={{
                expenses,
                monthlyBudget,
                monthlyIncome,
                savingsGoals,
                addExpense,
                updateExpense,
                deleteExpense,
                setMonthlyBudget,
                setMonthlyIncome,
                addSavingsGoal,
                updateSavingsGoal,
                deleteSavingsGoal,
                addToSavings,
                holdings,
                addHolding,
                updateHolding,
                deleteHolding,
                sips,
                addSIP,
                updateSIP,
                deleteSIP,
            }}
        >
            {children}
        </ExpensesContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpensesContext);
    if (context === undefined) {
        throw new Error("useExpenses must be used within an ExpensesProvider");
    }
    return context;
}
