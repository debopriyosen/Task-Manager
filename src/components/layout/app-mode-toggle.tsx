"use client";

import { useAppMode } from "@/contexts/AppModeContext";
import { CheckCircle2, Wallet } from "lucide-react";

export function AppModeToggle() {
    const { mode, setMode } = useAppMode();

    return (
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 gap-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            <button
                onClick={() => setMode("tasks")}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === "tasks"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md ring-1 ring-slate-900/5 dark:ring-white/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
                <CheckCircle2 size={16} />
                <span className="hidden sm:inline">Tasks</span>
            </button>
            <button
                onClick={() => setMode("expenses")}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === "expenses"
                        ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-slate-900/5 dark:ring-white/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
                <Wallet size={16} />
                <span className="hidden sm:inline">Expenses</span>
            </button>
        </div>
    );
}
