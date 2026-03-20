"use client";

import { useState } from "react";
import { Plus, Filter, Navigation, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useExpenses, Expense, ExpenseCategory } from "@/contexts/ExpensesContext";
import { CreateExpenseModal, CATEGORY_COLORS } from "./create-expense-modal";
import { ExpenseAnalytics } from "./expense-analytics";
import { format, parseISO } from "date-fns";

export function ExpenseDashboard() {
    const { expenses, deleteExpense } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>("All");
    const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), "yyyy-MM"));

    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
        const matchesMonth = filterMonth === "All" || expense.date.startsWith(filterMonth);
        return matchesCategory && matchesMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute available months for filter
    const availableMonths = Array.from(new Set(expenses.map(e => e.date.substring(0, 7)))).sort().reverse();
    if (!availableMonths.includes(format(new Date(), "yyyy-MM"))) {
        availableMonths.unshift(format(new Date(), "yyyy-MM"));
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                        Expense Tracker
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">Monitor your spending and analyze your finances.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-600/20 active:scale-95 hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
            <ExpenseAnalytics />

            {/* Expenses List Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="pl-3 pr-8 py-2 rounded-lg bg-muted/50 border border-border hover:border-slate-300 outline-none text-sm text-foreground appearance-none cursor-pointer"
                            >
                                <option value="All">All Time</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{format(parseISO(`${m}-01`), "MMMM yyyy")}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="pl-3 pr-8 py-2 rounded-lg bg-muted/50 border border-border hover:border-slate-300 outline-none text-sm text-foreground appearance-none cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {Object.keys(CATEGORY_COLORS).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {filteredExpenses.length > 0 ? (
                    <div className="space-y-3">
                        {filteredExpenses.map(expense => (
                            <div key={expense.id} className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${CATEGORY_COLORS[expense.category]}`}>
                                        {expense.category}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{expense.notes || "No notes provided"}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{format(parseISO(expense.date), "MMM d, yyyy")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-foreground">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setExpenseToEdit(expense)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteExpense(expense.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm">No expenses found for these filters.</p>
                    </div>
                )}
            </div>

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
