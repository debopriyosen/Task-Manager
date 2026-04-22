"use client";

import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, PiggyBank, Target, Wallet, ArrowRight } from "lucide-react";
import { useExpenses, Expense, SavingsGoal } from "@/contexts/ExpensesContext";
import { CreateExpenseModal, CATEGORY_COLORS } from "./create-expense-modal";
import { ExportReportButton } from "./export-report";
import { format, parseISO, subMonths, subDays, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";
import Link from "next/link";

export function ExpenseDashboard() {
    const { expenses, deleteExpense, savingsGoals, monthlyBudget } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    const now = new Date();
    const currentMonthStr = format(now, "yyyy-MM");
    const prevMonthStr = format(subMonths(now, 1), "yyyy-MM");

    // === Computed Data ===
    const monthlySpend = useMemo(() => {
        return expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((a, c) => a + c.amount, 0);
    }, [expenses, currentMonthStr]);

    const prevMonthSpend = useMemo(() => {
        return expenses.filter(e => e.date.startsWith(prevMonthStr)).reduce((a, c) => a + c.amount, 0);
    }, [expenses, prevMonthStr]);

    const monthTrend = prevMonthSpend === 0 ? 0 : ((monthlySpend - prevMonthSpend) / prevMonthSpend) * 100;

    // Forecast
    const forecast = useMemo(() => {
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyAvg = monthlySpend / Math.max(dayOfMonth, 1);
        return { total: dailyAvg * daysInMonth, dailyAvg, daysRemaining: daysInMonth - dayOfMonth };
    }, [monthlySpend, now]);

    // Category data for this month
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.filter(e => e.date.startsWith(currentMonthStr)).forEach(e => {
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [expenses, currentMonthStr]);

    // Last 7 days trend
    const weeklyTrend = useMemo(() => {
        const trends = [];
        for (let i = 6; i >= 0; i--) {
            const d = subDays(now, i);
            const dateStr = format(d, "yyyy-MM-dd");
            const amt = expenses.filter(e => e.date === dateStr).reduce((a, c) => a + c.amount, 0);
            trends.push({ name: format(d, "EEE"), total: amt });
        }
        return trends;
    }, [expenses, now]);

    // Recent expenses (last 5)
    const recentExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [expenses]);

    // Transactions today
    const todayCount = expenses.filter(e => e.date === format(now, "yyyy-MM-dd")).length;
    const todaySpend = expenses.filter(e => e.date === format(now, "yyyy-MM-dd")).reduce((a, c) => a + c.amount, 0);

    // Active goals
    const activeGoals = savingsGoals.filter(g => g.savedAmount < g.targetAmount).slice(0, 3);

    const CATEGORY_PIE_COLORS: Record<string, string> = {
        Groceries: "#eab308", Food: "#f97316", Entertainment: "#a855f7",
        Travel: "#3b82f6", Investment: "#22c55e", Bills: "#f43f5e",
        Shopping: "#ec4899", Others: "#64748b",
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Good {now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">Here&apos;s your financial snapshot for {format(now, "MMMM yyyy")}</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Spend */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                            <Wallet size={18} className="text-emerald-600" />
                        </div>
                        {monthTrend !== 0 && (
                            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${monthTrend > 0 ? "text-red-600 bg-red-50 dark:bg-red-500/10" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"}`}>
                                {monthTrend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {Math.abs(monthTrend).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">This Month</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">₹{monthlySpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                </div>

                {/* Forecast */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
                            <TrendingUp size={18} className="text-violet-600" />
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Forecast</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">₹{forecast.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{forecast.daysRemaining} days remaining</p>
                </div>

                {/* Today */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                            <Target size={18} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Today</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">₹{todaySpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{todayCount} transaction{todayCount !== 1 ? "s" : ""}</p>
                </div>

                {/* Daily Average */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center">
                            <PiggyBank size={18} className="text-sky-600" />
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Daily Avg</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">₹{forecast.dailyAvg.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">This month so far</p>
                </div>
            </div>

            {/* Middle Row: Weekly Chart + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Weekly Spend Chart */}
                <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Last 7 Days</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyTrend} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}
                                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Spent"]}
                                />
                                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-4">By Category</h3>
                    {categoryData.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <div className="w-28 h-28 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={48} strokeWidth={2} stroke="hsl(var(--card))">
                                            {categoryData.map((entry) => (
                                                <Cell key={entry.name} fill={CATEGORY_PIE_COLORS[entry.name] || "#94a3b8"} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2 overflow-hidden">
                                {categoryData.slice(0, 4).map(cat => (
                                    <div key={cat.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_PIE_COLORS[cat.name] || "#94a3b8" }} />
                                            <span className="text-muted-foreground truncate">{cat.name}</span>
                                        </div>
                                        <span className="font-bold text-foreground ml-2 shrink-0">₹{cat.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                    )}
                </div>
            </div>

            {/* Bottom Row: Goals + Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Savings Goals */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Savings Goals</h3>
                        <Link href="/dashboard/savings" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    {activeGoals.length > 0 ? (
                        <div className="space-y-4">
                            {activeGoals.map(goal => {
                                const progress = (goal.savedAmount / goal.targetAmount) * 100;
                                const daysLeft = differenceInDays(parseISO(goal.deadline), now);
                                return (
                                    <div key={goal.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-lg shrink-0">
                                            {goal.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-foreground truncate">{goal.name}</span>
                                                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-emerald-600 font-bold">₹{goal.savedAmount.toLocaleString("en-IN")}</span>
                                                <span className="text-[10px] text-muted-foreground">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-3xl mb-2">🎯</p>
                            <p className="text-xs text-muted-foreground">No savings goals yet</p>
                            <Link href="/dashboard/savings" className="mt-2 inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700">Create one →</Link>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
                        <ExportReportButton expenses={expenses} filterMonth={currentMonthStr} />
                    </div>
                    {recentExpenses.length > 0 ? (
                        <div className="space-y-3">
                            {recentExpenses.map(expense => (
                                <div key={expense.id} className="group flex items-center justify-between py-2 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-2 h-8 rounded-full shrink-0`} style={{ backgroundColor: CATEGORY_PIE_COLORS[expense.category] || "#94a3b8" }} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">{expense.notes || expense.category}</p>
                                            <p className="text-[10px] text-muted-foreground">{format(parseISO(expense.date), "MMM d")} · {expense.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-sm font-bold text-foreground">₹{expense.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                            <button onClick={() => setExpenseToEdit(expense)} className="p-1 text-muted-foreground hover:text-emerald-600 rounded transition-colors"><Edit2 size={13} /></button>
                                            <button onClick={() => deleteExpense(expense.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-3xl mb-2">🧾</p>
                            <p className="text-xs text-muted-foreground">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50"
                aria-label="Add Expense"
            >
                <Plus size={26} strokeWidth={2.5} />
            </button>

            <CreateExpenseModal
                isOpen={isModalOpen || !!expenseToEdit}
                onClose={() => {
                    setIsModalOpen(false);
                    setExpenseToEdit(null);
                }}
                expenseToEdit={expenseToEdit}
            />
        </div>
    );
}
