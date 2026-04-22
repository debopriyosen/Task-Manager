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

interface ExpensesContextType {
    expenses: Expense[];
    monthlyBudget: number;
    addExpense: (expense: Omit<Expense, "id" | "created_at">) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    setMonthlyBudget: (budget: number) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
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
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("planora_expenses", JSON.stringify(expenses));
            localStorage.setItem("planora_budget", String(monthlyBudget));
        }
    }, [expenses, monthlyBudget, isLoaded]);

    const triggerConfetti = () => {
        if (typeof window !== "undefined") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#10b981", "#34d399", "#059669"], // Money colors (greens)
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

    return (
        <ExpensesContext.Provider
            value={{
                expenses,
                monthlyBudget,
                addExpense,
                updateExpense,
                deleteExpense,
                setMonthlyBudget,
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
