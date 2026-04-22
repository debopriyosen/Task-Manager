"use client";

import { useExpenses } from "@/contexts/ExpensesContext";
import { CATEGORY_COLORS } from "./create-expense-modal";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, subMonths, subDays, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, IndianRupee, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ExpenseAnalytics() {
    const { expenses, monthlyBudget, setMonthlyBudget } = useExpenses();
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
    const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

    // Setup Range-Aware Analytics Data
    const now = new Date();
    
    const rangeData = useMemo(() => {
        let currentTotal = 0;
        let previousTotal = 0;
        let label = "";
        let subLabel = "";

        if (timeRange === "week") {
            const startOfThisWeek = subDays(now, 6);
            const startOfLastWeek = subDays(now, 13);
            
            currentTotal = expenses
                .filter(e => parseISO(e.date) >= startOfDay(startOfThisWeek))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            previousTotal = expenses
                .filter(e => {
                    const date = parseISO(e.date);
                    return date >= startOfDay(startOfLastWeek) && date < startOfDay(startOfThisWeek);
                })
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            label = "This Week";
            subLabel = "vs last week";
        } else if (timeRange === "year") {
            const currentYear = format(now, "yyyy");
            const lastYear = (parseInt(currentYear) - 1).toString();
            
            currentTotal = expenses
                .filter(e => e.date.startsWith(currentYear))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            previousTotal = expenses
                .filter(e => e.date.startsWith(lastYear))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            label = "This Year";
            subLabel = "vs last year";
        } else {
            // Default: month
            const currentMonth = format(now, "yyyy-MM");
            const lastMonth = format(subMonths(now, 1), "yyyy-MM");
            
            currentTotal = expenses
                .filter(e => e.date.startsWith(currentMonth))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            previousTotal = expenses
                .filter(e => e.date.startsWith(lastMonth))
                .reduce((acc, curr) => acc + curr.amount, 0);
            
            label = "This Month";
            subLabel = "vs last month";
        }

        const trend = previousTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - previousTotal) / previousTotal) * 100;
        
        return { currentTotal, previousTotal, trend, label, subLabel };
    }, [expenses, timeRange, now]);

    const { currentTotal, trend, label, subLabel } = rangeData;

    // Budget stuff (always monthly)
    const currentMonthStr = format(now, "yyyy-MM");
    const totalCurrentMonth = expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((acc, curr) => acc + curr.amount, 0);
    const budgetProgress = monthlyBudget > 0 ? (totalCurrentMonth / monthlyBudget) * 100 : 0;
    const isOverBudget = totalCurrentMonth > monthlyBudget && monthlyBudget > 0;

    const handleBudgetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMonthlyBudget(Number(tempBudget));
        setIsEditingBudget(false);
    };

    const categoryDataMap = useMemo(() => {
        return expenses.reduce((acc, curr) => {
            if (!acc[curr.category]) acc[curr.category] = 0;
            acc[curr.category] += curr.amount;
            return acc;
        }, {} as Record<string, number>);
    }, [expenses]);

    const categoryData = Object.entries(categoryDataMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const topCategory = categoryData.length > 0 ? categoryData[0] : null;

    // Dynamic Trend Data based on timeRange
    const trendData = useMemo(() => {
        if (timeRange === "year") {
            const trends = [];
            for (let i = 11; i >= 0; i--) {
                const date = subMonths(now, i);
                const m = format(date, "yyyy-MM");
                const amt = expenses.filter(e => e.date.startsWith(m)).reduce((acc, curr) => acc + curr.amount, 0);
                trends.push({ name: format(date, "MMM"), total: amt });
            }
            return trends;
        }

        if (timeRange === "month") {
            const trends = [];
            // Show last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = subDays(now, i);
                const d = format(date, "yyyy-MM-dd");
                const amt = expenses.filter(e => e.date === d).reduce((acc, curr) => acc + curr.amount, 0);
                trends.push({ name: format(date, "MMM dd"), total: amt });
            }
            return trends;
        }

        if (timeRange === "week") {
            const trends = [];
            for (let i = 6; i >= 0; i--) {
                const date = subDays(now, i);
                const d = format(date, "yyyy-MM-dd");
                const amt = expenses.filter(e => e.date === d).reduce((acc, curr) => acc + curr.amount, 0);
                trends.push({ name: format(date, "EEE"), total: amt });
            }
            return trends;
        }

        return [];
    }, [expenses, timeRange]);

    // Used for Pie Chart colors
    const getBorderColorClass = (category: string) => {
        const map: Record<string, string> = {
            Groceries: "#14b8a6",
            Food: "#f97316",
            Entertainment: "#a855f7",
            Travel: "#3b82f6",
            Investment: "#22c55e",
            Bills: "#f43f5e",
            Shopping: "#ec4899",
            Others: "#64748b",
        };
        return map[category] || "#94a3b8";
    };

    if (expenses.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                    <IndianRupee size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Analytics Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Start adding expenses to see your spending insights here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Range Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {(["week", "month", "year"] as const).map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                    >
                        {range.charAt(0).toUpperCase() + range.slice(1)}ly
                    </button>
                ))}
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <h3 className="text-3xl font-bold text-foreground mt-1">₹{currentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="mt-1 flex flex-col items-end gap-1">
                             {trend > 0 ? (
                                <div className="text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full font-medium text-xs">
                                    <TrendingUp size={12} /> +{trend.toFixed(1)}%
                                </div>
                            ) : (
                                <div className="text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium text-xs">
                                    <TrendingDown size={12} /> {trend.toFixed(1)}%
                                </div>
                            )}
                            <span className="text-[10px] text-muted-foreground">{subLabel}</span>
                        </div>
                    </div>
                    
                    {/* Budget Progress Bar */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium">Monthly Budget</span>
                            <button 
                                onClick={() => setIsEditingBudget(true)}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                                {monthlyBudget > 0 ? `₹${monthlyBudget.toLocaleString()}` : "Set Budget"}
                            </button>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                                className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                            />
                        </div>
                        {isOverBudget && (
                            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                <AlertCircle size={10} /> Over budget by ₹{(totalCurrentMonth - monthlyBudget).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Top Category (All-Time)</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1 break-all flex items-center gap-2">
                            {topCategory ? topCategory.name : "-"}
                        </h3>
                        {topCategory && (
                            <p className="text-sm font-medium mt-1 text-slate-500 dark:text-slate-400">
                                ₹{topCategory.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Spent
                            </p>
                        )}
                    </div>
                </div>

                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900 text-white rounded-2xl p-6 shadow-xl shadow-indigo-500/20 flex flex-col justify-between border border-white/10 dark:border-indigo-500/20 overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-500/20 rounded-full blur-xl transition-transform duration-700 group-hover:scale-150"></div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-indigo-100">Total Tracked</p>
                        <h3 className="text-3xl font-bold mt-1">
                            ₹{expenses.reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <p className="relative z-10 text-xs text-indigo-200 mt-4 opacity-80">
                        Across {expenses.length} transactions
                    </p>
                </div>
            </div>

            {/* Budget Edit Modal */}
            <AnimatePresence>
                {isEditingBudget && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
                        >
                            <h3 className="text-lg font-bold mb-4">Set Monthly Budget</h3>
                            <form onSubmit={handleBudgetSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Monthly Limit (₹)</label>
                                    <input 
                                        type="number"
                                        value={tempBudget}
                                        onChange={(e) => setTempBudget(e.target.value)}
                                        className="w-full bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg"
                                        placeholder="e.g. 50000"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditingBudget(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                                    >
                                        Save Budget
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Spending by Category</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {categoryData.map((c, i) => (
                                        <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={getBorderColorClass(c.name)} />
                                            <stop offset="100%" stopColor={getBorderColorClass(c.name)} stopOpacity={0.7} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        {categoryData.map(c => (
                            <div key={c.name} className="flex items-center gap-1.5 text-xs">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getBorderColorClass(c.name) }} />
                                <span className="text-muted-foreground">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Trend Bar Chart */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Spending Trend</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                    dy={10}
                                    interval={timeRange === "month" ? 4 : 0}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Spent']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="url(#colorBar)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
}
