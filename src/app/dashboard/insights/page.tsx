"use client";

import { useState, useMemo } from "react";
import { useExpenses } from "@/contexts/ExpensesContext";
import { format, subMonths, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, TrendingDown, Target, PiggyBank, ArrowLeftRight, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

// ===== FINANCIAL HEALTH SCORE =====

function useHealthScore() {
    const { expenses, monthlyBudget, savingsGoals } = useExpenses();
    const now = new Date();

    return useMemo(() => {
        const currentMonth = format(now, "yyyy-MM");
        const prevMonth = format(subMonths(now, 1), "yyyy-MM");
        const prev2Month = format(subMonths(now, 2), "yyyy-MM");

        const currentSpend = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((a, c) => a + c.amount, 0);
        const prevSpend = expenses.filter(e => e.date.startsWith(prevMonth)).reduce((a, c) => a + c.amount, 0);
        const prev2Spend = expenses.filter(e => e.date.startsWith(prev2Month)).reduce((a, c) => a + c.amount, 0);

        // 1. Budget Adherence (0-30 pts)
        let budgetScore = 15; // default if no budget set
        if (monthlyBudget > 0) {
            const ratio = currentSpend / monthlyBudget;
            if (ratio <= 0.7) budgetScore = 30;
            else if (ratio <= 0.85) budgetScore = 25;
            else if (ratio <= 1.0) budgetScore = 20;
            else if (ratio <= 1.15) budgetScore = 10;
            else budgetScore = 5;
        }

        // 2. Spending Consistency (0-25 pts) — low variance = good
        let consistencyScore = 12;
        if (prevSpend > 0 && prev2Spend > 0) {
            const avg = (prevSpend + prev2Spend) / 2;
            const variance = Math.abs(currentSpend - avg) / avg;
            if (variance <= 0.1) consistencyScore = 25;
            else if (variance <= 0.2) consistencyScore = 20;
            else if (variance <= 0.35) consistencyScore = 15;
            else if (variance <= 0.5) consistencyScore = 10;
            else consistencyScore = 5;
        }

        // 3. Savings Rate (0-25 pts)
        let savingsScore = 12;
        const income = monthlyBudget > 0 ? monthlyBudget : (prevSpend > 0 ? prevSpend * 1.3 : 0);
        if (income > 0) {
            const savingsRate = (income - currentSpend) / income;
            if (savingsRate >= 0.3) savingsScore = 25;
            else if (savingsRate >= 0.2) savingsScore = 20;
            else if (savingsRate >= 0.1) savingsScore = 15;
            else if (savingsRate >= 0) savingsScore = 10;
            else savingsScore = 3;
        }

        // 4. Goal Progress (0-20 pts)
        let goalScore = 10;
        if (savingsGoals.length > 0) {
            const avgProgress = savingsGoals.reduce((a, g) => a + (g.savedAmount / g.targetAmount), 0) / savingsGoals.length;
            if (avgProgress >= 0.8) goalScore = 20;
            else if (avgProgress >= 0.5) goalScore = 16;
            else if (avgProgress >= 0.3) goalScore = 12;
            else if (avgProgress >= 0.1) goalScore = 8;
            else goalScore = 4;
        }

        const total = budgetScore + consistencyScore + savingsScore + goalScore;

        let grade = "Needs Work";
        let gradeColor = "text-red-500";
        if (total >= 85) { grade = "Excellent"; gradeColor = "text-emerald-500"; }
        else if (total >= 70) { grade = "Good"; gradeColor = "text-sky-500"; }
        else if (total >= 50) { grade = "Fair"; gradeColor = "text-amber-500"; }

        return {
            total,
            grade,
            gradeColor,
            breakdown: [
                { name: "Budget Adherence", score: budgetScore, max: 30, icon: ShieldCheck, color: "emerald", tip: monthlyBudget > 0 ? `${((currentSpend / monthlyBudget) * 100).toFixed(0)}% of budget used` : "Set a budget to improve this" },
                { name: "Spending Consistency", score: consistencyScore, max: 25, icon: TrendingDown, color: "sky", tip: "Based on variance from your 3-month average" },
                { name: "Savings Rate", score: savingsScore, max: 25, icon: PiggyBank, color: "violet", tip: income > 0 ? `Saving ${Math.max(0, ((income - currentSpend) / income) * 100).toFixed(0)}% of income` : "Track more months for accuracy" },
                { name: "Goal Progress", score: goalScore, max: 20, icon: Target, color: "amber", tip: savingsGoals.length > 0 ? `${savingsGoals.length} goal(s) tracked` : "Create savings goals to boost this" },
            ],
        };
    }, [expenses, monthlyBudget, savingsGoals, now]);
}

function HealthScoreRing({ score }: { score: number }) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 85) return "#10b981";
        if (s >= 70) return "#0ea5e9";
        if (s >= 50) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="relative w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                <motion.circle
                    cx="80" cy="80" r={radius} fill="none"
                    stroke={getColor(score)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-4xl font-black text-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {score}
                </motion.span>
                <span className="text-xs text-muted-foreground font-medium">out of 100</span>
            </div>
        </div>
    );
}

// ===== COMPARE MONTHS =====

const CATEGORY_COLORS_MAP: Record<string, string> = {
    Groceries: "#eab308", Food: "#f97316", Entertainment: "#a855f7",
    Travel: "#3b82f6", Investment: "#22c55e", Bills: "#f43f5e",
    Shopping: "#ec4899", Others: "#64748b",
};

export default function InsightsPage() {
    const { expenses } = useExpenses();
    const now = new Date();

    // Health Score
    const health = useHealthScore();

    // Month comparison
    const availableMonths = useMemo(() => {
        const months = new Set(expenses.map(e => e.date.substring(0, 7)));
        months.add(format(now, "yyyy-MM"));
        return Array.from(months).sort().reverse();
    }, [expenses, now]);

    const [monthA, setMonthA] = useState(availableMonths[0] || format(now, "yyyy-MM"));
    const [monthB, setMonthB] = useState(availableMonths[1] || format(subMonths(now, 1), "yyyy-MM"));

    const comparison = useMemo(() => {
        const expA = expenses.filter(e => e.date.startsWith(monthA));
        const expB = expenses.filter(e => e.date.startsWith(monthB));
        const totalA = expA.reduce((a, c) => a + c.amount, 0);
        const totalB = expB.reduce((a, c) => a + c.amount, 0);

        // Get all categories
        const allCats = new Set<string>();
        expA.forEach(e => allCats.add(e.category));
        expB.forEach(e => allCats.add(e.category));

        const categoryComparison = Array.from(allCats).map(cat => {
            const amtA = expA.filter(e => e.category === cat).reduce((a, c) => a + c.amount, 0);
            const amtB = expB.filter(e => e.category === cat).reduce((a, c) => a + c.amount, 0);
            return { name: cat, monthA: amtA, monthB: amtB, diff: amtA - amtB };
        }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

        return { totalA, totalB, diff: totalA - totalB, txA: expA.length, txB: expB.length, categoryComparison };
    }, [expenses, monthA, monthB]);

    const formatMonth = (m: string) => {
        try { return format(parseISO(`${m}-01`), "MMM yyyy"); } catch { return m; }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <Heart className="text-rose-500" /> Financial Insights
                </h1>
                <p className="text-slate-500 text-sm mt-1">Your personal financial health dashboard</p>
            </div>

            {/* ===== HEALTH SCORE SECTION ===== */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 pb-0">
                    <h2 className="text-lg font-bold text-foreground">Financial Health Score</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Based on your spending habits, budget adherence, and savings progress</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Score Ring */}
                    <div className="text-center">
                        <HealthScoreRing score={health.total} />
                        <motion.p
                            className={`text-lg font-bold mt-3 ${health.gradeColor}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            {health.grade}
                        </motion.p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        {health.breakdown.map((item, i) => {
                            const Icon = item.icon;
                            const pct = (item.score / item.max) * 100;
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15 }}
                                    className="space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} className={`text-${item.color}-500`} />
                                            <span className="text-xs font-semibold text-foreground">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground">{item.score}/{item.max}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                                            className={`h-full rounded-full bg-${item.color}-500`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{item.tip}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ===== COMPARE MONTHS SECTION ===== */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 pb-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ArrowLeftRight size={20} className="text-indigo-500" /> Compare Months
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Side-by-side comparison of any two months</p>
                </div>

                {/* Month Selectors */}
                <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select value={monthA} onChange={e => setMonthA(e.target.value)} className="pl-3 pr-8 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold outline-none appearance-none cursor-pointer">
                            {availableMonths.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">vs</span>
                    <div className="relative">
                        <select value={monthB} onChange={e => setMonthB(e.target.value)} className="pl-3 pr-8 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold outline-none appearance-none cursor-pointer">
                            {availableMonths.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    </div>
                </div>

                {/* Total Comparison */}
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 text-center">
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">{formatMonth(monthA)}</p>
                            <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">₹{comparison.totalA.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-indigo-400 mt-1">{comparison.txA} transactions</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className={`text-sm font-black ${comparison.diff > 0 ? "text-red-500" : comparison.diff < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                                {comparison.diff > 0 ? "+" : ""}₹{comparison.diff.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">difference</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center">
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">{formatMonth(monthB)}</p>
                            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">₹{comparison.totalB.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-emerald-400 mt-1">{comparison.txB} transactions</p>
                        </div>
                    </div>
                </div>

                {/* Category Comparison Chart */}
                {comparison.categoryComparison.length > 0 ? (
                    <div className="px-6 pb-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Category Breakdown</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparison.categoryComparison} layout="vertical" barSize={14} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} width={90} />
                                    <Tooltip
                                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}
                                        formatter={(value: number | string | undefined, name: string) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, name === "monthA" ? formatMonth(monthA) : formatMonth(monthB)]}
                                    />
                                    <Bar dataKey="monthA" fill="#6366f1" radius={[0, 6, 6, 0]} name="monthA" />
                                    <Bar dataKey="monthB" fill="#10b981" radius={[0, 6, 6, 0]} name="monthB" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-3">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                                <span className="text-muted-foreground">{formatMonth(monthA)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                                <span className="text-muted-foreground">{formatMonth(monthB)}</span>
                            </div>
                        </div>

                        {/* Category Delta Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
                            {comparison.categoryComparison.map(cat => (
                                <div key={cat.name} className="bg-muted/30 border border-border rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS_MAP[cat.name] || "#94a3b8" }} />
                                        <span className="text-[11px] font-semibold text-foreground truncate">{cat.name}</span>
                                    </div>
                                    <div className={`text-xs font-black ${cat.diff > 0 ? "text-red-500" : cat.diff < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                                        {cat.diff > 0 ? "↑" : cat.diff < 0 ? "↓" : "="} ₹{Math.abs(cat.diff).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 pb-6 text-center py-8">
                        <p className="text-sm text-muted-foreground">No data available for comparison</p>
                    </div>
                )}
            </div>
        </div>
    );
}
