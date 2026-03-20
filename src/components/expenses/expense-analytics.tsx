"use client";

import { useExpenses } from "@/contexts/ExpensesContext";
import { CATEGORY_COLORS } from "./create-expense-modal";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react";

export function ExpenseAnalytics() {
    const { expenses } = useExpenses();

    // Setup Analytics Data
    const currentMonth = format(new Date(), "yyyy-MM");
    const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");

    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const lastMonthExpenses = expenses.filter(e => e.date.startsWith(lastMonth));

    const totalCurrentMonth = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalLastMonth = lastMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const trend = totalLastMonth === 0 ? 100 : ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100;

    const categoryDataMap = expenses.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        acc[curr.category] += curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryDataMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // sort so top is first

    const topCategory = categoryData.length > 0 ? categoryData[0] : null;

    // Monthly trends mapping past 6 months
    const monthlyTrends = useMemo(() => {
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const m = format(subMonths(new Date(), i), "yyyy-MM");
            const amt = expenses.filter(e => e.date.startsWith(m)).reduce((acc, curr) => acc + curr.amount, 0);
            trends.push({ name: format(subMonths(new Date(), i), "MMM"), total: amt });
        }
        return trends;
    }, [expenses]);

    // Used for Pie Chart colors
    const getBorderColorClass = (category: string) => {
        const cls = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "";
        // Simple extraction of hex equivalent for Recharts (since it's raw svg). 
        // Best approach for Recharts Pie in Tailwind is via mapped arrays.
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
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <h3 className="text-3xl font-bold text-foreground mt-1">₹{totalCurrentMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-sm">
                        {trend > 0 ? (
                            <div className="text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                                <TrendingUp size={14} /> +{trend.toFixed(1)}%
                            </div>
                        ) : (
                            <div className="text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                                <TrendingDown size={14} /> {trend.toFixed(1)}%
                            </div>
                        )}
                        <span className="text-muted-foreground ml-1">vs last month</span>
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

                {/* Monthly Trend Bar Chart */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Trend</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
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
